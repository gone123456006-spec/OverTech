import { readSpecialOffers, writeSpecialOffers } from '../services/specialOffersStore.js';

function validateOffer(offer, index) {
  if (!offer || typeof offer !== 'object') {
    throw new Error(`Offer at index ${index} must be an object`);
  }
  if (!offer.id || typeof offer.id !== 'string') {
    throw new Error(`Offer at index ${index} requires a string id`);
  }
  if (!['card', 'tag'].includes(offer.kind)) {
    throw new Error(`Offer ${offer.id} has invalid kind`);
  }
  if (!offer.title || typeof offer.title !== 'string') {
    throw new Error(`Offer ${offer.id} requires a title`);
  }
  if (!offer.price || typeof offer.price !== 'string') {
    throw new Error(`Offer ${offer.id} requires a price string`);
  }
  if (offer.kind === 'card' && offer.image && typeof offer.image !== 'string') {
    throw new Error(`Offer ${offer.id} image must be a string`);
  }
}

export async function getSpecialOffers(req, res) {
  try {
    const data = await readSpecialOffers();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load special offers', error: error.message });
  }
}

export async function updateSpecialOffers(req, res) {
  try {
    const { offers } = req.body;
    if (!Array.isArray(offers)) {
      return res.status(400).json({ message: 'offers must be an array' });
    }

    offers.forEach((offer, index) => validateOffer(offer, index));

    const normalized = offers.map((offer, index) => ({
      id: offer.id,
      kind: offer.kind,
      title: offer.title.trim(),
      price: offer.price.trim(),
      image: offer.kind === 'card' ? (offer.image || '') : undefined,
      subtitle: offer.kind === 'tag' ? (offer.subtitle || '') : undefined,
      sortOrder: Number.isFinite(offer.sortOrder) ? offer.sortOrder : index,
      active: offer.active !== false,
      whatsappPhone: offer.whatsappPhone || '917991163225',
    }));

    const saved = await writeSpecialOffers({ offers: normalized });
    res.json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to save special offers' });
  }
}
