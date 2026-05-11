// models/Wishlist.js
import mongoose from 'mongoose';

const WishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  auctions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionRequest'  // Fixed: was 'Auction'
  }],
  rentals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RentalRequest'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
WishlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Wishlist', WishlistSchema);