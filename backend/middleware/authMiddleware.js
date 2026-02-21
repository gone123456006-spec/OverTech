import { verifyToken } from '../utils/tokenService.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import User from '../models/User.js';

/**
 * Protect routes - JWT authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = verifyToken(token);

            // Get user from token (exclude password if you add it later)
            req.user = await User.findById(decoded.userId).select('-otp -otpExpires');

            if (!req.user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    message: ERROR_MESSAGES.USER_NOT_FOUND
                });
            }

            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                message: ERROR_MESSAGES.UNAUTHORIZED
            });
        }
    } else {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            message: ERROR_MESSAGES.NO_TOKEN
        });
    }
};
