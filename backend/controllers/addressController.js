import Address from '../models/Address.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * @route   POST /api/address
 * @desc    Add new address for user
 * @access  Private
 */
export const addAddress = async (req, res, next) => {
    try {
        const { type, latitude, longitude, address, landmark, city, state, pincode, isDefault } = req.body;

        const newAddress = new Address({
            user: req.user._id,
            type,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude] // GeoJSON format: [lon, lat]
            },
            address,
            landmark,
            city,
            state,
            pincode,
            isDefault: isDefault || false
        });

        await newAddress.save();

        res.status(HTTP_STATUS.CREATED).json({
            message: 'Address added successfully',
            address: {
                id: newAddress._id,
                type: newAddress.type,
                address: newAddress.address,
                city: newAddress.city,
                pincode: newAddress.pincode,
                isDefault: newAddress.isDefault
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/address
 * @desc    Get all addresses for user
 * @access  Private
 */
export const getAddresses = async (req, res, next) => {
    try {
        const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });

        res.status(HTTP_STATUS.OK).json({
            addresses: addresses.map(addr => ({
                id: addr._id,
                type: addr.type,
                latitude: addr.location.coordinates[1],
                longitude: addr.location.coordinates[0],
                address: addr.address,
                landmark: addr.landmark,
                city: addr.city,
                state: addr.state,
                pincode: addr.pincode,
                isDefault: addr.isDefault,
                createdAt: addr.createdAt
            }))
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/address/:id
 * @desc    Update address
 * @access  Private
 */
export const updateAddress = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { type, latitude, longitude, address, landmark, city, state, pincode, isDefault } = req.body;

        const addressDoc = await Address.findOne({ _id: id, user: req.user._id });

        if (!addressDoc) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                message: 'Address not found'
            });
        }

        // Update fields
        if (type) addressDoc.type = type;
        if (latitude && longitude) {
            addressDoc.location.coordinates = [longitude, latitude];
        }
        if (address) addressDoc.address = address;
        if (landmark !== undefined) addressDoc.landmark = landmark;
        if (city) addressDoc.city = city;
        if (state !== undefined) addressDoc.state = state;
        if (pincode) addressDoc.pincode = pincode;
        if (isDefault !== undefined) addressDoc.isDefault = isDefault;

        await addressDoc.save();

        res.status(HTTP_STATUS.OK).json({
            message: 'Address updated successfully',
            address: {
                id: addressDoc._id,
                type: addressDoc.type,
                address: addressDoc.address,
                isDefault: addressDoc.isDefault
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/address/:id
 * @desc    Delete address
 * @access  Private
 */
export const deleteAddress = async (req, res, next) => {
    try {
        const { id } = req.params;

        const addressDoc = await Address.findOneAndDelete({ _id: id, user: req.user._id });

        if (!addressDoc) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                message: 'Address not found'
            });
        }

        res.status(HTTP_STATUS.OK).json({
            message: 'Address deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/address/:id/default
 * @desc    Set address as default
 * @access  Private
 */
export const setDefaultAddress = async (req, res, next) => {
    try {
        const { id } = req.params;

        const addressDoc = await Address.findOne({ _id: id, user: req.user._id });

        if (!addressDoc) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                message: 'Address not found'
            });
        }

        addressDoc.isDefault = true;
        await addressDoc.save();

        res.status(HTTP_STATUS.OK).json({
            message: 'Default address updated successfully'
        });

    } catch (error) {
        next(error);
    }
};
