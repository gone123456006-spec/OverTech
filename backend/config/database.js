import dns from 'dns';
import mongoose from 'mongoose';
import { getMongoUri, isPlaceholder, normalizeMongoUri } from './env.js';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;
const LOCAL_FALLBACK_URI = 'mongodb://127.0.0.1:27017/overtech';
const DEFAULT_DNS_SERVERS = ['8.8.8.8', '1.1.1.1', '8.8.4.4'];
const isProduction = process.env.NODE_ENV === 'production';

let memoryServer;

/** Windows/some networks block SRV DNS via system resolver; public DNS fixes mongodb+srv. */
function configureDnsForSrv(uri) {
    if (!uri.startsWith('mongodb+srv://')) return;

    const custom = process.env.MONGODB_DNS_SERVERS?.trim();
    const servers = custom
        ? custom.split(',').map((s) => s.trim()).filter(Boolean)
        : DEFAULT_DNS_SERVERS;

    dns.setServers(servers);
}

function resolveMongoUri() {
    const configured = getMongoUri();

    if (isProduction) {
        if (!configured || isPlaceholder(configured)) {
            throw new Error('MONGODB_URI is required in production');
        }
        return configured;
    }

    if (!configured || isPlaceholder(configured)) {
        console.warn('⚠️  MONGODB_URI is missing or still a placeholder.');
        console.warn(`   Using local fallback: ${LOCAL_FALLBACK_URI}`);
        return LOCAL_FALLBACK_URI;
    }

    return configured;
}

async function getConnectionUri() {
    const uri = resolveMongoUri();

    if (
        !isProduction &&
        process.env.MONGODB_DISABLED !== 'true' &&
        process.env.MONGODB_USE_MEMORY !== 'false' &&
        uri === LOCAL_FALLBACK_URI
    ) {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        if (!memoryServer) {
            memoryServer = await MongoMemoryServer.create();
            console.log('ℹ️  Started in-memory MongoDB for local development');
        }
        return memoryServer.getUri('overtech');
    }

    return uri;
}

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

let retryCount = 0;

const connectDB = async () => {
    if (process.env.MONGODB_DISABLED === 'true') {
        console.log('ℹ️  MongoDB disabled (MONGODB_DISABLED=true).');
        return false;
    }

    try {
        const uri = await getConnectionUri();
        configureDnsForSrv(uri);
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: isProduction ? 30000 : 10000,
            family: 4,
        });

        retryCount = 0;
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  MongoDB disconnected');
        });

        return true;
    } catch (error) {
        retryCount += 1;
        console.error('❌ MongoDB Connection Error:', error.message);

        if (retryCount < MAX_RETRIES) {
            console.log(`🔄 Retrying connection in ${RETRY_DELAY_MS / 1000} seconds... (${retryCount}/${MAX_RETRIES})`);
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
            return connectDB();
        }

        if (isProduction) {
            const hint = normalizeMongoUri(process.env.MONGODB_URI);
            if (/@cluster\.mongodb\.net/i.test(hint)) {
                console.error('   Tip: Replace cluster.mongodb.net with your Atlas hostname (cluster0.xxxxx.mongodb.net).');
            }
            console.error('❌ Fatal: could not connect to MongoDB in production.');
            return false;
        }

        console.warn('⚠️  MongoDB unavailable. Server continues without database.');
        return false;
    }
};

export const closeDatabase = async () => {
    await mongoose.connection.close();
    if (memoryServer) {
        await memoryServer.stop();
        memoryServer = null;
    }
};

export default connectDB;
