import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB, { closeDatabase, isDatabaseConnected } from './config/database.js';
import { validateEnv, logProductionConfig, isOriginAllowed } from './config/env.js';
import paymentRoutes from './routes/paymentRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { generalRateLimiter } from './middleware/rateLimiter.js';

dotenv.config();

validateEnv();
logProductionConfig();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const isProduction = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);

app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
}));

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (!isProduction) return callback(null, true);
        if (isOriginAllowed(origin)) return callback(null, true);
        console.warn(`CORS blocked origin: ${origin}`);
        return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(generalRateLimiter);

app.get('/', (req, res) => {
    res.json({
        message: 'OverTech API is running',
        version: '2.0.0',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: isDatabaseConnected() ? 'connected' : 'disconnected',
    });
});

app.get('/api/health', (req, res) => {
    const dbConnected = isDatabaseConnected();
    const healthy = !isProduction || dbConnected;

    res.status(healthy ? 200 : 503).json({
        status: healthy ? 'ok' : 'degraded',
        uptime: process.uptime(),
        database: dbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);

app.use(notFound);
app.use(errorHandler);

let server;

const startServer = async () => {
    const dbConnected = await connectDB();

    if (isProduction && !dbConnected) {
        console.error('❌ Cannot start production server without MongoDB.');
        process.exit(1);
    }

    server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 Server running on port ${PORT}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`💳 Payments: Razorpay enabled`);
        console.log(`🗄️  Database: ${dbConnected ? 'connected' : 'not connected'}\n`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`\n❌ Port ${PORT} is already in use.\n`);
            process.exit(1);
        }
        throw err;
    });
};

const shutdown = async (signal) => {
    console.log(`\n${signal} received: shutting down gracefully`);
    server?.close(async () => {
        await closeDatabase();
        console.log('HTTP server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();

export default app;
