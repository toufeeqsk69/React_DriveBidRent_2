import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ChatController from '../controllers/chat.controller.js';

const router = express.Router();

// lightweight auth middleware for chat routes (accepts any logged-in user)
const chatAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt || req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid token' });
    req.user = user;
    next();
  } catch (err) {
    console.error('chatAuth error:', err);
    return res.status(401).json({ success: false, message: 'Authentication error' });
  }
};

router.use(chatAuth);

router.get('/my-chats', ChatController.getMyChats);
router.get('/:chatId', ChatController.getChatById);
router.get('/:chatId/messages', ChatController.getMessages);
router.post('/:chatId/message', ChatController.sendMessage);
router.post('/:chatId/mark-read', ChatController.markMessagesRead);
router.delete('/:chatId', ChatController.deleteChat);

// Create-or-get chat endpoints (used by frontend Contact Seller)
router.post('/create/rental/:rentalId', ChatController.createChatForRentalHandler);
router.post('/create/auction/:auctionId', ChatController.createChatForAuctionHandler);

export default router;
