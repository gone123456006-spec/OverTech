import { useCallback, useEffect, useState } from 'react';
import {
  CATEGORY_CARDS_CACHE_KEY,
  CATEGORY_CARDS_UPDATED_EVENT,
  CATEGORY_CARDS_POLL_MS,
  fetchCategoryCards,
} from '../utils/categoryCards';
import {
  SPECIAL_OFFERS_CACHE_KEY,
  SPECIAL_OFFERS_UPDATED_EVENT,
  SPECIAL_OFFERS_POLL_MS,
  fetchSpecialOffers,
} from '../utils/specialOffers';
import {
  CONTENT_SYNC_POLL_MS,
  STOREFRONT_CACHE_KEY,
  STOREFRONT_UPDATED_EVENT,
  syncStorefrontCatalog,
} from '../utils/storefront';

/** Polls admin-managed content from the API (~1 min) and bumps tick for re-renders. */
export function useContentSync() {
  const [tick, setTick] = useState(0);
  const bump = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const loadAll = () => {
      syncStorefrontCatalog().finally(bump);
      fetchCategoryCards().catch(() => {}).finally(bump);
      fetchSpecialOffers().catch(() => {}).finally(bump);
    };

    loadAll();
    const interval = window.setInterval(loadAll, CONTENT_SYNC_POLL_MS);

    const onStorefront = () => bump();
    const onCategories = () => bump();
    const onOffers = () => bump();
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === STOREFRONT_CACHE_KEY ||
        e.key === CATEGORY_CARDS_CACHE_KEY ||
        e.key === SPECIAL_OFFERS_CACHE_KEY
      ) {
        bump();
      }
    };

    window.addEventListener(STOREFRONT_UPDATED_EVENT, onStorefront);
    window.addEventListener(CATEGORY_CARDS_UPDATED_EVENT, onCategories);
    window.addEventListener(SPECIAL_OFFERS_UPDATED_EVENT, onOffers);
    window.addEventListener('storage', onStorage);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener(STOREFRONT_UPDATED_EVENT, onStorefront);
      window.removeEventListener(CATEGORY_CARDS_UPDATED_EVENT, onCategories);
      window.removeEventListener(SPECIAL_OFFERS_UPDATED_EVENT, onOffers);
      window.removeEventListener('storage', onStorage);
    };
  }, [bump]);

  return tick;
}

export { CONTENT_SYNC_POLL_MS, CATEGORY_CARDS_POLL_MS, SPECIAL_OFFERS_POLL_MS };
