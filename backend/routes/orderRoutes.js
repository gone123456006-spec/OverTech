import express from 'express';
import { createShopOrder } from '../controllers/orderController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const orderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { message: 'Too many order requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/', orderLimiter, createShopOrder);

export default router;
