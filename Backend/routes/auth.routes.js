// routes/auth.routes.js
import express from 'express';
import authController from '../controllers/auth.controller.js';
import auctionManagerAuthController from '../controllers/auctionManagerAuth.controller.js';

const router = express.Router();

// Regular user routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.post('/verify-signup-otp', authController.verifySignupOtp);
// Auction Manager routes
router.post('/auctionmanager/signup', auctionManagerAuthController.signup);
router.post('/auctionmanager/login', auctionManagerAuthController.login);
router.get('/auctionmanager/logout', auctionManagerAuthController.logout);

// LOGOUT: Clear cookie + return redirect
router.get('/logout', (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'strict'
  });
  return res.json({
    success: true,
    message: 'Logged out successfully',
    redirectUrl: '/'
  });
});

export default router;