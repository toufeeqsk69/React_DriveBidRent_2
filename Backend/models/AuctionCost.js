// models/AuctionCost.js
import mongoose from 'mongoose';

const auctionCostSchema = new mongoose.Schema({
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
  amountPaid: {
    type: Number,
    required: true
  },
  convenienceFee: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  }
});

// Indexes for DB optimization
auctionCostSchema.index({ buyerId: 1 });
auctionCostSchema.index({ sellerId: 1 });
auctionCostSchema.index({ auctionId: 1 });

export default mongoose.model('AuctionCost', auctionCostSchema);