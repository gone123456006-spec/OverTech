import crypto from 'crypto';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import { generateAdminToken } from '../utils/tokenService.js';

function safeCompare(a, b) {
    if (!a || !b) return false;
    const bufA = Buffer.from(String(a));
    const bufB = Buffer.from(String(b));
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * @route   POST /api/admin/login
 * @desc    Admin login with password from backend env
 * @access  Public
 */
export const adminLogin = async (req, res, next) => {
    try {
        const { password } = req.body;

        if (!password || typeof password !== 'string') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: 'Password is required',
            });
        }

        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) {
            console.error('ADMIN_PASSWORD is not configured');
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                message: 'Admin login is not configured',
            });
        }

        if (!safeCompare(password, adminPassword)) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                message: 'Invalid admin password',
            });
        }

        const token = generateAdminToken();

        res.status(HTTP_STATUS.OK).json({
            message: 'Login successful',
            token,
            role: 'admin',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/admin/me
 * @desc    Verify admin session
 * @access  Admin
 */
export const adminMe = (req, res) => {
    res.status(HTTP_STATUS.OK).json({ role: 'admin', authenticated: true });
};
