const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const { generateCarQR } = require('../utils/qrGenerator');

// Test route
router.get('/', (req, res) => {
    res.json({ message: 'API routes are working!' });
});
// GET /api/scan-logs/:ownerPhone - Get all scan logs for an owner's cars
router.get('/scan-logs/:ownerPhone', async (req, res) => {
    try {
        const { ownerPhone } = req.params;

        // Validate phone format
        if (!ownerPhone.startsWith('+')) {
            return res.status(400).json({
                success: false,
                message: 'Phone must include country code'
            });
        }

        // Find all cars owned by this phone number
        const ownerCars = await Car.find({
            'owner.phone': ownerPhone,
            isActive: true
        });

        if (ownerCars.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No cars found for this phone number'
            });
        }

        // Collect all scan logs from all owner's cars
        const allScans = [];

        ownerCars.forEach(car => {
            car.scans.forEach(scan => {
                allScans.push({
                    carPlate: car.plateNumber,
                    carId: car.carId,
                    scannerName: scan.scannerName,
                    scannerPhone: scan.scannerPhone,
                    reason: scan.reason || 'No reason provided',
                    timestamp: scan.timestamp,
                    verified: scan.verified,
                    ipAddress: scan.ipAddress
                });
            });
        });

        // Sort by most recent first
        allScans.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({
            success: true,
            totalCars: ownerCars.length,
            totalScans: allScans.length,
            scans: allScans
        });

    } catch (error) {
        console.error('Error fetching scan logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch scan logs'
        });
    }
});

// GET /api/scan-stats/:ownerPhone - Get statistics about scans
router.get('/scan-stats/:ownerPhone', async (req, res) => {
    try {
        const { ownerPhone } = req.params;

        const ownerCars = await Car.find({
            'owner.phone': ownerPhone,
            isActive: true
        });

        const stats = {
            totalCars: ownerCars.length,
            totalScans: 0,
            verifiedScans: 0,
            todayScans: 0,
            thisWeekScans: 0,
            scansByPlate: {}
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        ownerCars.forEach(car => {
            stats.scansByPlate[car.plateNumber] = {
                total: car.scans.length,
                verified: 0
            };

            car.scans.forEach(scan => {
                stats.totalScans++;

                if (scan.verified) {
                    stats.verifiedScans++;
                    stats.scansByPlate[car.plateNumber].verified++;
                }

                if (scan.timestamp >= today) {
                    stats.todayScans++;
                }

                if (scan.timestamp >= weekAgo) {
                    stats.thisWeekScans++;
                }
            });
        });

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Error fetching scan stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
});
// 1. Register new car
router.post('/register-car', async (req, res) => {
    try {
        const { ownerName, ownerPhone, carPlate } = req.body;

        // Validate input
        if (!ownerName || !ownerPhone || !carPlate) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if car already exists
        const existingCar = await Car.findOne({ plateNumber: carPlate });
        if (existingCar) {
            return res.status(400).json({
                success: false,
                message: 'Car with this plate number already registered'
            });
        }

        // Create new car
        const carId = 'car_' + Date.now();
        const newCar = new Car({
            carId,
            plateNumber: carPlate.toUpperCase(),
            owner: {
                name: ownerName,
                phone: ownerPhone
            }
        });

        // Generate QR code
        const qrData = await generateCarQR(carId, carPlate);
        newCar.qrCode = qrData;

        // Save to database
        const savedCar = await newCar.save();

        console.log('✅ Car registered:', savedCar.carId);

        res.json({
            success: true,
            carId: savedCar.carId,
            qrCode: qrData.qrBase64,
            downloadUrl: qrData.downloadUrl,
            message: 'Car registered successfully!'
        });

    } catch (error) {
        console.error('❌ Car registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register car'
        });
    }
});

// 2. Get car details (for QR scan)
router.get('/car/:carId', async (req, res) => {
    try {
        const { carId } = req.params;

        const car = await Car.findOne({ carId, isActive: true });
        if (!car) {
            return res.status(404).json({
                success: false,
                message: 'Car not found or inactive'
            });
        }

        // Return safe car info (not owner phone yet)
        res.json({
            success: true,
            car: {
                carId: car.carId,
                plateNumber: car.plateNumber,
                ownerName: car.owner.name,
                vehicleType: 'SUV' // You can add this field to model later
            }
        });

    } catch (error) {
        console.error('❌ Car lookup error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get car details'
        });
    }
});

// 3. Send OTP (for now, just generate and return)
router.post('/send-otp', async (req, res) => {
    try {
        const { carId, scannerName, scannerPhone, reason } = req.body;

        // Validate input
        if (!carId || !scannerName || !scannerPhone) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if car exists
        const car = await Car.findOne({ carId, isActive: true });
        if (!car) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }

        // Generate OTP (6 digit)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const sessionId = 'session_' + Date.now();

        // For now, we'll just return the OTP (Week 3 will use real SMS)
        console.log(`📱 OTP for ${scannerPhone}: ${otp}`);

        res.json({
            success: true,
            sessionId,
            message: `OTP sent to ${scannerPhone}`,
            // Remove this in production - for demo only
            demoOTP: otp
        });

    } catch (error) {
        console.error('❌ OTP sending error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP'
        });
    }
});

// 4. Verify OTP and get owner contact
router.post('/verify-otp', async (req, res) => {
    try {
        const { carId, sessionId, otp, scannerName, scannerPhone, reason } = req.body;

        // For demo, accept any 6-digit OTP
        if (!otp || otp.length !== 6) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP format'
            });
        }

        // Get car details
        const car = await Car.findOne({ carId, isActive: true });
        if (!car) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }

        // Add scan log
        car.scans.push({
            scannerName,
            scannerPhone,
            reason: reason || 'Contact request',
            verified: true,
            timestamp: new Date()
        });

        await car.save();

        console.log('✅ Verified scan logged for:', car.plateNumber);

        // Return owner contact info
        res.json({
            success: true,
            owner: {
                name: car.owner.name,
                phone: car.owner.phone
            },
            message: 'Contact information retrieved successfully'
        });

    } catch (error) {
        console.error('❌ OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP'
        });
    }
});

// 5. Get scan logs (for car owner)
router.get('/scans/:carId', async (req, res) => {
    try {
        const { carId } = req.params;

        const car = await Car.findOne({ carId });
        if (!car) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }

        res.json({
            success: true,
            scans: car.scans.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        });

    } catch (error) {
        console.error('❌ Scan logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get scan logs'
        });
    }
});

module.exports = router;