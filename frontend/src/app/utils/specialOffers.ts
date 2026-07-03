export type SpecialOfferKind = 'card' | 'tag';

export interface SpecialOffer {
  id: string;
  kind: SpecialOfferKind;
  title: string;
  price: string;
  image?: string;
  subtitle?: string;
  sortOrder: number;
  active: boolean;
  whatsappPhone?: string;
}

export interface SpecialOffersPayload {
  offers: SpecialOffer[];
  updatedAt?: string;
}

export const SPECIAL_OFFERS_CACHE_KEY = 'admin_special_offers_cache';
export const SPECIAL_OFFERS_UPDATED_EVENT = 'specialOffersUpdated';
export const SPECIAL_OFFERS_POLL_MS = 2 * 60 * 1000;

const DEFAULT_WHATSAPP = '917991163225';

export const DEFAULT_SPECIAL_OFFERS: SpecialOffer[] = [
  {
    id: 'offer-1',
    kind: 'card',
    title: 'Website Designing',
    price: '4,999/-',
    image: '/assets/images/website_designing_card.png',
    sortOrder: 0,
    active: true,
    whatsappPhone: DEFAULT_WHATSAPP,
  },
  {
    id: 'offer-2',
    kind: 'card',
    title: 'Yearly Package',
    price: '2,999/-',
    image: '/assets/images/digital_marketing_package.png',
    sortOrder: 1,
    active: true,
    whatsappPhone: DEFAULT_WHATSAPP,
  },
  {
    id: 'offer-3',
    kind: 'card',
    title: 'HIK VISION',
    price: '14,999/-',
    image: '/assets/images/hikvision_cctv_kit.png',
    sortOrder: 2,
    active: true,
    whatsappPhone: DEFAULT_WHATSAPP,
  },
  {
    id: 'offer-4',
    kind: 'card',
    title: 'Thermal Printer',
    price: '8,999/-',
    image: '/assets/images/thermal_billing_printer_card.png',
    sortOrder: 3,
    active: true,
    whatsappPhone: DEFAULT_WHATSAPP,
  },
  {
    id: 'offer-5',
    kind: 'tag',
    title: 'Voice Calling',
    price: '200/-',
    subtitle: '1000 ONLY',
    sortOrder: 0,
    active: true,
    whatsappPhone: DEFAULT_WHATSAPP,
  },
  {
    id: 'offer-6',
    kind: 'tag',
    title: 'Whatsapp Advertising',
    price: '4,999/-',
    sortOrder: 1,
    active: true,
    whatsappPhone: DEFAULT_WHATSAPP,
  },
  {
    id: 'offer-7',
    kind: 'tag',
    title: 'Quick Heal Anti Virus',
    price: '799/-',
    sortOrder: 2,
    active: true,
    whatsappPhone: DEFAULT_WHATSAPP,
  },
];

export function getCachedSpecialOffers(): SpecialOffer[] {
  try {
    const raw = localStorage.getItem(SPECIAL_OFFERS_CACHE_KEY);
    if (!raw) return DEFAULT_SPECIAL_OFFERS;
    const parsed = JSON.parse(raw) as SpecialOffersPayload | SpecialOffer[];
    if (Array.isArray(parsed)) return parsed;
    return parsed.offers?.length ? parsed.offers : DEFAULT_SPECIAL_OFFERS;
  } catch {
    return DEFAULT_SPECIAL_OFFERS;
  }
}

export function cacheSpecialOffers(offers: SpecialOffer[], updatedAt?: string) {
  localStorage.setItem(
    SPECIAL_OFFERS_CACHE_KEY,
    JSON.stringify({ offers, updatedAt: updatedAt || new Date().toISOString() })
  );
  window.dispatchEvent(new Event(SPECIAL_OFFERS_UPDATED_EVENT));
}

export function sortActiveOffers(offers: SpecialOffer[]) {
  return offers
    .filter((offer) => offer.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function fetchSpecialOffers(): Promise<SpecialOffersPayload> {
  const res = await fetch('/api/content/special-offers');
  if (!res.ok) {
    throw new Error('Failed to fetch special offers');
  }
  const data = (await res.json()) as SpecialOffersPayload;
  cacheSpecialOffers(data.offers, data.updatedAt);
  return data;
}

export async function saveSpecialOffers(offers: SpecialOffer[]): Promise<SpecialOffersPayload> {
  const res = await fetch('/api/content/special-offers', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offers }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to save special offers');
  }
  cacheSpecialOffers(data.offers, data.updatedAt);
  return data;
}

export function buildWhatsAppLink(offer: SpecialOffer) {
  const phone = offer.whatsappPhone || DEFAULT_WHATSAPP;
  const message = `Hi, I am interested in ${offer.title} (${offer.price})`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function newOfferId() {
  return `offer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
