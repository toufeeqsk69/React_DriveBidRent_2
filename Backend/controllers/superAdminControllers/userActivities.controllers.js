// controllers/superAdminControllers/userActivities.controllers.js
import User from '../../models/User.js';
import AuctionBid from '../../models/AuctionBid.js';
import AuctionRequest from '../../models/AuctionRequest.js';
import RentalRequest from '../../models/RentalRequest.js';
import Purchase from '../../models/Purchase.js';
import RentalCost from '../../models/RentalCost.js';

const getUserActivities = async (req, res) => {
  try {
    const { userType, limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    if (userType && userType !== 'all') {
      query.userType = userType;
    }

    // Get users with their activity summary
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Enrich with activity data
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      let activityData = {};

      if (user.userType === 'buyer') {
        const bidsCount = await AuctionBid.countDocuments({ buyerId: user._id });
        const purchasesCount = await Purchase.countDocuments({ buyerId: user._id });
        const rentalsCount = await RentalRequest.countDocuments({ buyerId: user._id });
        
        activityData = { bidsCount, purchasesCount, rentalsCount };
      } else if (user.userType === 'seller') {
        const auctionsCount = await AuctionRequest.countDocuments({ sellerId: user._id });
        const rentalsCount = await RentalRequest.countDocuments({ sellerId: user._id });
        
        // Get revenue from both auctions and rentals
        const auctionRevenue = await Purchase.aggregate([
          { $match: { sellerId: user._id, paymentStatus: "completed" } },
          { $group: { _id: null, total: { $sum: "$purchasePrice" } } }
        ]);
        
        const rentalRevenue = await RentalCost.aggregate([
          { $match: { sellerId: user._id } },
          { $group: { _id: null, total: { $sum: "$totalCost" } } }
        ]);
        
        activityData = { 
          auctionsCount, 
          rentalsCount, 
          totalRevenue: (auctionRevenue[0]?.total || 0) + (rentalRevenue[0]?.total || 0)
        };
      } else if (user.userType === 'mechanic') {
        activityData = {
          assignedTasks: user.assignedRequests?.length || 0,
          approved: user.approved_status === 'Yes'
        };
      }

      return {
        ...user,
        activityData
      };
    }));

    const totalUsers = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users: enrichedUsers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('User Activities Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user activities' });
  }
};

const getUserDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get detailed activity
    let detailedActivity = {};

    if (user.userType === 'buyer') {
      const bids = await AuctionBid.find({ buyerId: user._id })
        .populate('auctionId')
        .sort({ createdAt: -1 })
        .limit(10);
      
      const purchases = await Purchase.find({ buyerId: user._id })
        .populate('auctionId')
        .sort({ createdAt: -1 })
        .limit(10);
      
      const rentals = await RentalRequest.find({ buyerId: user._id })
        .sort({ createdAt: -1 })
        .limit(10);

      detailedActivity = { bids, purchases, rentals };
    } else if (user.userType === 'seller') {
      const auctions = await AuctionRequest.find({ sellerId: user._id })
        .sort({ createdAt: -1 })
        .limit(10);
      
      const rentals = await RentalRequest.find({ sellerId: user._id })
        .sort({ createdAt: -1 })
        .limit(10);

      detailedActivity = { auctions, rentals };
    }

    res.json({
      success: true,
      data: {
        user,
        detailedActivity
      }
    });
  } catch (error) {
    console.error('User Details Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user details' });
  }
};

export default { getUserActivities, getUserDetailsById };
