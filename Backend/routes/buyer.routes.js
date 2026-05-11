// routes/buyer.routes.js
import { Router } from 'express';
import buyerMiddleware from '../middlewares/buyer.middleware.js';
import checkBlocked from '../middlewares/checkBlocked.middleware.js';
import {
  getAuctions,
  getSingleAuction,
  placeBid,
  getAuctionWinnerStatus,
  getAuctionConfirmPayment,
  completeAuctionPayment,
  getCompletedAuctionDetails
} from '../controllers/buyer/auctions.controller.js';
import { getDashboardHome } from '../controllers/buyer/dashboard.controller.js';
import { getMyBids } from '../controllers/buyer/my-bids.controller.js';
import {
  getPurchase,
  getAuctionPurchaseDetails,
  getRentalDetails
} from '../controllers/buyer/purchase.controller.js';
import {
  getRentals,
  getSingleRental,
  bookRental
} from '../controllers/buyer/rentals.controller.js';
import {
  getWishlist,
  getWishlistApi,
  addToWishlistApi,
  removeFromWishlistApi
} from '../controllers/buyer/wishlist.controller.js';
import {
  addReview,
  getReviews,
  checkCanReview
} from '../controllers/buyer/review.controller.js';
import {
  createCheckoutSession,
  verifySession
} from '../controllers/buyer/payment.controller.js';
import Notification from '../models/Notification.js';

const router = Router();

// === DIRECT API ENDPOINTS FOR REACT FRONTEND ===
router.get('/dashboard', buyerMiddleware, getDashboardHome);
router.get('/auctions', buyerMiddleware, getAuctions);
router.get('/rentals', buyerMiddleware, getRentals);
router.get('/auctions/:id', buyerMiddleware, getSingleAuction);
router.get('/rentals/:id', buyerMiddleware, getSingleRental);

// === DASHBOARD & NAVIGATION (Legacy EJS support) ===
router.get('/buyer_dashboard', buyerMiddleware, async (req, res) => {
  const page = req.query.page || 'dashboard';
  if (page === 'dashboard') return getDashboardHome(req, res);
  if (page === 'auctions') return getAuctions(req, res);
  if (page === 'rentals') return getRentals(req, res);
  if (page === 'wishlist') return getWishlist(req, res);
  if (page === 'rental' && req.query.id) return getSingleRental(req, res);
  if (page === 'auction' && req.query.id) return getSingleAuction(req, res);
  return getDashboardHome(req, res);
});

// === AUCTIONS ===
router.post('/auctions/:id/bid', buyerMiddleware, checkBlocked, placeBid);
router.post('/auction/place-bid', buyerMiddleware, checkBlocked, placeBid); // Legacy
router.get('/auction/winner-status/:id', buyerMiddleware, getAuctionWinnerStatus);
router.get('/auction/confirm-payment/:id', buyerMiddleware, getAuctionConfirmPayment);
router.post('/auction/complete-payment/:id', buyerMiddleware, checkBlocked, completeAuctionPayment);
router.get('/auctions/:id/completed', buyerMiddleware, getCompletedAuctionDetails);

// === MY BIDS ===
router.get('/bids', buyerMiddleware, getMyBids);
router.get('/buyer_dashboard/my-bids', buyerMiddleware, getMyBids); // Legacy

// === PURCHASE ===
router.get('/purchases', buyerMiddleware, getPurchase);
router.get('/purchase', buyerMiddleware, getPurchase); // Legacy
router.get('/purchases/:id', buyerMiddleware, getAuctionPurchaseDetails);
router.get('/purchase_details', buyerMiddleware, getAuctionPurchaseDetails); // Legacy
router.get('/rental_details/:id', buyerMiddleware, getRentalDetails);

// === RENTALS ===
router.post('/rentals/book', buyerMiddleware, checkBlocked, bookRental);
router.get('/rental', buyerMiddleware, (req, res) => {
  const id = req.query.id;
  res.redirect(`/api/buyer/buyer_dashboard?page=rental&id=${id}`);
});
router.get('/rentals', buyerMiddleware, (req, res) => {
  res.redirect('/api/buyer/buyer_dashboard?page=rentals');
});
router.post('/rental', buyerMiddleware, checkBlocked, bookRental); // Legacy

// === REVIEWS ===
router.post('/rentals/:id/reviews', buyerMiddleware, addReview);
router.get('/rentals/:id/reviews', buyerMiddleware, getReviews);
router.get('/rentals/:id/can-review', buyerMiddleware, checkCanReview);

// === WISHLIST ===
router.get('/wishlist', buyerMiddleware, getWishlistApi);
router.get('/api/wishlist', buyerMiddleware, getWishlistApi);
router.post('/wishlist', buyerMiddleware, checkBlocked, addToWishlistApi);
router.post('/api/wishlist', buyerMiddleware, checkBlocked, addToWishlistApi);
router.delete('/wishlist', buyerMiddleware, checkBlocked, removeFromWishlistApi);
router.delete('/api/wishlist', buyerMiddleware, checkBlocked, removeFromWishlistApi);

// === PAYMENTS ===
router.post('/payment/create-checkout-session', buyerMiddleware, checkBlocked, createCheckoutSession);
router.get('/payment/verify-session', buyerMiddleware, verifySession);

// === PROFILE ===
router.get('/profile', buyerMiddleware, async (req, res) => {
  res.json({
    success: true,
    message: 'Profile loaded',
    data: { user: req.user }
  });
});

router.put('/profile', buyerMiddleware, checkBlocked, async (req, res) => {
  const { firstName, lastName, email, phone, doorNo, street, city, state } = req.body;
  const userId = req.user._id;
  if (!firstName || !lastName || !email || !phone) {
    return res.status(400).json({ success: false, message: 'Required fields are missing' });
  }
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ success: false, message: 'Phone number must be 10 digits' });
  }

  const User = (await import('../models/User.js')).default;
  const existingUser = await User.findOne({ email, _id: { $ne: userId } });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already in use' });
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { firstName, lastName, email, phone, doorNo: doorNo || '', street: street || '', city: city || '', state: state || '' },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: updatedUser,
      userId: updatedUser._id,
      userEmail: email,
      userFirstName: firstName,
      userLastName: lastName,
      userPhone: phone,
      userDoorNo: doorNo,
      userStreet: street,
      userCity: city,
      userState: state
    }
  });
});

router.post('/update-profile', buyerMiddleware, async (req, res) => {
  const { firstName, lastName, email, phone, doorNo, street, city, state } = req.body;
  const userId = req.user._id;
  if (!firstName || !lastName || !email || !phone) {
    return res.status(400).json({ success: false, message: 'Required fields are missing' });
  }
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ success: false, message: 'Phone number must be 10 digits' });
  }

  const User = (await import('../models/User.js')).default;
  const existingUser = await User.findOne({ email, _id: { $ne: userId } });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already in use' });
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { firstName, lastName, email, phone, doorNo: doorNo || '', street: street || '', city: city || '', state: state || '' },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: updatedUser,
      userId: updatedUser._id,
      userEmail: email,
      userFirstName: firstName,
      userLastName: lastName,
      userPhone: phone,
      userDoorNo: doorNo,
      userStreet: street,
      userCity: city,
      userState: state
    }
  });
});

router.post('/change-password', buyerMiddleware, async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user._id;
  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'All password fields are required' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'New passwords do not match' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
  }

  const User = (await import('../models/User.js')).default;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully',
    data: {
      userId: user._id,
      userEmail: user.email,
      userFirstName: user.firstName,
      userLastName: user.lastName,
      userPhone: user.phone,
      userDoorNo: user.doorNo,
      userStreet: user.street,
      userCity: user.city,
      userState: user.state
    }
  });
});

// === NOTIFICATIONS ===
router.get('/notifications', buyerMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ userId })
      .populate('auctionId', 'vehicleName vehicleImage')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });
    res.json({
      success: true,
      message: 'Notifications fetched',
      data: { notifications, unreadCount, activePage: 'notifications' }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.json({
      success: false,
      message: 'Failed to load notifications',
      data: { notifications: [], unreadCount: 0 }
    });
  }
});

router.put('/notifications/:id/read', buyerMiddleware, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: 'Failed to mark notification as read' });
  }
});

// Mark the notifications 'seen' flag (clears notificationFlag)
router.put('/notifications/seen', buyerMiddleware, async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    await User.findByIdAndUpdate(req.user._id, { notificationFlag: false });
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'Notification flag cleared and marked as read' });
  } catch (error) {
    console.error('Error clearing notification flag:', error);
    res.status(500).json({ success: false, message: 'Failed to clear notification flag' });
  }
});

router.post('/notifications/mark-all-read', buyerMiddleware, async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    // clear the user's notificationFlag so badge/dot disappears
    const User = (await import('../models/User.js')).default;
    await User.findByIdAndUpdate(req.user._id, { notificationFlag: false });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: 'Failed to delete all notifications' });
  }
});

router.get('/notifications/unread-count', buyerMiddleware, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });
    res.json({ success: true, data: { unreadCount } });
  } catch (error) {
    res.json({ success: false, data: { unreadCount: 0 } });
  }
});

// === UPLOAD PHOTO ===
router.post('/upload/photo', buyerMiddleware, async (req, res) => {
  try {
    // This would typically handle file upload to cloud storage
    // For now, return a mock response
    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: { photoUrl: 'https://example.com/uploaded-photo.jpg' }
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ success: false, message: 'Failed to upload photo' });
  }
});

// === ABOUT US (Static) ===
router.get('/about', (req, res) => {
  res.json({
    success: true,
    message: 'About Us page',
    data: { page: 'about' }
  });
});

router.get('/aboutus', (req, res) => {
  res.json({
    success: true,
    message: 'About Us page',
    data: { page: 'aboutus' }
  });
});

// === DRIVER REDIRECTS (Legacy) ===
router.get('/driver', (req, res) => {
  const id = req.query.id;
  res.redirect(`/api/buyer/buyer_dashboard?page=driver&id=${id}`);
});
router.get('/drivers', (req, res) => {
  res.redirect('/api/buyer/buyer_dashboard?page=drivers');
});

export default router;