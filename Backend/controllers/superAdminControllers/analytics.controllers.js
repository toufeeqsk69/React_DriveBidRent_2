// controllers/superAdminControllers/analytics.controllers.js
import User from '../../models/User.js';
import AuctionRequest from '../../models/AuctionRequest.js';
import RentalRequest from '../../models/RentalRequest.js';
import AuctionBid from '../../models/AuctionBid.js';
import Purchase from '../../models/Purchase.js';
import AuctionCost from '../../models/AuctionCost.js';
import RentalCost from '../../models/RentalCost.js';
import mongoose from 'mongoose';

const getAnalytics = async (req, res) => {
  try {
    // User growth analytics (last 12 months)
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            userType: "$userType"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);

    // Revenue trends (last 12 months) - combine auction and rental revenue
    const auctionRevenueTrends = await Purchase.aggregate([
      { $match: { paymentStatus: "completed" } },
      {
        $group: {
          _id: {
            year: { $year: "$purchaseDate" },
            month: { $month: "$purchaseDate" }
          },
          auctionRevenue: { $sum: "$purchasePrice" },
          auctionCount: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);

    const rentalRevenueTrends = await RentalCost.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          rentalRevenue: { $sum: "$totalCost" },
          rentalCount: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);

    // Merge auction and rental trends
    const revenueMap = new Map();
    auctionRevenueTrends.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      revenueMap.set(key, { 
        _id: item._id, 
        auctionRevenue: item.auctionRevenue, 
        auctionCount: item.auctionCount,
        rentalRevenue: 0,
        rentalCount: 0
      });
    });
    rentalRevenueTrends.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      if (revenueMap.has(key)) {
        const existing = revenueMap.get(key);
        existing.rentalRevenue = item.rentalRevenue;
        existing.rentalCount = item.rentalCount;
      } else {
        revenueMap.set(key, {
          _id: item._id,
          auctionRevenue: 0,
          auctionCount: 0,
          rentalRevenue: item.rentalRevenue,
          rentalCount: item.rentalCount
        });
      }
    });
    const revenueTrends = Array.from(revenueMap.values()).map(item => ({
      ...item,
      revenue: item.auctionRevenue + item.rentalRevenue,
      count: item.auctionCount + item.rentalCount
    })).sort((a, b) => {
      if (a._id.year !== b._id.year) return a._id.year - b._id.year;
      return a._id.month - b._id.month;
    });

    // Auction success rate
    const completedAuctions = await AuctionRequest.countDocuments({
      status: "approved",
      auctionEndTime: { $lt: new Date() }
    });

    const successfulAuctions = await Purchase.countDocuments();
    const auctionSuccessRate = completedAuctions > 0 
      ? ((successfulAuctions / completedAuctions) * 100).toFixed(2)
      : 0;

    // Average bid per auction
    const avgBidsPerAuction = await AuctionBid.aggregate([
      { $group: { _id: "$auctionId", bidCount: { $sum: 1 } } },
      { $group: { _id: null, avgBids: { $avg: "$bidCount" } } }
    ]);

    // Popular vehicle types in auctions
    const popularVehicleTypes = await AuctionRequest.aggregate([
      { 
        $group: { 
          _id: { $toLower: "$carType" }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Rental booking trends
    const rentalTrends = await RentalRequest.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);

    // Average auction price by vehicle type
    const avgPriceByType = await AuctionRequest.aggregate([
      { $match: { currentPrice: { $exists: true } } },
      {
        $group: {
          _id: { $toLower: "$carType" },
          avgPrice: { $avg: "$currentPrice" },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgPrice: -1 } }
    ]);

    // User activity distribution
    const userActivity = await AuctionBid.aggregate([
      {
        $group: {
          _id: "$buyerId",
          activityCount: { $sum: 1 }
        }
      },
      {
        $bucket: {
          groupBy: "$activityCount",
          boundaries: [0, 1, 5, 10, 20, 50, 100],
          default: "100+",
          output: {
            count: { $sum: 1 },
            users: { $push: "$_id" }
          }
        }
      }
    ]);

    // Geographic distribution (by state) - with proper formatting
    const geographicDistribution = await User.aggregate([
      { $match: { state: { $exists: true, $ne: "" } } },
      {
        $group: {
          _id: { $toLower: "$state" },  // Convert to lowercase for grouping
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Peak activity hours (based on bid times)
    const peakHours = await AuctionBid.aggregate([
      {
        $project: {
          hour: { $hour: { $ifNull: ["$bidTime", "$createdAt"] } }
        }
      },
      { $match: { hour: { $ne: null } } },
      {
        $group: {
          _id: "$hour",
          bidCount: { $sum: 1 }
        }
      },
      { $sort: { bidCount: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        userGrowth,
        revenueTrends,
        auctionSuccessRate,
        avgBidsPerAuction: avgBidsPerAuction[0]?.avgBids?.toFixed(2) || 0,
        popularVehicleTypes,
        rentalTrends,
        avgPriceByType,
        userActivity,
        geographicDistribution,
        peakHours
      }
    });
  } catch (error) {
    console.error('Super Admin Analytics Error:', error);
    res.status(500).json({ success: false, message: 'Failed to load analytics' });
  }
};

export default { getAnalytics };
