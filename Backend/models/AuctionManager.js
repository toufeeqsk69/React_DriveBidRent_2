// models/AuctionManager.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const auctionManagerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Please enter a valid email'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Phone number must be 10 digits starting with 6-9'],
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },

  approved: {
    type: Boolean,
    default: false,
  },

  isBlocked: {
    type: Boolean,
    default: false,
  },

  auctionCars: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionRequest',  
  }],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});


auctionManagerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
auctionManagerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Optional: Virtual for full name (useful in frontend/admin)
auctionManagerSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export default mongoose.model('AuctionManager', auctionManagerSchema);