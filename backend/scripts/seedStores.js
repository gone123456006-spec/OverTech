import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Store from '../models/Store.js';

// Load environment variables
dotenv.config();

const seedStores = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_db');
        console.log('✅ Connected to MongoDB');

        // Clear existing stores (optional - comment out if you want to keep existing)
        await Store.deleteMany({});
        console.log('🗑️  Cleared existing stores');

        // Create default store
        // TODO: Replace with your actual store location
        const defaultStore = new Store({
            name: 'Main Store',
            location: {
                type: 'Point',
                coordinates: [77.2090, 28.6139] // [longitude, latitude] - New Delhi example
            },
            address: '123 Main Street, Connaught Place',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110001',
            deliveryRadius: 10, // 10 km radius
            operatingHours: {
                open: '09:00',
                close: '21:00'
            },
            isActive: true,
            contactNumber: '9876543210'
        });

        await defaultStore.save();
        console.log('✅ Default store created successfully');
        console.log(`   Name: ${defaultStore.name}`);
        console.log(`   Location: ${defaultStore.location.coordinates[1]}, ${defaultStore.location.coordinates[0]}`);
        console.log(`   Delivery Radius: ${defaultStore.deliveryRadius} km`);

        // You can add more stores here
        /*
        const store2 = new Store({
            name: 'Store 2',
            location: {
                type: 'Point',
                coordinates: [77.3910, 28.5355] // Noida example
            },
            address: '456 Sector 18',
            city: 'Noida',
            state: 'Uttar Pradesh',
            pincode: '201301',
            deliveryRadius: 8,
            operatingHours: {
                open: '10:00',
                close: '22:00'
            },
            isActive: true,
            contactNumber: '9876543211'
        });
        await store2.save();
        console.log('✅ Store 2 created');
        */

        console.log('\n🎉 Store seeding completed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding stores:', error);
        process.exit(1);
    }
};

seedStores();
