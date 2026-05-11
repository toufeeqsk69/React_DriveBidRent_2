import mongoose from 'mongoose';

const { Schema } = mongoose;

const inspectionChatSchema = new Schema({
  mechanic: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  auctionManager: { type: Schema.Types.ObjectId, ref: 'AuctionManager', required: true },
  seller: { type: Schema.Types.ObjectId, ref: 'User' },
  inspectionTask: { type: Schema.Types.ObjectId, ref: 'AuctionRequest', required: true },
  title: { type: String },
  expiresAt: { type: Date, required: true },
  lastMessage: String,
  lastMessageAt: Date,
  unreadCountMechanic: { type: Number, default: 0 },
  unreadCountAuctionManager: { type: Number, default: 0 },
}, { timestamps: true });

inspectionChatSchema.index({ mechanic: 1, expiresAt: 1 });
inspectionChatSchema.index({ auctionManager: 1, expiresAt: 1 });
inspectionChatSchema.index({ seller: 1, expiresAt: 1 });
inspectionChatSchema.index({ inspectionTask: 1 });

export default mongoose.model('InspectionChat', inspectionChatSchema);
