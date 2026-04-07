import Razorpay from 'razorpay';
import crypto from 'crypto';
import Transaction from '../models/Transaction.js';
import { HTTP_STATUS } from '../config/constants.js';

// Initialize Razorpay instance
const getRazorpayInstance = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay keys not configured. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
    }
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

/**
 * @route   POST /api/payment/create-order
 * @desc    Create a Razorpay order
 * @access  Public
 */
export const createOrder = async (req, res, next) => {
    try {
        const { amount, currency = 'INR', cartSnapshot = [], notes = {}, customerMobile, customerName, customerAddress } = req.body;

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: 'Invalid amount. Amount must be a positive number (in rupees).'
            });
        }

        if (amount > 500000) { // Max ₹5,00,000
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: 'Amount exceeds maximum limit of ₹5,00,000.'
            });
        }

        if (!customerMobile || typeof customerMobile !== 'string') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: 'Customer mobile number is required.'
            });
        }

        const normalizedMobile = customerMobile.trim();
        if (!/^[6-9]\d{9}$/.test(normalizedMobile)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: 'Please enter a valid 10-digit Indian mobile number.'
            });
        }

        const razorpay = getRazorpayInstance();
        const amountInPaise = Math.round(amount * 100); // Convert ₹ to paise

        const options = {
            amount: amountInPaise,
            currency,
            receipt: `rcpt_${Date.now()}`,
            notes: {
                customerMobile: normalizedMobile,
                ...(customerName ? { customerName: String(customerName).slice(0, 60) } : {}),
                ...(customerAddress ? { customerAddress } : {}),
                ...notes
            }
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // Save transaction record
        const transaction = await Transaction.create({
            user: null,
            razorpayOrderId: razorpayOrder.id,
            amount: amountInPaise,
            currency,
            status: 'created',
            cartSnapshot,
            notes: {
                customerMobile: normalizedMobile,
                ...(customerName ? { customerName: String(customerName).slice(0, 60) } : {}),
                ...(customerAddress ? { customerAddress } : {}),
                ...notes
            }
        });

        res.status(HTTP_STATUS.OK).json({
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            transactionId: transaction._id
        });

    } catch (error) {
        console.error('❌ Create order error:', error);
        next(error);
    }
};

/**
 * @route   POST /api/payment/verify
 * @desc    Verify Razorpay payment signature
 * @access  Public
 */
export const verifyPayment = async (req, res, next) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: 'Missing required payment verification fields.'
            });
        }

        // Verify HMAC-SHA256 signature
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        const body = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            // Update transaction as failed
            await Transaction.findOneAndUpdate(
                { razorpayOrderId },
                { status: 'failed', razorpayPaymentId }
            );
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: 'Payment signature verification failed. Payment may be fraudulent.'
            });
        }

        // Update transaction as paid
        const transaction = await Transaction.findOneAndUpdate(
            { razorpayOrderId },
            {
                razorpayPaymentId,
                razorpaySignature,
                status: 'paid'
            },
            { new: true }
        );

        if (!transaction) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                message: 'Transaction not found.'
            });
        }

        res.status(HTTP_STATUS.OK).json({
            message: 'Payment verified successfully',
            transactionId: transaction._id,
            status: 'paid'
        });

    } catch (error) {
        console.error('❌ Verify payment error:', error);
        next(error);
    }
};
