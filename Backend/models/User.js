// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { 
    type: String, 
    required: function() {
      return this.provider !== 'google';
    }
  },
  googleId: { type: String, sparse: true, unique: true },
  provider: { 
    type: String, 
    enum: ['local', 'google'], 
    default: 'local' 
  },
  userType: { 
    type: String, 
    required: true, 
    enum: ['buyer', 'seller', 'driver', 'mechanic', 'admin', 'superadmin'] 
  },
  dateOfBirth: { type: Date },
  doorNo: {
    type: String,
    set: function(v) {
      return Array.isArray(v) ? v.find(val => val && val.trim() !== '') || '' : v;
    }
  },
  street: {
    type: String,
    set: function(v) {
      return Array.isArray(v) ? v.find(val => val && val.trim() !== '') || '' : v;
    }
  },
  city: {
    type: String,
    set: function(v) {
      return Array.isArray(v) ? v.find(val => val && val.trim() !== '') || '' : v;
    }
  },
  state: {
    type: String,
    set: function(v) {
      return Array.isArray(v) ? v.find(val => val && val.trim() !== '') || '' : v;
    }
  },
  googleAddressLink: {
    type: String,
    required: function() {
      return this.userType === 'mechanic';
    }
  },
  drivingLicense: { type: String },
  shopName: { type: String },
  repairBikes: { type: Boolean, default: false },
  repairCars: { type: Boolean, default: false },
  experienceYears: { type: Number },
  approved_status: { 
    type: String, 
    enum: ['Yes', 'No'], 
    default: 'No',
    required: function() {
      return this.userType === 'mechanic';
    }
  },
  phone: {
    type: String,
    required: function() {
      return this.provider !== 'google';
    },
    match: [/^\d{10}$/, 'Phone number must be 10 digits']
  },
  assignedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AuctionRequest' }],
  notificationPreference: {
    type: String,
    enum: ['all', 'important', 'none'],
    default: 'all'
  },
  // Notification flag: true when user has unseen notifications (used for UI badge)
  notificationFlag: {
    type: Boolean,
    default: false
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: {
    type: String
  },
  reportedAt: {
    type: Date
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedAt: {
    type: Date
  },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for DB optimization
userSchema.index({ userType: 1 });
userSchema.index({ email: 1, userType: 1 });

// Hash password before saving (skip for Google OAuth users who have no password)
userSchema.pre('save', async function(next) {
  if (!this.password || !this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);