import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import SiteContent from '../models/SiteContent.js';
import { isDatabaseConnected } from '../config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../data/storefront.json');
const CONTENT_KEY = 'storefront';

async function readFromFile() {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
}

async function writeToFile(data) {
    const payload = {
        ...data,
        updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    return payload;
}

async function readFromDatabase() {
    const doc = await SiteContent.findOne({ key: CONTENT_KEY }).lean();
    if (doc?.data) {
        return {
            banners: doc.data.banners || {},
            productOverrides: doc.data.productOverrides || [],
            customProducts: doc.data.customProducts || [],
            invoiceSettings: doc.data.invoiceSettings || undefined,
            updatedAt: doc.updatedAt?.toISOString?.() || doc.updatedAt,
        };
    }

    const seed = await readFromFile();
    await SiteContent.findOneAndUpdate(
        { key: CONTENT_KEY },
        {
            data: {
                banners: seed.banners || {},
                productOverrides: seed.productOverrides || [],
                customProducts: seed.customProducts || [],
                invoiceSettings: seed.invoiceSettings,
            },
        },
        { upsert: true, new: true }
    );
    return {
        banners: seed.banners || {},
        productOverrides: seed.productOverrides || [],
        customProducts: seed.customProducts || [],
        invoiceSettings: seed.invoiceSettings,
        updatedAt: seed.updatedAt || new Date().toISOString(),
    };
}

async function writeToDatabase(data) {
    const doc = await SiteContent.findOneAndUpdate(
        { key: CONTENT_KEY },
        {
            data: {
                banners: data.banners || {},
                productOverrides: data.productOverrides || [],
                customProducts: data.customProducts || [],
                invoiceSettings: data.invoiceSettings,
            },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return {
        banners: doc.data.banners || {},
        productOverrides: doc.data.productOverrides || [],
        customProducts: doc.data.customProducts || [],
        invoiceSettings: doc.data.invoiceSettings,
        updatedAt: doc.updatedAt.toISOString(),
    };
}

function useDatabase() {
    return isDatabaseConnected() && mongoose.connection.readyState === 1;
}

export async function readStorefront() {
    if (useDatabase()) {
        return readFromDatabase();
    }
    return readFromFile();
}

export async function writeStorefront(data) {
    if (useDatabase()) {
        return writeToDatabase(data);
    }
    return writeToFile(data);
}
