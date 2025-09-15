const mongoose = require('mongoose');

// Define OTP session data
const otpSessionSchema = new mongoose.Schema({
    // Session identifier
    sessionId: {
        type: String,
        required: true,
        unique: true
    },

    // Phone number OTP was sent to
    phoneNumber: {
        type: String,
        required: true
    },

    // The actual OTP code
    otpCode: {
        type: String,
        required: true
    },

    // Which car this OTP is for
    carId: {
        type: String,
        required: true
    },

    // Scanner's information
    scannerInfo: {
        name: String,
        reason: String
    },

    // When OTP expires (5 minutes from creation)
    expiresAt: {
        type: Date,
        default: Date.now,
        expires: 300        // Expires in 300 seconds (5 minutes)
    },

    // Whether OTP has been used
    isUsed: {
        type: Boolean,
        default: false
    },

    // How many attempts were made
    attempts: {
        type: Number,
        default: 0,
        max: 3              // Maximum 3 attempts
    }
}, {
    timestamps: true
});

// Create indexes
otpSessionSchema.index({ sessionId: 1 });
otpSessionSchema.index({ phoneNumber: 1 });
otpSessionSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('OTPSession', otpSessionSchema);
