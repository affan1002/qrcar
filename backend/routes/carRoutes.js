// Import the models
const Car = require('../models/Car');
const User = require('../models/User');
const OTPSession = require('../models/OTPSession');

// Example: Register a new car
async function registerCar(req, res) {
  try {
    // Extract data from request
    const { plateNumber, ownerName, ownerPhone, ownerEmail } = req.body;
    
    // Create new car using the Car model
    const newCar = new Car({
      carId: 'car_' + Date.now(),
      plateNumber: plateNumber,
      owner: {
        name: ownerName,
        phone: ownerPhone,
        email: ownerEmail
      }
    });
    
    // Save to database
    const savedCar = await newCar.save();
    
    console.log('✅ New car registered:', savedCar.carId);
    res.json({ 
      success: true, 
      carId: savedCar.carId,
      message: 'Car registered successfully'
    });
    
  } catch (error) {
    console.error('❌ Error registering car:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to register car' 
    });
  }
}

module.exports = { registerCar };