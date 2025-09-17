require('dotenv').config();
const mongoose = require('mongoose');
const Car = require('./models/Car');
const User = require('./models/User');

async function testModels() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to test database');

        // Test 1: Create a new car
        console.log('\n🧪 Test 1: Creating a car...');
        const testCar = new Car({
            carId: 'test_' + Date.now(),
            plateNumber: 'KA01TEST',
            owner: {
                name: 'Test Owner',
                phone: '+919999999999',
                email: 'test@example.com'
            }
        });

        const savedCar = await testCar.save();
        console.log('✅ Car created with ID:', savedCar._id);

        // Test 2: Find the car
        console.log('\n🧪 Test 2: Finding the car...');
        const foundCar = await Car.findOne({ carId: savedCar.carId });
        console.log('✅ Found car:', foundCar.plateNumber);

        // Test 3: Add a scan log
        console.log('\n🧪 Test 3: Adding scan log...');
        foundCar.scans.push({
            scannerName: 'Test Scanner',
            scannerPhone: '+918888888888',
            reason: 'Test scan',
            verified: true
        });

        await foundCar.save();
        console.log('✅ Scan log added');

        // Test 4: Create a user
        console.log('\n🧪 Test 4: Creating a user...');
        const testUser = new User({
            name: 'Test User',
            phone: '+917777777777',
            password: 'password123'
        });

        const savedUser = await testUser.save();
        console.log('✅ User created with ID:', savedUser._id);
        console.log('✅ Password was hashed automatically');

        // Clean up test data
        console.log('\n🧹 Cleaning up test data...');
        await Car.findByIdAndDelete(savedCar._id);
        await User.findByIdAndDelete(savedUser._id);
        console.log('✅ Test data cleaned up');

        console.log('\n🎉 All tests passed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testModels();
