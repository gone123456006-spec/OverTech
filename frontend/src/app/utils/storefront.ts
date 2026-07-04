import { apiUrl, apiPut } from './api';
import type { AdminBanners, CustomProduct, InvoiceSettings, ProductOverride } from './storage';

export interface StorefrontPayload {
  banners: AdminBanners;
  productOverrides: ProductOverride[];
  customProducts: CustomProduct[];
  invoiceSettings?: InvoiceSettings;
  updatedAt?: string;
}

export const STOREFRONT_CACHE_KEY = 'storefront_cache';
export const STOREFRONT_UPDATED_EVENT = 'storefrontUpdated';
export const CONTENT_SYNC_POLL_MS = 60 * 1000;

const LEGACY_BANNERS_KEY = 'admin_banners';
const LEGACY_OVERRIDES_KEY = 'admin_product_overrides';
const LEGACY_CUSTOM_KEY = 'admin_custom_products';

export function getStorefrontCache(): StorefrontPayload {
  try {
    const raw = localStorage.getItem(STOREFRONT_CACHE_KEY);
    if (raw) {
      return JSON.parse(raw) as StorefrontPayload;
    }
  } catch {
    /* fall through */
  }

  return {
    banners: JSON.parse(localStorage.getItem(LEGACY_BANNERS_KEY) || '{}'),
    productOverrides: JSON.parse(localStorage.getItem(LEGACY_OVERRIDES_KEY) || '[]'),
    customProducts: JSON.parse(localStorage.getItem(LEGACY_CUSTOM_KEY) || '[]'),
    invoiceSettings: undefined,
  };
}

export function applyStorefrontCache(data: StorefrontPayload) {
  localStorage.setItem(STOREFRONT_CACHE_KEY, JSON.stringify(data));
  localStorage.setItem(LEGACY_BANNERS_KEY, JSON.stringify(data.banners || {}));
  localStorage.setItem(LEGACY_OVERRIDES_KEY, JSON.stringify(data.productOverrides || []));
  localStorage.setItem(LEGACY_CUSTOM_KEY, JSON.stringify(data.customProducts || []));
  window.dispatchEvent(new Event(STOREFRONT_UPDATED_EVENT));
}

export async function fetchStorefront(): Promise<StorefrontPayload> {
  const res = await fetch(apiUrl('/api/content/storefront'));
  if (!res.ok) {
    throw new Error('Failed to fetch storefront');
  }
  const data = (await res.json()) as StorefrontPayload;
  applyStorefrontCache(data);
  return data;
}

export async function saveStorefront(partial: Partial<StorefrontPayload>): Promise<StorefrontPayload> {
  const current = getStorefrontCache();
  const payload = {
    banners: partial.banners ?? current.banners ?? {},
    productOverrides: partial.productOverrides ?? current.productOverrides ?? [],
    customProducts: partial.customProducts ?? current.customProducts ?? [],
    invoiceSettings: partial.invoiceSettings ?? current.invoiceSettings,
  };

  applyStorefrontCache({ ...payload, updatedAt: new Date().toISOString() });

  const res = await apiPut<StorefrontPayload>('/api/content/storefront', payload, { auth: true });
  const data = res;

  applyStorefrontCache(data);
  return data;
}

export async function syncStorefrontCatalog(): Promise<void> {
  try {
    await fetchStorefront();
  } catch {
    /* keep cached data */
  }
}
