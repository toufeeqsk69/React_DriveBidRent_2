// models/Purchase.js
import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionRequest',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleName: {
    type: String,
    required: true
  },
  vehicleImage: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  mileage: {
    type: Number,
    required: true
  },
  carType: {
    type: String,
    enum: ['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Wagon']
  },
  purchasePrice: {
    type: Number,
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  sellerName: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  }
});

// Indexes for DB optimization
purchaseSchema.index({ buyerId: 1 });
purchaseSchema.index({ sellerId: 1 });
purchaseSchema.index({ auctionId: 1 });

export default mongoose.model('Purchase', purchaseSchema);