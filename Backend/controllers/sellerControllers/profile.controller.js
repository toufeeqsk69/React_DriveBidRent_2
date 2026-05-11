// controllers/sellerControllers/profile.controller.js
import User from '../../models/User.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Profile updated',
      data: updatedUser
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { notificationPreference: req.body.notificationPreference },
      { new: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Preferences updated',
      data: updatedUser
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update preferences' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!await user.comparePassword(req.body.oldPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Old password incorrect'
      });
    }
    user.password = req.body.newPassword;
    await user.save();
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};