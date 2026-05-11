import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import RentalRequest from '../models/RentalRequest.js';
import AuctionRequest from '../models/AuctionRequest.js';

// GET /api/chat/my-chats
export const getMyChats = async (req, res) => {
  try {
    const userId = req.user._id;
    // Include expired chats so users can still delete them
    const chats = await Chat.find({
      $or: [{ buyer: userId }, { seller: userId }, { mechanic: userId }, { auctionManager: userId }]
    })
      .populate('buyer', 'firstName lastName profileImage _id')
      .populate('seller', 'firstName lastName profileImage _id')
      .populate('mechanic', 'firstName lastName profileImage _id')
      .populate('auctionManager', 'firstName lastName profileImage _id')
      .populate('rentalRequest')
      .populate('auctionRequest')
      .populate({ path: 'inspectionTask', select: 'vehicleName vehiclePhotos make model year images' })
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .lean();

    // compute unread counts per chat for this user and set role-specific unread field
    const unreadField = 
      req.user.userType === 'mechanic' ? 'unreadCountMechanic' :
      req.user.userType === 'auction_manager' ? 'unreadCountAuctionManager' :
      req.user.userType === 'buyer' ? 'unreadCountBuyer' :
      'unreadCountSeller';

    const chatsWithUnread = await Promise.all(chats.map(async c => {
      const unread = await Message.countDocuments({
        chat: c._id,
        sender: { $ne: userId },
        read: false
      });
      return { ...c, unreadCount: unread, [unreadField]: unread };
    }));

    res.json({ success: true, data: chatsWithUnread });
  } catch (err) {
    console.error('getMyChats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/chat/:chatId
export const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId)
      .populate('buyer', 'firstName lastName profileImage _id')
      .populate('seller', 'firstName lastName profileImage _id')
      .populate('mechanic', 'firstName lastName profileImage _id')
      .populate('auctionManager', 'firstName lastName profileImage _id')
      .populate('rentalRequest')
      .populate('auctionRequest')
      .populate({ path: 'inspectionTask', select: 'vehicleName vehiclePhotos make model year images' })
      .lean();

    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const uid = req.user._id.toString();
    const allowed = [chat?.buyer?._id?.toString?.(), chat?.seller?._id?.toString?.(), chat?.mechanic?._id?.toString?.(), chat?.auctionManager?._id?.toString?.()].some(id => id === uid);
    if (!allowed) return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, data: { chat, myUserId: req.user._id } });
  } catch (err) {
    console.error('getChatById error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/chat/:chatId/messages
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50, since } = req.query;

    const chat = await Chat.findById(chatId).lean();
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const uid = req.user._id.toString();
    const allowed2 = [chat?.buyer?.toString?.(), chat?.seller?.toString?.(), chat?.mechanic?.toString?.(), chat?.auctionManager?.toString?.()].some(id => id === uid);
    if (!allowed2) return res.status(403).json({ success: false, message: 'Access denied' });

    const query = { chat: chatId };
    if (since) {
      // accept ISO string or numeric timestamp
      const sinceDate = isNaN(Number(since)) ? new Date(since) : new Date(Number(since));
      if (!isNaN(sinceDate.getTime())) {
        // return messages created after since OR messages updated after since (for status changes)
        query.$or = [
          { createdAt: { $gt: sinceDate } },
          { updatedAt: { $gt: sinceDate } }
        ];
      }
    }

    // If since provided, return all messages after since (no pagination). Otherwise, support pagination.
    let messagesQuery = Message.find(query).sort({ createdAt: 1 }).populate('sender', 'firstName lastName profileImage');

    if (!since) {
      messagesQuery = messagesQuery.skip((page - 1) * limit).limit(parseInt(limit));
    }

    const messages = await messagesQuery.lean();

    // mark delivered for messages fetched by the recipient (sender !== requester)
    try {
      const undeliveredIds = messages.filter(m => !m.delivered && m.sender && ((m.sender._id && m.sender._id.toString()) || (m.sender.toString && m.sender.toString())) !== uid).map(m => m._id);
      if (undeliveredIds.length) {
        await Message.updateMany({ _id: { $in: undeliveredIds } }, { $set: { delivered: true, updatedAt: new Date() } });
        // reflect change in returned payload
        messages.forEach(m => { if (undeliveredIds.find(id => id.toString() === m._id.toString())) m.delivered = true; });
      }
    } catch (e) {
      console.error('mark delivered error:', e);
    }

    res.json({ success: true, data: messages });
  } catch (err) {
    console.error('getMessages error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/chat/:chatId/message
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) return res.status(400).json({ success: false, message: 'Message content required' });

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const uid = req.user._id.toString();
    const allowed3 = [chat?.buyer?.toString?.(), chat?.seller?.toString?.(), chat?.mechanic?.toString?.(), chat?.auctionManager?.toString?.()].some(id => id === uid);
    if (!allowed3) return res.status(403).json({ success: false, message: 'Access denied' });

    // check expiry
    if (new Date() > new Date(chat.expiresAt)) {
      return res.status(403).json({ success: false, message: 'Chat expired and read-only' });
    }

    // Mark as delivered=true on creation so sender sees double-tick immediately (we'll
    // still toggle read=true when recipient opens the chat)
    const message = await Message.create({ chat: chatId, sender: req.user._id, content, delivered: true, read: false });
    await message.populate('sender', 'firstName lastName profileImage');

    // Update chat's lastMessage and lastMessageAt for proper sorting in chat list
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: content,
      lastMessageAt: message.createdAt
    });

    // No realtime emit (using DB-backed polling/REST)

    res.json({ success: true, data: message });
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/chat/:chatId/mark-read
export const markMessagesRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId).lean();
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const uid2 = req.user._id.toString();
    const allowed4 = [chat?.buyer?.toString?.(), chat?.seller?.toString?.(), chat?.mechanic?.toString?.(), chat?.auctionManager?.toString?.()].some(id => id === uid2);
    if (!allowed4) return res.status(403).json({ success: false, message: 'Access denied' });

    const result = await Message.updateMany({ chat: chatId, sender: { $ne: req.user._id }, read: false }, { $set: { read: true, updatedAt: new Date() } });
    res.json({ success: true, updated: result.nModified || result.modifiedCount || 0 });
  } catch (err) {
    console.error('markMessagesRead error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/chat/:chatId
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId).lean();
    
    // Handle race condition: if chat already deleted, return success
    if (!chat) {
      console.log('Chat already deleted (race condition), returning success');
      return res.json({ success: true, message: 'Chat deleted successfully' });
    }

    const uid = req.user._id.toString();
    const allowed = [chat?.buyer?.toString?.(), chat?.seller?.toString?.(), chat?.mechanic?.toString?.(), chat?.auctionManager?.toString?.()].some(id => id === uid);
    if (!allowed) return res.status(403).json({ success: false, message: 'Access denied' });

    // Delete all messages associated with this chat
    await Message.deleteMany({ chat: chatId });
    
    // Delete the chat
    await Chat.findByIdAndDelete(chatId);

    res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (err) {
    console.error('deleteChat error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Utility: create chat for rental
export const createChatForRental = async (rentalRequest) => {
  try {
    if (!rentalRequest || !rentalRequest._id) return null;
    const existing = await Chat.findOne({ rentalRequest: rentalRequest._id });
    if (existing) return existing;

    const drop = rentalRequest.dropDate ? new Date(rentalRequest.dropDate) : new Date();
    const expiresAt = new Date(drop.getTime() + 2 * 24 * 60 * 60 * 1000);

    const chat = await Chat.create({
      type: 'rental',
      rentalRequest: rentalRequest._id,
      buyer: rentalRequest.buyerId,
      seller: rentalRequest.sellerId,
      expiresAt,
      title: `Rental: ${rentalRequest.vehicleName}`
    });

    return chat;
  } catch (err) {
    console.error('createChatForRental error:', err);
    return null;
  }
};

// create chat for auction winner
export const createChatForAuction = async (auction, winnerId, soldAt = new Date()) => {
  try {
    if (!auction || !auction._id || !winnerId) return null;
    const existing = await Chat.findOne({ auctionRequest: auction._id });
    if (existing) return existing;

    const expiresAt = new Date(soldAt.getTime() + 5 * 24 * 60 * 60 * 1000);
    const chat = await Chat.create({
      type: 'auction',
      auctionRequest: auction._id,
      buyer: winnerId,
      seller: auction.sellerId,
      expiresAt,
      finalPrice: auction.finalPurchasePrice || undefined,
      title: `Auction Won: ${auction.vehicleName}`
    });

    return chat;
  } catch (err) {
    console.error('createChatForAuction error:', err);
    return null;
  }
};

// Route handler: create (or fetch) chat for a given purchase id (auction purchase)
export const createChatForPurchaseHandler = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    if (!purchaseId) return res.status(400).json({ success: false, message: 'purchaseId required' });

    const Purchase = (await import('../models/Purchase.js')).default;
    const AuctionRequest = (await import('../models/AuctionRequest.js')).default;

    const purchase = await Purchase.findById(purchaseId).lean();
    if (!purchase) return res.status(404).json({ success: false, message: 'Purchase not found' });

    const auction = await AuctionRequest.findById(purchase.auctionId).lean();
    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found for purchase' });

    const chat = await createChatForAuction(auction, purchase.buyerId, purchase.purchaseDate || new Date());
    if (!chat) return res.status(500).json({ success: false, message: 'Failed to create chat' });

    res.json({ success: true, data: { chat } });
  } catch (err) {
    console.error('createChatForPurchaseHandler error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Route handler: create (or fetch) chat for a rental id
export const createChatForRentalHandler = async (req, res) => {
  try {
    const { rentalId } = req.params;
    if (!rentalId) return res.status(400).json({ success: false, message: 'rentalId required' });

    const RentalRequest = (await import('../models/RentalRequest.js')).default;
    const rental = await RentalRequest.findById(rentalId).lean();
    if (!rental) return res.status(404).json({ success: false, message: 'Rental not found' });

    // createChatForRental expects a rentalRequest document (with _id, buyerId, sellerId, dropDate)
    const chat = await createChatForRental(rental);
    if (!chat) return res.status(500).json({ success: false, message: 'Failed to create chat' });

    res.json({ success: true, data: { chat } });
  } catch (err) {
    console.error('createChatForRentalHandler error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Route handler: create (or fetch) chat for an auction (not requiring a purchase)
export const createChatForAuctionHandler = async (req, res) => {
  try {
    console.log('=== CREATE AUCTION CHAT HANDLER ===');
    const { auctionId } = req.params;
    console.log('Auction ID:', auctionId);
    console.log('User:', req.user);
    
    if (!auctionId) return res.status(400).json({ success: false, message: 'auctionId required' });

    const AuctionRequest = (await import('../models/AuctionRequest.js')).default;
    console.log('Looking up auction...');
    const auction = await AuctionRequest.findById(auctionId).lean();
    console.log('Auction found:', auction ? 'Yes' : 'No');
    
    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });

    const buyerId = req.user._id; // The logged-in buyer
    const sellerId = auction.sellerId;
    console.log('Buyer ID:', buyerId);
    console.log('Seller ID:', sellerId);

    // Check if chat already exists between this buyer and seller for this auction
    console.log('Checking for existing chat...');
    const existing = await Chat.findOne({ 
      auctionRequest: auctionId, 
      buyer: buyerId, 
      seller: sellerId 
    });
    
    if (existing) {
      console.log('Existing chat found:', existing._id);
      return res.json({ success: true, data: { chat: existing } });
    }

    console.log('Creating new chat...');
    // Create new chat with 30 days expiry (or until auction ends + 5 days)
    const auctionEndDate = auction.endDate ? new Date(auction.endDate) : new Date();
    const expiresAt = new Date(Math.max(
      auctionEndDate.getTime() + 5 * 24 * 60 * 60 * 1000, // auction end + 5 days
      Date.now() + 30 * 24 * 60 * 60 * 1000 // or 30 days from now
    ));

    const chat = await Chat.create({
      type: 'auction',
      auctionRequest: auctionId,
      buyer: buyerId,
      seller: sellerId,
      expiresAt,
      title: `Auction: ${auction.vehicleName || 'Vehicle'}`
    });

    console.log('Chat created successfully:', chat._id);
    res.json({ success: true, data: { chat } });
  } catch (err) {
    console.error('createChatForAuctionHandler error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export default { 
  getMyChats, 
  getChatById, 
  getMessages, 
  sendMessage, 
  markMessagesRead, 
  deleteChat, 
  createChatForRental, 
  createChatForRentalHandler,
  createChatForAuctionHandler
};

// Utility to expire an inspection chat immediately (call when inspection/report completes)
export const expireInspectionChat = async (auctionRequestId) => {
  try {
    return await Chat.updateOne(
      { inspectionTask: auctionRequestId, type: 'inspection' },
      { expiresAt: new Date() }
    );
  } catch (err) {
    console.error('expireInspectionChat error:', err);
    return null;
  }
};
