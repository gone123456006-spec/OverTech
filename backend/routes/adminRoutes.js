import express from 'express';
import { adminLogin, adminMe } from '../controllers/adminController.js';
import {
    listAdminOrders,
    updateAdminOrderStatus,
    cancelAdminOrder,
} from '../controllers/orderController.js';
import { protectAdmin } from '../middleware/adminAuth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many login attempts. Try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/login', loginLimiter, adminLogin);
router.get('/me', protectAdmin, adminMe);
router.get('/orders', protectAdmin, listAdminOrders);
router.patch('/orders/:orderId/status', protectAdmin, updateAdminOrderStatus);
router.post('/orders/:orderId/cancel', protectAdmin, cancelAdminOrder);

export default router;
