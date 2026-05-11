// controllers/superAdminControllers/dashboard.controllers.js
import User from '../../models/User.js';
import AuctionRequest from '../../models/AuctionRequest.js';
import RentalRequest from '../../models/RentalRequest.js';
import AuctionBid from '../../models/AuctionBid.js';
import Purchase from '../../models/Purchase.js';
import AuctionCost from '../../models/AuctionCost.js';
import RentalCost from '../../models/RentalCost.js';

const getDashboard = async (req, res) => {
  try {
    // Get all users count by type
    const userCounts = await User.aggregate([
      { $group: { _id: "$userType", count: { $sum: 1 } } }
    ]);

    // Total revenue from auctions and rentals
    const totalAuctionRevenue = await Purchase.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$purchasePrice" } } }
    ]);

    const totalRentalRevenue = await RentalCost.aggregate([
      { $group: { _id: null, total: { $sum: "$totalCost" } } }
    ]);

    // Active auctions count (live auctions)
    const activeAuctions = await AuctionRequest.countDocuments({
      status: "approved",
      started_auction: "yes",
      auction_stopped: { $ne: true }
    });

    // Total bids
    const totalBids = await AuctionBid.countDocuments();

    // Active rentals (status can be 'available' or 'unavailable')
    const activeRentals = await RentalRequest.countDocuments({
      status: "available"
    });

    // Recent user signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSignups = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Most active buyers (by bids)
    const topBuyers = await AuctionBid.aggregate([
      { $group: { _id: "$buyerId", bidCount: { $sum: 1 } } },
      { $sort: { bidCount: -1 } },
      { $limit: 5 },
      { 
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      { 
        $project: {
          name: { $concat: ["$user.firstName", " ", "$user.lastName"] },
          email: "$user.email",
          bidCount: 1
        }
      }
    ]);

    // Top sellers by total auctions
    const topSellers = await AuctionRequest.aggregate([
      { $group: { _id: "$sellerId", auctionCount: { $sum: 1 } } },
      { $sort: { auctionCount: -1 } },
      { $limit: 5 },
      { 
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      { 
        $project: {
          name: { $concat: ["$user.firstName", " ", "$user.lastName"] },
          email: "$user.email",
          auctionCount: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        userCounts,
        revenue: {
          auctions: totalAuctionRevenue[0]?.total || 0,
          rentals: totalRentalRevenue[0]?.total || 0,
          total: (totalAuctionRevenue[0]?.total || 0) + (totalRentalRevenue[0]?.total || 0)
        },
        activeAuctions,
        totalBids,
        activeRentals,
        recentSignups,
        topBuyers,
        topSellers
      }
    });
  } catch (error) {
    console.error('Super Admin Dashboard Error:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard data' });
  }
};

export default { getDashboard };
