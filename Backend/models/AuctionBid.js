// models/AuctionBid.js
import mongoose from 'mongoose';
import Notification from './Notification.js'; // ESM import
// new things
const auctionBidSchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionRequest',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bidAmount: {
    type: Number,
    required: true
  },
  isCurrentBid: {
    type: Boolean,
    default: true
  },
  bidTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
});

// Pre-save middleware to ensure bid is valid and create notifications
auctionBidSchema.pre('save', async function (next) {
  try {
    // Only check for new bids, not updates to existing bids
    if (!this.isNew) return next();

    const AuctionRequest = mongoose.model('AuctionRequest');
    const auction = await AuctionRequest.findById(this.auctionId);

    if (!auction) {
      return next(new Error('Auction not found'));
    }

    // Check if auction is started
    if (auction.started_auction !== 'yes') {
      return next(new Error('Auction has not started yet'));
    }

    // Get the previous highest bidder
    const previousBid = await this.constructor.findOne({
      auctionId: this.auctionId,
      isCurrentBid: true
    });

    // If this is a new bid, make all previous bids for this auction no longer current
    if (this.isCurrentBid) {
      await this.constructor.updateMany(
        { auctionId: this.auctionId, isCurrentBid: true },
        { isCurrentBid: false }
      );
    }

    // Create notification for previous bidder if they got outbid
    if (previousBid && previousBid.buyerId.toString() !== this.buyerId.toString()) {
      await Notification.create({
        userId: previousBid.buyerId,
        type: 'outbid',
        title: 'You\'ve been outbid!',
        message: `Someone placed a higher bid (₹${this.bidAmount.toLocaleString()}) on ${auction.vehicleName}. Place a new bid to stay in the race!`,
        auctionId: this.auctionId,
        relatedBidId: this._id
      });
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Static method to get the current and past 3 bids for an auction
auctionBidSchema.statics.getBidsForAuction = async function (auctionId) {
  try {
    const bids = await this.find({ auctionId })
      .populate('buyerId', 'firstName lastName email')
      .sort({ bidTime: -1 })
      .limit(4);

    return bids;
  } catch (error) {
    throw error;
  }
};

// Static method to notify auction winner
auctionBidSchema.statics.notifyAuctionWinner = async function (auctionId, winnerId) {
  try {
    console.log('Notifying auction winner:', { auctionId, winnerId });

    const AuctionRequest = mongoose.model('AuctionRequest');
    const auction = await AuctionRequest.findById(auctionId);

    if (!auction) {
      throw new Error('Auction not found');
    }

    const winningBid = await this.findOne({
      auctionId: auctionId,
      buyerId: winnerId,
      isCurrentBid: true
    });

    if (!winningBid) {
      throw new Error('Winning bid not found');
    }

    // Create notification for the winner
    const notification = await Notification.create({
      userId: winnerId,
      type: 'auction_won',
      title: 'Congratulations! You won the auction!',
      message: `You won the auction for ${auction.vehicleName} with a bid of ₹${winningBid.bidAmount.toLocaleString()}. To complete the payment process, proceed through My Purchases page.`,
      auctionId: auctionId,
      relatedBidId: winningBid._id
    });

    console.log('Notification created successfully:', notification._id);
    return true;
  } catch (error) {
    console.error('Error creating winner notification:', error);
    throw error;
  }
};

// Add database indexes for query optimization
auctionBidSchema.index({ auctionId: 1, bidAmount: -1 });
auctionBidSchema.index({ auctionId: 1, isCurrentBid: 1 });
auctionBidSchema.index({ buyerId: 1 });

// Export model
const AuctionBid = mongoose.model('AuctionBid', auctionBidSchema);
export default AuctionBid;