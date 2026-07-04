import { readStorefront, writeStorefront } from '../services/storefrontStore.js';

export async function getStorefront(req, res) {
    try {
        const data = await readStorefront();
        res.json(data);
    } catch (error) {
        const message = process.env.NODE_ENV === 'production'
            ? 'Failed to load storefront'
            : error.message;
        res.status(500).json({ message });
    }
}

export async function updateStorefront(req, res) {
    try {
        const { banners, productOverrides, customProducts, invoiceSettings } = req.body;

        if (banners !== undefined && typeof banners !== 'object') {
            return res.status(400).json({ message: 'banners must be an object' });
        }
        if (productOverrides !== undefined && !Array.isArray(productOverrides)) {
            return res.status(400).json({ message: 'productOverrides must be an array' });
        }
        if (customProducts !== undefined && !Array.isArray(customProducts)) {
            return res.status(400).json({ message: 'customProducts must be an array' });
        }
        if (invoiceSettings !== undefined && typeof invoiceSettings !== 'object') {
            return res.status(400).json({ message: 'invoiceSettings must be an object' });
        }

        const current = await readStorefront();
        const saved = await writeStorefront({
            banners: banners ?? current.banners ?? {},
            productOverrides: productOverrides ?? current.productOverrides ?? [],
            customProducts: customProducts ?? current.customProducts ?? [],
            invoiceSettings: invoiceSettings ?? current.invoiceSettings,
        });

        res.json(saved);
    } catch (error) {
        res.status(400).json({ message: error.message || 'Failed to save storefront' });
    }
}
