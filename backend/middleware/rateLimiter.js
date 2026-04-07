import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

/**
 * OTP Rate Limiter
 * Max 3 OTP requests per IP per 10 minutes
 * Prevents OTP spam and SMS cost abuse
 */
export const otpRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3,
    keyGenerator: (req) => {
        // Rate limit by mobile number if available, otherwise fall back to IP
        // ipKeyGenerator handles IPv6 addresses correctly
        return req.body?.mobile || ipKeyGenerator(req);
    },
    message: {
        success: false,
        message: 'Too many OTP requests. Please wait 10 minutes before requesting a new OTP.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'test'
});

/**
 * General API Rate Limiter
 * Max 100 requests per IP per 15 minutes
 */
export const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Payment Rate Limiter
 * Max 10 payment requests per IP per 15 minutes
 */
export const paymentRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Too many payment requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});
