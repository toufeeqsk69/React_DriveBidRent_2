// models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['outbid', 'auction_ended', 'auction_won', 'new_auction', 'payment_failed_report', 'payment_deadline_expired']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionRequest'
  },
  relatedBidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionBid'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// After saving a notification, set the user's notificationFlag to true so frontend can show a badge
notificationSchema.post('save', async function(doc) {
  try {
    const User = (await import('./User.js')).default;
    if (doc && doc.userId) {
      await User.findByIdAndUpdate(doc.userId, { notificationFlag: true });
    }
  } catch (err) {
    console.error('Failed to update user notificationFlag:', err);
  }
});

// Indexes for DB optimization
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

export default mongoose.model('Notification', notificationSchema);