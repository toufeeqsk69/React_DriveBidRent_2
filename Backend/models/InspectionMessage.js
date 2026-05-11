import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'InspectionChat', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  read: { type: Boolean, default: false },
  delivered: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

messageSchema.index({ chat: 1, createdAt: -1 });

export default mongoose.model('InspectionMessage', messageSchema);
