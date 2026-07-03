const PLACEHOLDER_PATTERNS = [
    /<username>/i,
    /<password>/i,
    /xxxxx/i,
    /YOUR_/i,
    /cluster0\.xxxxx/,
    /USERNAME/,
    /PASSWORD/,
];

export function isPlaceholder(value) {
    if (!value) return true;
    return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
}

export function getAllowedOrigins() {
    const raw = process.env.FRONTEND_URL || '';
    return raw
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
}

export function validateEnv() {
    const isProduction = process.env.NODE_ENV === 'production';
    const errors = [];

    if (isProduction) {
        if (isPlaceholder(process.env.MONGODB_URI)) {
            errors.push('MONGODB_URI must be set to a valid MongoDB Atlas connection string');
        }
        if (isPlaceholder(process.env.RAZORPAY_KEY_ID)) {
            errors.push('RAZORPAY_KEY_ID must be set');
        }
        if (isPlaceholder(process.env.RAZORPAY_KEY_SECRET)) {
            errors.push('RAZORPAY_KEY_SECRET must be set');
        }
        if (getAllowedOrigins().length === 0) {
            errors.push('FRONTEND_URL must be set (your deployed frontend URL, comma-separated for multiple)');
        }
    }

    if (errors.length > 0) {
        console.error('\n❌ Environment configuration error:\n');
        errors.forEach((err) => console.error(`   • ${err}`));
        console.error('\nSet these in Render Dashboard → Environment.\n');
        process.exit(1);
    }
}
