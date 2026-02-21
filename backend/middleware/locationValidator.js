import { body, validationResult } from 'express-validator';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * Validation middleware for coordinates
 */
export const validateCoordinates = [
    body('latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),

    body('longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),

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
 * Validation middleware for address
 */
export const validateAddress = [
    body('address')
        .trim()
        .notEmpty()
        .withMessage('Address is required')
        .isLength({ min: 10 })
        .withMessage('Address must be at least 10 characters'),

    body('city')
        .trim()
        .notEmpty()
        .withMessage('City is required'),

    body('pincode')
        .trim()
        .notEmpty()
        .withMessage('Pincode is required')
        .isLength({ min: 6, max: 6 })
        .withMessage('Pincode must be 6 digits'),

    body('type')
        .optional()
        .isIn(['home', 'work', 'other'])
        .withMessage('Type must be home, work, or other'),

    body('latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Valid latitude is required'),

    body('longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Valid longitude is required'),

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
