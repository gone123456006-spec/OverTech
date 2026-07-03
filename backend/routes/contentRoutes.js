import express from 'express';
import { getSpecialOffers, updateSpecialOffers } from '../controllers/specialOffersController.js';

const router = express.Router();

router.get('/special-offers', getSpecialOffers);
router.put('/special-offers', updateSpecialOffers);

export default router;
