const PLACEHOLDER_PATTERNS = [
    /<username>/i,
    /<password>/i,
    /xxxxx/i,
    /YOUR_/i,
    /cluster0\.xxxxx/,
    /USERNAME/,
    /PASSWORD/,
    /@cluster\.mongodb\.net/i,
];

/** Strip accidental "MONGODB_URI=" prefix from copy-paste mistakes. */
export function normalizeMongoUri(raw) {
    if (!raw) return '';
    let uri = raw.trim();
    while (uri.startsWith('MONGODB_URI=')) {
        uri = uri.slice('MONGODB_URI='.length).trim();
    }
    return uri;
}

export function getMongoUri() {
    return normalizeMongoUri(process.env.MONGODB_URI);
}

export function isPlaceholder(value) {
    if (!value) return true;
    const uri = normalizeMongoUri(value);
    return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(uri));
}

export function getMongoUriErrors(uri) {
    const errors = [];
    const normalized = normalizeMongoUri(uri);

    if (!normalized) {
        errors.push('MONGODB_URI is empty');
        return errors;
    }

    if (rawHasDuplicateKey(uri)) {
        errors.push(
            'MONGODB_URI was pasted with a duplicate "MONGODB_URI=" prefix. In Render, set only the connection string value.'
        );
    }

    if (/@cluster\.mongodb\.net/i.test(normalized)) {
        errors.push(
            'MONGODB_URI uses placeholder host "cluster.mongodb.net". In Atlas → Connect → Drivers, copy the real hostname (e.g. cluster0.ab12cd.mongodb.net).'
        );
    }

    if (!normalized.startsWith('mongodb://') && !normalized.startsWith('mongodb+srv://')) {
        errors.push('MONGODB_URI must start with mongodb:// or mongodb+srv://');
    }

    return errors;
}

function rawHasDuplicateKey(raw) {
    return typeof raw === 'string' && raw.trim().startsWith('MONGODB_URI=');
}

function normalizeOrigin(origin) {
    return origin.trim().replace(/\/$/, '');
}

export function getAllowedOrigins() {
    const raw = process.env.FRONTEND_URL || '';
    return raw
        .split(',')
        .map(normalizeOrigin)
        .filter(Boolean);
}

export function logProductionConfig() {
    if (process.env.NODE_ENV !== 'production') return;

    const mongoUri = getMongoUri();
    const hostMatch = mongoUri.match(/@([^/?]+)/);
    const mongoHost = hostMatch?.[1] || '(not set)';

    console.log('📋 Production config:');
    console.log(`   • MongoDB host: ${mongoHost}`);
    console.log(`   • CORS origins: ${getAllowedOrigins().join(', ') || '(none)'}`);
    console.log(`   • Razorpay: ${process.env.RAZORPAY_KEY_ID ? 'configured' : 'missing'}`);
}

export function validateEnv() {
    const isProduction = process.env.NODE_ENV === 'production';
    const errors = [];

    if (isProduction) {
        const mongoErrors = getMongoUriErrors(process.env.MONGODB_URI);
        if (mongoErrors.length > 0) {
            errors.push(...mongoErrors);
        } else if (isPlaceholder(getMongoUri())) {
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
