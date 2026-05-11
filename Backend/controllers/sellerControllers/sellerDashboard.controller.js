// controllers/sellerControllers/sellerDashboard.controller.js
import User from '../../models/User.js';

export const getSellerDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard' });
  }
};