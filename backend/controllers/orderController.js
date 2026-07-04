import ShopOrder from '../models/ShopOrder.js';
import Transaction from '../models/Transaction.js';
import { HTTP_STATUS } from '../config/constants.js';
import { isDatabaseConnected } from '../config/database.js';

function toClientOrder(doc) {
    const o = doc.toObject ? doc.toObject() : doc;
    return {
        id: o.orderId,
        date: o.date instanceof Date ? o.date.toISOString() : o.date,
        items: o.items,
        address: { ...o.address, id: o.address?.mobile || 'addr' },
        paymentMethod: o.paymentMethod,
        status: o.status,
        paymentStatus: o.paymentStatus,
        razorpayOrderId: o.razorpayOrderId || undefined,
        razorpayPaymentId: o.razorpayPaymentId || undefined,
        acceptedAt: o.acceptedAt?.toISOString?.() || o.acceptedAt,
        outForDeliveryAt: o.outForDeliveryAt?.toISOString?.() || o.outForDeliveryAt,
        deliveredAt: o.deliveredAt?.toISOString?.() || o.deliveredAt,
        cancelledAt: o.cancelledAt?.toISOString?.() || o.cancelledAt,
        cancellationReason: o.cancellationReason,
        refundStatus: o.refundStatus,
        deliveryAgentName: o.deliveryAgentName,
        deliveryAgentPhone: o.deliveryAgentPhone,
        total: o.total,
    };
}

function validateOrderPayload(body) {
    const { items, address, paymentMethod, total } = body;

    if (!Array.isArray(items) || items.length === 0) {
        return 'Order must include at least one item';
    }

    for (const item of items) {
        if (!item?.productId || !item?.quantity || item.quantity < 1) {
            return 'Invalid order items';
        }
    }

    if (!address?.name || !address?.mobile || !address?.house || !address?.city || !address?.state || !address?.pincode) {
        return 'Complete delivery address is required';
    }

    if (!/^[6-9]\d{9}$/.test(String(address.mobile).trim())) {
        return 'Invalid mobile number in address';
    }

    if (!/^\d{6}$/.test(String(address.pincode).trim())) {
        return 'Pincode must be exactly 6 digits';
    }

    if (!['cod', 'razorpay'].includes(paymentMethod)) {
        return 'Invalid payment method';
    }

    if (typeof total !== 'number' || total <= 0 || total > 500000) {
        return 'Invalid order total';
    }

    return null;
}

/**
 * @route   POST /api/orders
 * @desc    Place order (COD or Razorpay after verified payment)
 * @access  Public
 */
export const createShopOrder = async (req, res, next) => {
    try {
        if (!isDatabaseConnected()) {
            return res.status(503).json({
                message: 'Order service temporarily unavailable. Please try again.',
            });
        }

        const validationError = validateOrderPayload(req.body);
        if (validationError) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: validationError });
        }

        const { items, address, paymentMethod, total, razorpayOrderId, orderId: clientOrderId } = req.body;

        let paymentStatus = 'pending';
        let razorpayPaymentId = null;
        let verifiedRazorpayOrderId = null;

        if (paymentMethod === 'razorpay') {
            if (!razorpayOrderId || typeof razorpayOrderId !== 'string') {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    message: 'Razorpay order ID is required for online payment',
                });
            }

            const transaction = await Transaction.findOne({
                razorpayOrderId,
                status: 'paid',
            });

            if (!transaction) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    message: 'Payment not verified. Complete Razorpay payment before placing order.',
                });
            }

            const existingPaidOrder = await ShopOrder.findOne({ razorpayOrderId });
            if (existingPaidOrder) {
                return res.status(HTTP_STATUS.OK).json({
                    message: 'Order already placed for this payment',
                    order: toClientOrder(existingPaidOrder),
                });
            }

            paymentStatus = 'paid';
            razorpayPaymentId = transaction.razorpayPaymentId;
            verifiedRazorpayOrderId = razorpayOrderId;
        }

        const orderId = clientOrderId || `ORD${Date.now().toString().slice(-8)}`;

        const existing = await ShopOrder.findOne({ orderId });
        if (existing) {
            return res.status(HTTP_STATUS.OK).json({
                message: 'Order already exists',
                order: toClientOrder(existing),
            });
        }

        const order = await ShopOrder.create({
            orderId,
            items,
            address: {
                name: String(address.name).slice(0, 80),
                mobile: String(address.mobile).trim(),
                house: String(address.house).slice(0, 200),
                city: String(address.city).slice(0, 80),
                state: String(address.state).slice(0, 80),
                pincode: String(address.pincode).trim().slice(0, 6),
            },
            paymentMethod,
            paymentStatus,
            razorpayOrderId: verifiedRazorpayOrderId,
            razorpayPaymentId,
            total,
            status: 'pending',
            refundStatus: 'not_required',
        });

        if (verifiedRazorpayOrderId) {
            await Transaction.findOneAndUpdate(
                { razorpayOrderId: verifiedRazorpayOrderId },
                { $set: { 'notes.shopOrderId': orderId } }
            );
        }

        res.status(HTTP_STATUS.CREATED).json({
            message: 'Order placed successfully',
            order: toClientOrder(order),
        });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: 'Duplicate order. Please refresh and try again.',
            });
        }
        next(error);
    }
};

/**
 * @route   GET /api/admin/orders
 * @desc    List all orders for admin
 * @access  Admin
 */
export const listAdminOrders = async (req, res, next) => {
    try {
        const orders = await ShopOrder.find().sort({ date: -1 }).limit(500);
        res.status(HTTP_STATUS.OK).json({
            orders: orders.map(toClientOrder),
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PATCH /api/admin/orders/:orderId/status
 * @desc    Update fulfillment status
 * @access  Admin
 */
export const updateAdminOrderStatus = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const allowed = ['pending', 'accepted', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!allowed.includes(status)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid status' });
        }

        const order = await ShopOrder.findOne({ orderId });
        if (!order) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Order not found' });
        }

        order.status = status;
        const now = new Date();

        if (status === 'accepted') order.acceptedAt = now;
        if (status === 'out_for_delivery') order.outForDeliveryAt = now;
        if (status === 'delivered') {
            order.deliveredAt = now;
            if (order.paymentMethod === 'cod') {
                order.paymentStatus = 'paid';
            }
        }

        await order.save();

        res.status(HTTP_STATUS.OK).json({
            message: 'Order updated',
            order: toClientOrder(order),
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/admin/orders/:orderId/cancel
 * @desc    Cancel order
 * @access  Admin
 */
export const cancelAdminOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { reason = 'Cancelled by admin' } = req.body;

        const order = await ShopOrder.findOne({ orderId });
        if (!order) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Order not found' });
        }

        order.status = 'cancelled';
        order.cancelledAt = new Date();
        order.cancellationReason = String(reason).slice(0, 500);

        if (order.paymentStatus === 'paid') {
            order.paymentStatus = 'refunded';
            order.refundStatus = 'pending';
        } else {
            order.refundStatus = 'not_required';
        }

        await order.save();

        res.status(HTTP_STATUS.OK).json({
            message: 'Order cancelled',
            order: toClientOrder(order),
        });
    } catch (error) {
        next(error);
    }
};
