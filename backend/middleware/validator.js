import { body, validationResult } from 'express-validator';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * Validation middleware for send-otp endpoint
 */
export const validateSendOTP = [
    body('mobile')
        .trim()
        .isLength({ min: 10, max: 10 })
        .withMessage('Mobile number must be exactly 10 digits')
        .isNumeric()
        .withMessage('Mobile number must contain only digits'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: errors.array()[0].msg
            });
        }
        next();
    }
];

/**
 * Validation middleware for verify-otp endpoint
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

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: errors.array()[0].msg
            });
        }
        next();
    }
];
