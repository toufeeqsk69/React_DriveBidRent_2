// Backend/routes/auctionManager.routes.js
import express from 'express';
import isAuctionManager from '../middlewares/auction_manager.middleware.js';


// Controllers - using named imports (clean & consistent)
import { getDashboard } from '../controllers/auctionManager/dashboard.controller.js';
import { getRequests, rejectRequest } from '../controllers/auctionManager/requests.controller.js';
import {
  getPending,
  getReview,
  updateStatus,
  getPendingCarDetails
} from '../controllers/auctionManager/pending.controller.js';
import { getApproved } from '../controllers/auctionManager/approved.controller.js';
import { getAssignMechanic, assignMechanic } from '../controllers/auctionManager/assignMechanic.controller.js';
import { startAuction, stopAuction, viewBids, reAuction } from '../controllers/auctionManager/auction.controller.js';
import { pokeBuyer } from '../controllers/auctionManager/pokeBuyer.controller.js';
import { getProfile, updatePhone, changePassword } from '../controllers/auctionManager/profile.controller.js';

const router = express.Router();

// Apply authentication middleware to ALL routes
// router.use(isAuctionManager);

// === Dashboard ===
router.get('/dashboard', getDashboard);

// === Requests ===
router.get('/requests', getRequests);
router.post('/reject-request/:id', rejectRequest);

// === Pending Cars ===
router.get('/pending', getPending);
router.get('/get-review/:id', getReview);
router.post('/update-status/:id', updateStatus);
router.get('/pending-car-details/:id', getPendingCarDetails);

// === Approved Cars ===
router.get('/approved', getApproved);

// === Assign Mechanic ===
router.get('/assign-mechanic/:id', getAssignMechanic);
router.post('/assign-mechanic/:id', assignMechanic);

// === Auction Control ===
router.post('/start-auction/:id', startAuction);
router.post('/stop-auction/:id', stopAuction);
router.get('/view-bids/:id', viewBids);
router.post('/re-auction/:id', reAuction);
router.post('/poke-buyer/:id', pokeBuyer);

// === Profile ===
router.get('/profile', getProfile);
router.post('/update-phone', updatePhone);
router.post('/change-password', changePassword);

export default router;