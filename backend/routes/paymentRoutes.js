import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { validateCreateOrder, validateVerifyPayment } from '../middleware/validator.js';
import { paymentRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/payment/create-order
 * Create a Razorpay order
 */
router.post('/create-order', paymentRateLimiter, validateCreateOrder, createOrder);

/**
 * POST /api/payment/verify
 * Verify Razorpay payment signature
 */
router.post('/verify', validateVerifyPayment, verifyPayment);

export default router;
