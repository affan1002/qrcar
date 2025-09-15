const mongoose = require('mongoose');

// Define what car data looks like
const carSchema = new mongoose.Schema({
    // Unique identifier for each car
    carId: {
        type: String,        // Text
        required: true,      // Must be provided
        unique: true         // No duplicates allowed
    },

    // License plate number
    plateNumber: {
        type: String,
        required: true,
        uppercase: true,     // Automatically convert to UPPERCASE
        trim: true          // Remove extra spaces
    },

    // Owner information (nested object)
    owner: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            match: /^\+[1-9]\d{1,14}$/  // Valid phone format
        },
        email: {
            type: String,
            lowercase: true     // Convert to lowercase
        }
    },

    // QR Code data (nested object)
    qrCode: {
        base64: String,      // QR code image data
        fileName: String,    // File name for download
        downloadUrl: String  // URL to download QR
    },

    // Whether car is active
    isActive: {
        type: Boolean,
        default: true        // Default value is true
    },

    // Array of scan logs
    scans: [{
        scannerName: String,
        scannerPhone: String,
        reason: String,
        timestamp: {
            type: Date,
            default: Date.now    // Automatically set current time
        },
        verified: {
            type: Boolean,
            default: false
        },
        ipAddress: String      // For security tracking
    }]
}, {
    timestamps: true         // Automatically adds createdAt and updatedAt
});

// Create indexes for faster searches
carSchema.index({ carId: 1 });
carSchema.index({ plateNumber: 1 });
carSchema.index({ 'owner.phone': 1 });

// Export the model so other files can use it
module.exports = mongoose.model('Car', carSchema);