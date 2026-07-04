import { readCategoryCards, writeCategoryCards } from '../services/categoryCardsStore.js';

const DEFAULT_IMAGES = {
    tech: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    jewellery: '/assets/images/jewellery-software-hero.png',
    food: 'https://images.pexels.com/photos/264188/pexels-photo-264188.jpeg?auto=compress&cs=tinysrgb&w=800',
};

const LEGACY_BROKEN_IMAGE_PARTS = [
    'photo-1718871186381',
    'photo-1610636996379',
    'photo-1515562141207',
    'photo-1542838132',
];

function normalizeCategoryImage(slug, image) {
    const fallback = DEFAULT_IMAGES[slug] || '';
    const trimmed = String(image || '').trim();
    if (!trimmed) return fallback;
    if (LEGACY_BROKEN_IMAGE_PARTS.some((part) => trimmed.includes(part))) return fallback;
    return trimmed;
}

function normalizeCategories(categories) {
    return (categories || []).map((category) => ({
        ...category,
        image: normalizeCategoryImage(category.slug, category.image),
    }));
}

function slugify(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function validateCategory(category, index) {
    if (!category || typeof category !== 'object') {
        throw new Error(`Category at index ${index} must be an object`);
    }
    if (!category.id || typeof category.id !== 'string') {
        throw new Error(`Category at index ${index} requires a string id`);
    }
    if (!category.slug || typeof category.slug !== 'string') {
        throw new Error(`Category ${category.id} requires a slug`);
    }
    if (!category.name || typeof category.name !== 'string') {
        throw new Error(`Category ${category.id} requires a name`);
    }
    if (!category.image || typeof category.image !== 'string') {
        throw new Error(`Category ${category.id} requires an image URL`);
    }
}

export async function getCategoryCards(req, res) {
    try {
        const data = await readCategoryCards();
        res.json({
            ...data,
            categories: normalizeCategories(data.categories),
        });
    } catch (error) {
        const message = process.env.NODE_ENV === 'production'
            ? 'Failed to load category cards'
            : error.message;
        res.status(500).json({ message });
    }
}

export async function updateCategoryCards(req, res) {
    try {
        const { categories } = req.body;
        if (!Array.isArray(categories)) {
            return res.status(400).json({ message: 'categories must be an array' });
        }

        categories.forEach((category, index) => validateCategory(category, index));

        const slugs = categories.map((c) => slugify(c.slug));
        if (new Set(slugs).size !== slugs.length) {
            return res.status(400).json({ message: 'Each category must have a unique slug' });
        }

        const normalized = categories.map((category, index) => ({
            id: category.id,
            slug: slugify(category.slug),
            name: category.name.trim(),
            description: (category.description || '').trim(),
            image: category.image.trim(),
            sortOrder: Number.isFinite(category.sortOrder) ? category.sortOrder : index,
            active: category.active !== false,
        }));

        const saved = await writeCategoryCards({ categories: normalized });
        res.json(saved);
    } catch (error) {
        res.status(400).json({ message: error.message || 'Failed to save category cards' });
    }
}
