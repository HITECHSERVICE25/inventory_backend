const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Company = require('./src/models/Company');
const Technician = require('./src/models/Technician');
const Product = require('./src/models/Product');
const connectDB = require('./src/config/db');

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        // Seed Company
        const company = await Company.create({
            name: 'Test Company',
            address: '123 Test St',
            contact: '1234567890'
        });
        console.log('Company seeded');

        // Seed Technician
        const technician = await Technician.create({
            name: 'Test Technician',
            email: 'tech@example.com',
            phone: '9876543210',
            company: company._id
        });
        console.log('Technician seeded');

        // Seed Product
        const product = await Product.create({
            name: 'Test Product',
            price: 100,
            totalCount: 50,
            unitOfMeasure: 'units'
        });
        console.log('Product seeded');

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error.message);
        process.exit(1);
    }
};

seedData();
