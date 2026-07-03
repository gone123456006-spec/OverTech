import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../data/special-offers.json');

export async function readSpecialOffers() {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

export async function writeSpecialOffers(data) {
  const payload = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  return payload;
}
