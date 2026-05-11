// models/AuctionRequest.js
import mongoose from 'mongoose';

const auctionRequestSchema = new mongoose.Schema({
  vehicleName: { type: String, required: true },
  mainImage: { type: String, required: true },
  additionalImages: [{ type: String }],
  carType: { 
    type: String, 
    required: true,
    enum: ['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Wagon']
  },
  year: { type: Number, required: true },
  mileage: { type: Number, required: true },
  condition: { type: String, required: true },
  fuelType: { type: String, required: true },
  transmission: { type: String, required: true },
  expectedBid: { type: Number, required: true },  // Seller's expected sale amount
  startingBid: { type: Number },                   // Set by Auction Manager on approval (auction floor)
  auctionDate: { type: Date, required: true },
  status: { 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'approved', 'rejected', 'assignedMechanic'] 
  },
  rejectionReason: { type: String },
  rejectedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AuctionManager' 
  },
  started_auction: { 
    type: String, 
    default: 'no', 
    enum: ['no', 'yes', 'ended'] 
  },
  reviewStatus: { 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'completed'] 
  },
  sellerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  assignedMechanic: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  assignedAuctionManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionManager'
  },
  auction_stopped: { 
    type: Boolean, 
    default: false 
  },
  winnerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  finalPurchasePrice: { 
    type: Number 
  },
  paymentDeadline: {
    type: Date
  },
  paymentFailed: {
    type: Boolean,
    default: false
  },
  failedBuyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isReauctioned: {
    type: Boolean,
    default: false
  },
  mechanicReview: {
    mechanicalCondition: String,
    bodyCondition: String,
    recommendations: String,
    conditionRating: String
  },
  multipointInspection: {
    exterior: {
      paintCondition: Number, scratches: Boolean, dents: Boolean, rust: Boolean, tiresCondition: String, notes: String
    },
    interior: {
      seatsCondition: String, dashboardCondition: String, acWorks: Boolean, electronicsWork: Boolean, notes: String
    },
    engine: {
      fluidLeaks: Boolean, abnormalNoise: Boolean, startupSmoothness: String, batteryHealth: String, notes: String
    },
    testDrive: {
      brakesCondition: String, steeringFeel: String, suspension: String, transmissionShift: String, notes: String
    },
    overallRating: Number,
    isApprovedForAuction: Boolean,
    mechanicSummary: String
  },
  
  // === INSPECTION & SCHEDULING SCHEMAS ===
  inspectionDate: { type: Date },
  inspectionTime: { type: String }, // e.g. "10:00 AM - 11:30 AM"
  inspectionStatus: { 
    type: String, 
    default: 'pending_negotiation',
    enum: ['pending_negotiation', 'scheduled', 'completed', 'cancelled']
  },
  inspectionReportPdf: { type: String }, // URL to generated Cloudinary PDF

  // === VEHICLE VERIFICATION & DOCUMENTATION ===
  vehicleDocumentation: {
    // Registration & Ownership
    registrationNumber: { type: String, required: true },
    registrationState: { type: String, required: true },
    ownershipType: { 
      type: String, 
      required: true, 
      enum: ['First Owner', 'Second Owner', 'Third Owner', 'Fourth Owner or More']
    },
    registrationCertificate: { type: String }, // File upload URL
    
    // VIN & Chassis Details
    vinNumber: { type: String, required: true, unique: true },
    chassisNumber: { type: String, required: true },
    engineNumber: { type: String, required: true },
    
    // Insurance
    insuranceStatus: { 
      type: String, 
      required: true, 
      enum: ['Valid', 'Expired', 'No Insurance']
    },
    insuranceExpiryDate: { type: Date },
    insuranceType: { 
      type: String, 
      enum: ['Comprehensive', 'Third Party', 'None']
    },
    previousInsuranceClaims: { type: Boolean, default: false },
    insuranceClaimDetails: { type: String }, // Description if claims exist
    insuranceDocument: { type: String }, // File upload URL
    
    // Accident & Damage History
    accidentHistory: { type: Boolean, default: false, required: true },
    numberOfAccidents: { type: Number, default: 0 },
    accidentDetails: { type: String }, // Description
    majorRepairs: { type: Boolean, default: false },
    repairDetails: { type: String },
    
    // Ownership Transfer & Legal
    hypothecationStatus: { 
      type: String, 
      required: true,
      enum: ['Clear - No Loan', 'Under Loan/Hypothecation']
    },
    loanProvider: { type: String }, // Bank name if under loan
    nocAvailable: { type: Boolean }, // No Objection Certificate
    readyForTransfer: { type: Boolean, default: true, required: true },
    
    // Theft & Legal Check
    stolenVehicleCheck: { 
      type: String, 
      required: true,
      enum: ['Verified Clean', 'Not Verified']
    },
    policeNOC: { type: Boolean, default: false },
    courtCases: { type: Boolean, default: false },
    courtCaseDetails: { type: String },
    
    // Odometer & Service
    odometerReading: { type: Number },
    odometerVerified: { type: Boolean, default: false },
    odometerTampering: { 
      type: String,
      enum: ['No Tampering', 'Suspected', 'Unknown'],
      default: 'Unknown'
    },
    serviceHistory: { 
      type: String,
      enum: ['Complete Service Records', 'Partial Records', 'No Records'],
      default: 'No Records'
    },
    lastServiceDate: { type: Date },
    serviceBookAvailable: { type: Boolean, default: false },
    
    // Pollution & Fitness
    pollutionCertificate: { 
      type: String,
      required: true,
      enum: ['Valid', 'Expired', 'Not Available']
    },
    pollutionExpiryDate: { type: Date },
    fitnessCertificate: { type: String }, // For commercial vehicles
    fitnessCertificateExpiry: { type: Date },
    
    // Additional Documents
    rcTransferForm29: { type: String }, // Form 29 upload URL
    rcTransferForm30: { type: String }, // Form 30 upload URL
    roadTaxReceipt: { type: String }, // Upload URL
    addressProof: { type: String }, // Upload URL
    
    // Verification Status (Set by Admin/System)
    documentsVerified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verificationDate: { type: Date },
    verificationNotes: { type: String }
  }
}, { 
  timestamps: true 
});

// Create text index for search functionality on vehicles
auctionRequestSchema.index({ vehicleName: 'text', condition: 'text', 'vehicleDocumentation.registrationState': 'text' });

// Create compound and single indexes for fast filtering and query planning
auctionRequestSchema.index({ status: 1 });
auctionRequestSchema.index({ carType: 1, fuelType: 1, transmission: 1 });
auctionRequestSchema.index({ started_auction: 1 });
auctionRequestSchema.index({ sellerId: 1 });

export default mongoose.model('AuctionRequest', auctionRequestSchema);