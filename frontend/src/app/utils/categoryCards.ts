import { apiUrl, apiPut } from './api';
import type { SyntheticEvent } from 'react';

export interface CategoryCard {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  sortOrder: number;
  active: boolean;
}

export interface CategoryCardsPayload {
  categories: CategoryCard[];
  updatedAt?: string;
}

export const CATEGORY_CARDS_CACHE_KEY = 'admin_category_cards_cache';
export const CATEGORY_CARDS_UPDATED_EVENT = 'categoryCardsUpdated';
export const CATEGORY_CARDS_POLL_MS = 60 * 1000;

export const DEFAULT_CATEGORY_CARDS: CategoryCard[] = [
  {
    id: 'cat-tech',
    slug: 'tech',
    name: 'Tech',
    description: 'Latest gadgets & devices',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    sortOrder: 0,
    active: true,
  },
  {
    id: 'cat-jewellery',
    slug: 'jewellery',
    name: 'Jewellery',
    description: 'Elegant accessories',
    image: '/assets/images/jewellery-software-hero.png',
    sortOrder: 1,
    active: true,
  },
  {
    id: 'cat-food',
    slug: 'food',
    name: 'Food',
    description: 'Fresh & organic',
    image: 'https://images.pexels.com/photos/264188/pexels-photo-264188.jpeg?auto=compress&cs=tinysrgb&w=800',
    sortOrder: 2,
    active: true,
  },
];

const DEFAULT_BY_SLUG = new Map(DEFAULT_CATEGORY_CARDS.map((c) => [c.slug, c]));

const LEGACY_BROKEN_IMAGE_PARTS = [
  'photo-1718871186381',
  'photo-1610636996379',
  'photo-1515562141207',
];

const CATEGORY_IMAGE_FALLBACKS: Record<string, string[]> = {
  tech: [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
  ],
  jewellery: [
    '/assets/images/jewellery-software-hero.png',
    'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  food: [
    'https://images.pexels.com/photos/264188/pexels-photo-264188.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1300975/pexels-photo-1300975.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
};

export function getDefaultCategoryImage(slug: string): string {
  return DEFAULT_BY_SLUG.get(slug)?.image ?? '';
}

export function getCategoryImageFallbacks(slug: string): string[] {
  const primary = getDefaultCategoryImage(slug);
  const extras = CATEGORY_IMAGE_FALLBACKS[slug] ?? [];
  return [...new Set([primary, ...extras].filter(Boolean))];
}

export function handleCategoryImageError(
  event: SyntheticEvent<HTMLImageElement>,
  slug: string
) {
  const img = event.currentTarget;
  const fallbacks = getCategoryImageFallbacks(slug);
  const tried = Number(img.dataset.fallbackIndex ?? -1);
  const next = tried + 1;
  if (next < fallbacks.length) {
    img.dataset.fallbackIndex = String(next);
    img.src = fallbacks[next];
  }
}

function resolveCategoryImage(category: CategoryCard): string {
  const fallback = getDefaultCategoryImage(category.slug);
  const image = category.image?.trim() || '';
  if (!image) return fallback;
  if (LEGACY_BROKEN_IMAGE_PARTS.some((part) => image.includes(part))) return fallback;
  if (category.slug === 'jewellery' && image.includes('unsplash.com')) return fallback;
  if (category.slug === 'food' && image.includes('unsplash.com')) return fallback;
  return image;
}

function applyDefaultImages(categories: CategoryCard[]): CategoryCard[] {
  return categories.map((category) => ({
    ...category,
    image: resolveCategoryImage(category),
  }));
}

export function newCategoryId() {
  return `cat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function sortActiveCategories(categories: CategoryCard[]) {
  return categories
    .filter((c) => c.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCachedCategoryCards(): CategoryCard[] {
  try {
    const raw = localStorage.getItem(CATEGORY_CARDS_CACHE_KEY);
    if (!raw) return DEFAULT_CATEGORY_CARDS;
    const parsed = JSON.parse(raw) as CategoryCardsPayload | CategoryCard[];
    const categories = Array.isArray(parsed)
      ? parsed
      : parsed.categories?.length
        ? parsed.categories
        : DEFAULT_CATEGORY_CARDS;
    return applyDefaultImages(categories);
  } catch {
    return DEFAULT_CATEGORY_CARDS;
  }
}

export function cacheCategoryCards(categories: CategoryCard[], updatedAt?: string) {
  localStorage.setItem(
    CATEGORY_CARDS_CACHE_KEY,
    JSON.stringify({ categories, updatedAt: updatedAt || new Date().toISOString() })
  );
  window.dispatchEvent(new Event(CATEGORY_CARDS_UPDATED_EVENT));
}

export function getCategoryLabel(slug: string): string {
  const match = getCachedCategoryCards().find((c) => c.slug === slug);
  if (match) return match.name;
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export async function fetchCategoryCards(): Promise<CategoryCardsPayload> {
  const res = await fetch(apiUrl('/api/content/category-cards'));
  if (!res.ok) {
    throw new Error('Failed to fetch category cards');
  }
  const data = (await res.json()) as CategoryCardsPayload;
  cacheCategoryCards(applyDefaultImages(data.categories), data.updatedAt);
  return { ...data, categories: applyDefaultImages(data.categories) };
}

export async function saveCategoryCards(categories: CategoryCard[]): Promise<CategoryCardsPayload> {
  const data = await apiPut<CategoryCardsPayload>(
    '/api/content/category-cards',
    { categories },
    { auth: true }
  );
  cacheCategoryCards(data.categories, data.updatedAt);
  return data;
}
