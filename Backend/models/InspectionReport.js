import mongoose from 'mongoose';

const inspectionReportSchema = new mongoose.Schema({
  auctionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AuctionRequest',
    required: true
  },
  mechanicId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  
  // 1. Exterior Check
  exterior: {
    paintCondition: { type: Number, min: 1, max: 10, required: true },
    scratches: { type: Boolean, default: false },
    dents: { type: Boolean, default: false },
    rust: { type: Boolean, default: false },
    tiresCondition: { type: String, enum: ['New', 'Good', 'Fair', 'Needs Replacement'], required: true },
    notes: { type: String }
  },
  
  // 2. Interior Check
  interior: {
    seatsCondition: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Torn/Damaged'], required: true },
    dashboardCondition: { type: String, enum: ['Excellent', 'Good', 'Scratched/Cracked'], required: true },
    acWorks: { type: Boolean, required: true },
    electronicsWork: { type: Boolean, required: true }, // Infotainment, windows, locks
    notes: { type: String }
  },
  
  // 3. Engine & Under the Hood
  engine: {
    fluidLeaks: { type: Boolean, default: false },
    abnormalNoise: { type: Boolean, default: false },
    startupSmoothness: { type: String, enum: ['Smooth', 'Rough', 'Failed'], required: true },
    batteryHealth: { type: String, enum: ['Good', 'Weak', 'Dead'], required: true },
    notes: { type: String }
  },
  
  // 4. Test Drive & Performance
  testDrive: {
    brakesCondition: { type: String, enum: ['Excellent', 'Good', 'Spongy', 'Needs Replacement'], required: true },
    steeringFeel: { type: String, enum: ['Smooth', 'Vibrates', 'Pulls to side'], required: true },
    suspension: { type: String, enum: ['Smooth', 'Noisy', 'Bouncy'], required: true },
    transmissionShift: { type: String, enum: ['Smooth', 'Jerky', 'Slipping', 'N/A'], required: true },
    notes: { type: String }
  },
  
  // Metrics & Result
  overallRating: { 
    type: Number, 
    min: 1, 
    max: 10, 
    required: true 
  },
  isApprovedForAuction: {
    type: Boolean,
    required: true
  },
  mechanicSummary: {
    type: String,
    required: true
  }

}, { timestamps: true });
// Indexes for DB optimization
inspectionReportSchema.index({ auctionId: 1 });
inspectionReportSchema.index({ mechanicId: 1 });

export default mongoose.model('InspectionReport', inspectionReportSchema);
