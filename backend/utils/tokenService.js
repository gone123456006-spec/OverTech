import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/constants.js';

/**
 * Generate JWT token
 * @param {string} userId - User's MongoDB _id
 * @param {string} mobile - User's mobile number
 * @returns {string} JWT token
 */
export const generateToken = (userId, mobile) => {
    return jwt.sign(
        { userId, mobile },
        JWT_CONFIG.SECRET,
        { expiresIn: JWT_CONFIG.EXPIRES_IN }
    );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token) => {
    return jwt.verify(token, JWT_CONFIG.SECRET);
};
