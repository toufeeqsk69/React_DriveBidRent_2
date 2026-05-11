import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true 
  },
  otp: { 
    type: String, 
    required: true 
  },
  userData: { 
    type: Object, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 600 // Automatically delete document after 10 minutes (600 seconds)
  }
});

// Indexes for DB optimization
otpSchema.index({ email: 1 });

export default mongoose.model('OTP', otpSchema);
