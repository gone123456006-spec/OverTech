import { verifyToken } from '../utils/tokenService.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';

/**
 * Protect admin routes — JWT must contain role: 'admin'
 */
export const protectAdmin = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            message: ERROR_MESSAGES.NO_TOKEN,
        });
    }

    try {
        const token = header.split(' ')[1];
        const decoded = verifyToken(token);

        if (decoded.role !== 'admin') {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                message: 'Admin access required',
            });
        }

        req.admin = { role: 'admin' };
        next();
    } catch {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            message: ERROR_MESSAGES.UNAUTHORIZED,
        });
    }
};
