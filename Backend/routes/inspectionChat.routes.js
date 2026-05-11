import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuctionManager from '../models/AuctionManager.js';
import InspectionController from '../controllers/inspectionChat.controller.js';

const router = express.Router();

// lightweight auth middleware (same pattern as chat.routes)
const chatAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt || req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');
    
    // Check if user is an auction manager or regular user
    let user;
    if (decoded.userType === 'auction_manager') {
      user = await AuctionManager.findById(decoded.id).select('-password');
    } else {
      user = await User.findById(decoded.id).select('-password');
    }
    
    if (!user) return res.status(401).json({ success: false, message: 'Invalid token' });
    req.user = user;
    next();
  } catch (err) {
    console.error('inspectionChatAuth error:', err);
    return res.status(401).json({ success: false, message: 'Authentication error' });
  }
};

router.use(chatAuth);

router.get('/my-chats', InspectionController.getMyInspectionChats);
router.get('/:chatId', InspectionController.getInspectionChatById);
router.get('/:chatId/messages', InspectionController.getInspectionMessages);
router.post('/:chatId/message', InspectionController.sendInspectionMessage);
router.post('/:chatId/mark-read', InspectionController.markInspectionMessagesRead);
router.delete('/:chatId', InspectionController.deleteInspectionChat);

export default router;
