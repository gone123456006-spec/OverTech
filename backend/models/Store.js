import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    pincode: {
        type: String,
        required: true,
        trim: true
    },
    deliveryRadius: {
        type: Number, // in kilometers
        required: true,
        default: 10
    },
    operatingHours: {
        open: {
            type: String,
            default: '09:00'
        },
        close: {
            type: String,
            default: '21:00'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    contactNumber: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Create geospatial index for location-based queries
storeSchema.index({ location: '2dsphere' });

// Instance method to check if store is currently open
storeSchema.methods.isOpen = function () {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTime >= this.operatingHours.open && currentTime <= this.operatingHours.close;
};

const Store = mongoose.model('Store', storeSchema);

export default Store;
