// models/RentalCost.js
import mongoose from 'mongoose';

const RentalCostSchema = new mongoose.Schema({
  rentalCarId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RentalRequest',
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
  totalCost: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for DB optimization
RentalCostSchema.index({ buyerId: 1 });
RentalCostSchema.index({ sellerId: 1 });
RentalCostSchema.index({ rentalCarId: 1 });

export default mongoose.model('RentalCost', RentalCostSchema);