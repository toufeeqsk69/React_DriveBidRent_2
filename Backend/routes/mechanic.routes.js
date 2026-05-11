// routes/mechanic.routes.js
import express from 'express';
import AuctionRequest from '../models/AuctionRequest.js';
import User from '../models/User.js';
import mechanicMiddleware from '../middlewares/mechanic.middleware.js';
import { scheduleInspection, submitInspection } from '../controllers/mechanic/inspection.controller.js';

const router = express.Router();

/* ---------- Dashboard (index) ---------- */
router.get('/dashboard', mechanicMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (user.approved_status !== 'Yes') {
      return res.json({
        success: true,
        message: 'Mechanic not approved',
        data: { showApprovalPopup: true, assignedVehicles: [], displayedVehicles: [], completedTasks: [], allCompletedTasks: [] }
      });
    }

    const assignedVehicles = await AuctionRequest.find({
      assignedMechanic: req.user._id,
      status: 'assignedMechanic',
      reviewStatus: 'pending'
    }).sort({ createdAt: -1 });

    const allCompletedTasks = await AuctionRequest.find({
      assignedMechanic: req.user._id,
      reviewStatus: 'completed'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Dashboard data',
      data: {
        user,
        assignedVehicles,
        displayedVehicles: assignedVehicles.slice(0, 3),
        completedTasks: allCompletedTasks.slice(0, 2),
        allCompletedTasks,
        showApprovalPopup: false
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', data: {} });
  }
});

/* ---------- Pending Tasks ---------- */
router.get('/pending-tasks', mechanicMiddleware, async (req, res) => {
  try {
    const pendingTasks = await AuctionRequest.find({
      status: 'pending',
      assignedMechanic: req.user._id
    }).populate('sellerId', 'firstName lastName');

    const tasks = pendingTasks.map(ar => ({
      _id: ar._id,
      vehicle: ar,
      owner: `${ar.sellerId.firstName} ${ar.sellerId.lastName}`
    }));

    res.json({ success: true, message: 'Pending tasks', data: { tasks } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', data: { tasks: [] } });
  }
});

/* ---------- Accept / Decline Task ---------- */
router.post('/pending-tasks/:id/accept', mechanicMiddleware, async (req, res) => {
  try {
    const task = await AuctionRequest.findOneAndUpdate(
      { _id: req.params.id, status: 'pending', assignedMechanic: req.user._id },
      { status: 'assignedMechanic' },
      { new: true }
    );
    if (!task) return res.status(400).json({ success: false, message: 'Task not found or not pending' });
    res.json({ success: true, message: 'Task accepted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error accepting task' });
  }
});

router.post('/pending-tasks/:id/decline', mechanicMiddleware, async (req, res) => {
  try {
    const task = await AuctionRequest.findOneAndUpdate(
      { _id: req.params.id, status: 'pending', assignedMechanic: req.user._id },
      { status: 'rejected' },
      { new: true }
    );
    if (!task) return res.status(400).json({ success: false, message: 'Task not found or not pending' });
    res.json({ success: true, message: 'Task declined' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error declining task' });
  }
});

/* ---------- Current / Past Tasks ---------- */
router.get('/current-tasks', mechanicMiddleware, async (req, res) => {
  try {
    const assignedVehicles = await AuctionRequest.find({
      assignedMechanic: req.user._id,
      status: 'assignedMechanic',
      reviewStatus: 'pending'
    }).sort({ createdAt: -1 });
    res.json({ success: true, message: 'Current tasks', data: { assignedVehicles } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', data: { assignedVehicles: [] } });
  }
});

router.get('/past-tasks', mechanicMiddleware, async (req, res) => {
  try {
    const completedTasks = await AuctionRequest.find({
      assignedMechanic: req.user._id,
      reviewStatus: 'completed'
    }).sort({ createdAt: -1 });
    res.json({ success: true, message: 'Past tasks', data: { completedTasks } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', data: { completedTasks: [] } });
  }
});

/* ---------- Vehicle Details & Review ---------- */
router.get('/vehicle-details/:id', mechanicMiddleware, async (req, res) => {
  try {
    const vehicle = await AuctionRequest.findById(req.params.id)
      .populate('sellerId', 'firstName lastName phone doorNo street city state googleAddressLink');
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    
    // Find associated chat
    const { default: InspectionChat } = await import('../models/InspectionChat.js');
    const chat = await InspectionChat.findOne({ inspectionTask: vehicle._id });

    res.json({
      success: true,
      message: 'Vehicle details',
      data: { vehicle, seller: vehicle.sellerId, chatId: chat ? chat._id : null }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// New Standardized Multi-Point Inspection Routes
router.post('/inspection/schedule', mechanicMiddleware, scheduleInspection);
router.post('/submit-inspection/:auctionId', mechanicMiddleware, submitInspection);

router.post('/submit-review/:id', mechanicMiddleware, async (req, res) => {
  try {
    const { mechanicalCondition, bodyCondition, recommendations, conditionRating } = req.body;
    await AuctionRequest.findByIdAndUpdate(req.params.id, {
      mechanicReview: { mechanicalCondition, bodyCondition, recommendations, conditionRating },
      reviewStatus: 'completed',
      'vehicleDocumentation.documentsVerified': true,
      'vehicleDocumentation.verificationDate': new Date(),
      'vehicleDocumentation.verifiedBy': req.user._id
    });
    res.json({ success: true, message: 'Review submitted', redirect: '/mechanic/dashboard' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error submitting review' });
  }
});

/* ---------- Profile ---------- */
router.get('/profile', mechanicMiddleware, (req, res) => {
  res.json({ success: true, message: 'Profile data', data: { user: req.user } });
});

router.post('/change-password', mechanicMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password too short' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const match = await user.comparePassword(oldPassword);
    if (!match) return res.status(400).json({ success: false, message: 'Incorrect old password' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;