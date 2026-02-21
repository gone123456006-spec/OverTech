import express from 'express';
import { addAddress, getAddresses, updateAddress, deleteAddress, setDefaultAddress } from '../controllers/addressController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateAddress } from '../middleware/locationValidator.js';

const router = express.Router();

// All address routes are protected (require authentication)
router.use(protect);

/**
 * @route   POST /api/address
 * @desc    Add new address
 * @access  Private
 */
router.post('/', validateAddress, addAddress);

/**
 * @route   GET /api/address
 * @desc    Get all user addresses
 * @access  Private
 */
router.get('/', getAddresses);

/**
 * @route   PUT /api/address/:id
 * @desc    Update address
 * @access  Private
 */
router.put('/:id', updateAddress);

/**
 * @route   DELETE /api/address/:id
 * @desc    Delete address
 * @access  Private
 */
router.delete('/:id', deleteAddress);

/**
 * @route   PUT /api/address/:id/default
 * @desc    Set address as default
 * @access  Private
 */
router.put('/:id/default', setDefaultAddress);

export default router;
