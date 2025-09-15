const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define what user data looks like
const userSchema = new mongoose.Schema({
  // Basic user info
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Phone number (login credential)
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^\+[1-9]\d{1,14}$/
  },
  
  // Email (optional)
  email: {
    type: String,
    unique: true,
    sparse: true,        // Allow null/undefined values
    lowercase: true
  },
  
  // Password (encrypted)
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Array of car IDs owned by this user
  cars: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car'          // Reference to Car model
  }],
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Last login time
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Automatically hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is being modified
  if (!this.isModified('password')) return next();
  
  // Hash the password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create indexes
userSchema.index({ phone: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
