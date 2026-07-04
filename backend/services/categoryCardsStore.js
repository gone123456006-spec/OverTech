import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import SiteContent from '../models/SiteContent.js';
import { isDatabaseConnected } from '../config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../data/category-cards.json');
const CONTENT_KEY = 'category-cards';

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
            categories: doc.data.categories || [],
            updatedAt: doc.updatedAt?.toISOString?.() || doc.updatedAt,
        };
    }

    const seed = await readFromFile();
    await SiteContent.findOneAndUpdate(
        { key: CONTENT_KEY },
        { data: { categories: seed.categories } },
        { upsert: true, new: true }
    );
    return {
        categories: seed.categories,
        updatedAt: seed.updatedAt || new Date().toISOString(),
    };
}

async function writeToDatabase(data) {
    const doc = await SiteContent.findOneAndUpdate(
        { key: CONTENT_KEY },
        { data: { categories: data.categories } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return {
        categories: doc.data.categories,
        updatedAt: doc.updatedAt.toISOString(),
    };
}

function useDatabase() {
    return isDatabaseConnected() && mongoose.connection.readyState === 1;
}

export async function readCategoryCards() {
    if (useDatabase()) {
        return readFromDatabase();
    }
    return readFromFile();
}

export async function writeCategoryCards(data) {
    if (useDatabase()) {
        return writeToDatabase(data);
    }
    return writeToFile(data);
}
