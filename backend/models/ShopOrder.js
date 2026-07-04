import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        mobile: { type: String, required: true },
        house: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
    },
    { _id: false }
);

const itemSchema = new mongoose.Schema(
    {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const shopOrderSchema = new mongoose.Schema(
    {
        orderId: { type: String, required: true, unique: true, index: true },
        date: { type: Date, default: Date.now },
        items: { type: [itemSchema], required: true },
        address: { type: addressSchema, required: true },
        paymentMethod: { type: String, enum: ['cod', 'razorpay'], required: true },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'out_for_delivery', 'delivered', 'cancelled'],
            default: 'pending',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'refunded'],
            default: 'pending',
        },
        razorpayOrderId: { type: String, default: null },
        razorpayPaymentId: { type: String, default: null },
        total: { type: Number, required: true, min: 0 },
        acceptedAt: Date,
        outForDeliveryAt: Date,
        deliveredAt: Date,
        cancelledAt: Date,
        cancellationReason: String,
        refundStatus: {
            type: String,
            enum: ['not_required', 'pending', 'processed'],
            default: 'not_required',
        },
        deliveryAgentName: { type: String, default: 'Rider Team' },
        deliveryAgentPhone: { type: String, default: '+91 90000 00000' },
    },
    { timestamps: true }
);

export default mongoose.models.ShopOrder || mongoose.model('ShopOrder', shopOrderSchema);
