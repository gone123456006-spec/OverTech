import express from 'express';
import { getSpecialOffers, updateSpecialOffers } from '../controllers/specialOffersController.js';
import { getCategoryCards, updateCategoryCards } from '../controllers/categoryCardsController.js';
import { getStorefront, updateStorefront } from '../controllers/storefrontController.js';
import { protectAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/special-offers', getSpecialOffers);
router.put('/special-offers', protectAdmin, updateSpecialOffers);

router.get('/category-cards', getCategoryCards);
router.put('/category-cards', protectAdmin, updateCategoryCards);

router.get('/storefront', getStorefront);
router.put('/storefront', protectAdmin, updateStorefront);

export default router;
