import { body, validationResult } from 'express-validator';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * Middleware to handle validation result
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: errors.array()[0].msg
        });
    }
    next();
};

/**
 * Validate send-otp request
 */
export const validateSendOTP = [
    body('mobile')
        .trim()
        .isLength({ min: 10, max: 10 })
        .withMessage('Mobile number must be exactly 10 digits')
        .isNumeric()
        .withMessage('Mobile number must contain only digits')
        .custom((val) => {
            // Basic Indian mobile validation: starts with 6-9
            if (!/^[6-9]\d{9}$/.test(val)) {
                throw new Error('Please enter a valid Indian mobile number');
            }
            return true;
        }),
    handleValidationErrors
];

/**
 * Validate verify-otp request
 */
export const validateVerifyOTP = [
    body('mobile')
        .trim()
        .isLength({ min: 10, max: 10 })
        .withMessage('Mobile number must be exactly 10 digits')
        .isNumeric()
        .withMessage('Mobile number must contain only digits'),

    body('otp')
        .trim()
        .isLength({ min: 4, max: 4 })
        .withMessage('OTP must be exactly 4 digits')
        .isNumeric()
        .withMessage('OTP must contain only digits'),

    handleValidationErrors
];

/**
 * Validate register/update-profile request
 */
export const validateRegister = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name must contain only letters and spaces'),

    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),

    handleValidationErrors
];

/**
 * Validate create-order request
 */
export const validateCreateOrder = [
    body('amount')
        .isNumeric()
        .withMessage('Amount must be a number')
        .custom((val) => {
            if (parseFloat(val) <= 0) throw new Error('Amount must be greater than 0');
            if (parseFloat(val) > 500000) throw new Error('Amount exceeds maximum limit of ₹5,00,000');
            return true;
        }),

    body('currency')
        .optional()
        .isIn(['INR'])
        .withMessage('Only INR currency is supported'),

    body('customerMobile')
        .trim()
        .isLength({ min: 10, max: 10 })
        .withMessage('Customer mobile must be exactly 10 digits')
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please enter a valid 10-digit Indian mobile number'),

    handleValidationErrors
];

/**
 * Validate verify-payment request
 */
export const validateVerifyPayment = [
    body('razorpayOrderId')
        .notEmpty()
        .withMessage('Razorpay Order ID is required')
        .isString()
        .trim(),

    body('razorpayPaymentId')
        .notEmpty()
        .withMessage('Razorpay Payment ID is required')
        .isString()
        .trim(),

    body('razorpaySignature')
        .notEmpty()
        .withMessage('Razorpay signature is required')
        .isString()
        .trim(),

    handleValidationErrors
];
