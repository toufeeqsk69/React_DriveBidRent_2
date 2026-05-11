// controllers/adminControllers/manageAuctionManagers.controllers.js
import AuctionManager from '../../models/AuctionManager.js';

const getAuctionManagers = async (req, res) => {
  try {
    // Get disapproved auction managers (pending approval)
    const disapprovedManagers = await AuctionManager.find({ 
      approved: false 
    }).sort({ createdAt: -1 }).lean();

    // Get approved auction managers
    const approvedManagers = await AuctionManager.find({ 
      approved: true 
    }).sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      message: "Auction Managers fetched successfully",
      data: { 
        disapprovedManagers, 
        approvedManagers 
      }
    });
  } catch (error) {
    console.error('Error fetching auction managers:', error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching auction managers",
      data: null
    });
  }
};

const approveAuctionManager = async (req, res) => {
  try {
    const managerId = req.params.id;
    const updatedManager = await AuctionManager.findByIdAndUpdate(
      managerId,
      { $set: { approved: true } },
      { new: true }
    );

    if (!updatedManager) {
      return res.status(404).json({ 
        success: false, 
        message: 'Auction Manager not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Auction Manager approved successfully', 
      data: updatedManager 
    });
  } catch (error) {
    console.error('Error approving auction manager:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error approving auction manager: ' + error.message 
    });
  }
};

const deleteAuctionManager = async (req, res) => {
  try {
    const managerId = req.params.id;
    const deletedManager = await AuctionManager.findByIdAndDelete(managerId);

    if (!deletedManager) {
      return res.status(404).json({ 
        success: false, 
        message: 'Auction Manager not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Auction Manager deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting auction manager:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting auction manager: ' + error.message 
    });
  }
};

const disapproveAuctionManager = async (req, res) => {
  try {
    const managerId = req.params.id;
    const updatedManager = await AuctionManager.findByIdAndUpdate(
      managerId,
      { $set: { approved: false } },
      { new: true }
    );

    if (!updatedManager) {
      return res.status(404).json({ 
        success: false, 
        message: 'Auction Manager not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Auction Manager disapproved successfully', 
      data: updatedManager 
    });
  } catch (error) {
    console.error('Error disapproving auction manager:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error disapproving auction manager: ' + error.message 
    });
  }
};

export default { 
  getAuctionManagers,
  approveAuctionManager,
  deleteAuctionManager,
  disapproveAuctionManager
};
