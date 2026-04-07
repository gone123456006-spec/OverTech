// HTTP Status Codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500
};

// Error Messages
export const ERROR_MESSAGES = {
    INVALID_MOBILE: 'Invalid mobile number',
    MOBILE_REQUIRED: 'Mobile number is required',
    OTP_REQUIRED: 'OTP is required',
    USER_NOT_FOUND: 'User not found',
    INVALID_OTP: 'Invalid OTP',
    OTP_EXPIRED: 'OTP has expired. Please request a new one.',
    SERVER_ERROR: 'Internal server error',
    UNAUTHORIZED: 'Not authorized, token failed',
    NO_TOKEN: 'Not authorized, no token',
    PAYMENT_FAILED: 'Payment verification failed',
    INVALID_SIGNATURE: 'Payment signature is invalid'
};

// Success Messages
export const SUCCESS_MESSAGES = {
    OTP_SENT: 'OTP sent successfully',
    OTP_VERIFIED: 'OTP verified successfully',
    LOGIN_SUCCESS: 'Login successful',
    PROFILE_UPDATED: 'Profile updated successfully',
    PAYMENT_CREATED: 'Payment order created successfully',
    PAYMENT_VERIFIED: 'Payment verified successfully'
};

// OTP Configuration
export const OTP_CONFIG = {
    LENGTH: 6,
    EXPIRES_IN_MINUTES: parseInt(process.env.OTP_EXPIRES_IN) || 5,
    MAX_ATTEMPTS: 5,
    RESEND_COOLDOWN_MINUTES: 10
};

// JWT Configuration
export const JWT_CONFIG = {
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    SECRET: process.env.JWT_SECRET || 'change_this_in_production'
};

// Razorpay Configuration
export const RAZORPAY_CONFIG = {
    CURRENCY: 'INR',
    MAX_AMOUNT: 500000 // ₹5,00,000 max
};
