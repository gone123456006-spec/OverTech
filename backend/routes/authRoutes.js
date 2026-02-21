import express from 'express';
import { sendOTPController, verifyOTPController } from '../controllers/authController.js';
import { validateSendOTP, validateVerifyOTP } from '../middleware/validator.js';

const router = express.Router();

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to mobile number
 * @access  Public
 */
router.post('/send-otp', validateSendOTP, sendOTPController);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and return JWT token
 * @access  Public
 */
router.post('/verify-otp', validateVerifyOTP, verifyOTPController);

export default router;
