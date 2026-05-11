// controllers/auctionManager/profile.controller.js
import AuctionManager from '../../models/AuctionManager.js';

const send = (success, message, data = null) => ({
  success,
  message,
  data
});

export const getProfile = async (req, res) => {
  try {
    console.log('🔍 [Backend] Fetching Auction Manager profile for user ID:', req.user._id);
    
    const auctionManager = await AuctionManager.findById(req.user._id).select('-password').lean();
    
    if (!auctionManager) {
      console.log('❌ [Backend] Auction Manager not found for ID:', req.user._id);
      return res.status(404).json({
        success: false,
        message: 'Auction Manager not found'
      });
    }
    
    console.log('✅ [Backend] Auction Manager profile found:', {
      id: auctionManager._id,
      email: auctionManager.email,
      firstName: auctionManager.firstName,
      lastName: auctionManager.lastName,
      phone: auctionManager.phone
    });
    
    // Add userType to the response
    const profileData = {
      ...auctionManager,
      userType: 'auction_manager'
    };
    
    res.json({
      success: true,
      message: 'Profile loaded',
      data: { user: profileData }
    });
  } catch (error) {
    console.error('❌ [Backend] Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

export const updatePhone = async (req, res) => {
  const { phone } = req.body;
  
  console.log('📱 [Backend] Update phone request for user:', req.user._id, 'New phone:', phone);
  
  if (!/^\d{10}$/.test(phone)) {
    console.log('❌ [Backend] Invalid phone number format:', phone);
    return res.json(send(false, 'Invalid phone number'));
  }

  try {
    const updated = await AuctionManager.findByIdAndUpdate(
      req.user._id, 
      { phone },
      { new: true }
    ).select('-password');
    
    console.log('✅ [Backend] Phone updated successfully for user:', req.user._id);
    res.json(send(true, 'Phone updated', { user: updated }));
  } catch (err) {
    console.error('❌ [Backend] Phone update error:', err);
    res.json(send(false, 'Failed to update phone'));
  }
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  
  console.log('🔐 [Backend] Change password request for user:', req.user._id);
  
  if (!oldPassword || !newPassword || newPassword.length < 8) {
    console.log('❌ [Backend] Invalid password format');
    return res.json(send(false, 'Invalid password'));
  }

  try {
    const user = await AuctionManager.findById(req.user._id).select('+password');
    if (!user) {
      console.log('❌ [Backend] User not found:', req.user._id);
      return res.json(send(false, 'User not found'));
    }
    
    const isMatch = await user.comparePassword(oldPassword);
    
    if (!isMatch) {
      console.log('❌ [Backend] Incorrect current password for user:', req.user._id);
      return res.json(send(false, 'Incorrect current password'));
    }

    user.password = newPassword;
    await user.save();
    
    console.log('✅ [Backend] Password changed successfully for user:', req.user._id);
    
    // Return updated user data (without password)
    const updatedUser = await AuctionManager.findById(user._id).select('-password');
    res.json(send(true, 'Password changed', { user: updatedUser }));
  } catch (err) {
    console.error('❌ [Backend] Password change error:', err);
    res.json(send(false, 'Server error'));
  }
};