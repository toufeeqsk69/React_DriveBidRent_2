import InspectionChat from '../models/InspectionChat.js';
import InspectionMessage from '../models/InspectionMessage.js';
import User from '../models/User.js';
import AuctionManager from '../models/AuctionManager.js';

// lightweight utility to get current user's id
const getUserId = (req) => req.user && req.user._id;

export const getMyInspectionChats = async (req, res) => {
  try {
    const uid = getUserId(req);
    const now = new Date();
    const chats = await InspectionChat.find({
      $and: [
        { expiresAt: { $gt: now } },
        { $or: [{ mechanic: uid }, { auctionManager: uid }, { seller: uid }] }
      ]
    })
      .populate('mechanic', 'firstName lastName profileImage _id')
      .populate('auctionManager', 'firstName lastName profileImage _id')
      .populate('seller', 'firstName lastName profileImage _id')
      .populate({ path: 'inspectionTask', select: 'vehicleName vehicleImage make model year _id' })
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .lean();

    const chatsWithUnread = await Promise.all(chats.map(async c => {
      const unread = await InspectionMessage.countDocuments({ chat: c._id, sender: { $ne: uid }, read: false });
      return { ...c, unreadCount: unread };
    }));

    res.json({ success: true, data: chatsWithUnread });
  } catch (err) {
    console.error('getMyInspectionChats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getInspectionChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await InspectionChat.findById(chatId)
      .populate('mechanic', 'firstName lastName profileImage _id')
      .populate('auctionManager', 'firstName lastName profileImage _id')
      .populate('seller', 'firstName lastName profileImage _id')
      .populate({ path: 'inspectionTask', select: 'vehicleName vehicleImage make model year _id' })
      .lean();

    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const uid = getUserId(req);
    const allowed = [String(chat.mechanic?._id || ''), String(chat.auctionManager?._id || ''), String(chat.seller?._id || '')].some(id => id === String(uid));
    if (!allowed) return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, data: { chat, myUserId: uid } });
  } catch (err) {
    console.error('getInspectionChatById error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getInspectionMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50, since } = req.query;

    const chat = await InspectionChat.findById(chatId).lean();
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const uid = String(getUserId(req));
    const allowed = [String(chat.mechanic || ''), String(chat.auctionManager || ''), String(chat.seller || '')].some(id => id === uid);
    if (!allowed) return res.status(403).json({ success: false, message: 'Access denied' });

    const query = { chat: chatId };
    if (since) {
      const sinceDate = isNaN(Number(since)) ? new Date(since) : new Date(Number(since));
      if (!isNaN(sinceDate.getTime())) {
        query.$or = [ { createdAt: { $gt: sinceDate } }, { updatedAt: { $gt: sinceDate } } ];
      }
    }

    let messagesQuery = InspectionMessage.find(query).sort({ createdAt: 1 }).populate('sender', 'firstName lastName profileImage');
    if (!since) messagesQuery = messagesQuery.skip((page - 1) * limit).limit(parseInt(limit));

    const messages = await messagesQuery.lean();

    // mark delivered for recipient
    try {
      const undeliveredIds = messages.filter(m => !m.delivered && m.sender && ((m.sender._id && m.sender._id.toString()) || (m.sender.toString && m.sender.toString())) !== uid).map(m => m._id);
      if (undeliveredIds.length) {
        await InspectionMessage.updateMany({ _id: { $in: undeliveredIds } }, { $set: { delivered: true, updatedAt: new Date() } });
        messages.forEach(m => { if (undeliveredIds.find(id => id.toString() === m._id.toString())) m.delivered = true; });
      }
    } catch (e) {
      console.error('mark delivered error (inspection):', e);
    }

    res.json({ success: true, data: messages });
  } catch (err) {
    console.error('getInspectionMessages error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const sendInspectionMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ success: false, message: 'Message content required' });

    const chat = await InspectionChat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const uid = String(getUserId(req));
    const allowed = [String(chat.mechanic || ''), String(chat.auctionManager || ''), String(chat.seller || '')].some(id => id === uid);
    if (!allowed) return res.status(403).json({ success: false, message: 'Access denied' });

    if (new Date() > new Date(chat.expiresAt)) return res.status(403).json({ success: false, message: 'Chat expired and read-only' });

    const message = await InspectionMessage.create({ chat: chatId, sender: req.user._id, content, delivered: true, read: false });
    await message.populate('sender', 'firstName lastName profileImage');

    // update chat metadata
    try {
      await InspectionChat.findByIdAndUpdate(chatId, { lastMessage: content, lastMessageAt: new Date() });
    } catch (uErr) { console.error('Failed to update inspection chat metadata:', uErr); }

    res.json({ success: true, data: message });
  } catch (err) {
    console.error('sendInspectionMessage error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const markInspectionMessagesRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await InspectionChat.findById(chatId).lean();
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const uid = String(getUserId(req));
    const allowed = [String(chat.mechanic || ''), String(chat.auctionManager || ''), String(chat.seller || '')].some(id => id === uid);
    if (!allowed) return res.status(403).json({ success: false, message: 'Access denied' });

    const result = await InspectionMessage.updateMany({ chat: chatId, sender: { $ne: req.user._id }, read: false }, { $set: { read: true, updatedAt: new Date() } });
    res.json({ success: true, updated: result.nModified || result.modifiedCount || 0 });
  } catch (err) {
    console.error('markInspectionMessagesRead error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteInspectionChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await InspectionChat.findById(chatId).lean();
    
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const uid = String(getUserId(req));
    // Only auction manager can delete the chat
    if (String(chat.auctionManager || '') !== uid) {
      return res.status(403).json({ success: false, message: 'Only auction manager can delete this chat' });
    }

    // Delete all messages in this chat
    await InspectionMessage.deleteMany({ chat: chatId });
    
    // Delete the chat itself
    await InspectionChat.findByIdAndDelete(chatId);

    res.json({ success: true, message: 'Inspection chat deleted successfully' });
  } catch (err) {
    console.error('deleteInspectionChat error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default { getMyInspectionChats, getInspectionChatById, getInspectionMessages, sendInspectionMessage, markInspectionMessagesRead, deleteInspectionChat };
