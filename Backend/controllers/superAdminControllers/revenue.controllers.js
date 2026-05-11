// controllers/superAdminControllers/revenue.controllers.js
import Purchase from '../../models/Purchase.js';
import RentalCost from '../../models/RentalCost.js';
import AuctionCost from '../../models/AuctionCost.js';
import User from '../../models/User.js';

const getRevenueDetails = async (req, res) => {
  try {
    const { period = '12months' } = req.query;

    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '12months':
        startDate.setMonth(startDate.getMonth() - 12);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 12);
    }

    // Total revenue from completed purchases
    const auctionRevenue = await Purchase.aggregate([
      { 
        $match: { 
          paymentStatus: "completed",
          purchaseDate: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$purchasePrice" },
          count: { $sum: 1 },
          avgTransaction: { $avg: "$purchasePrice" }
        }
      }
    ]);

    // Revenue from rentals
    const rentalRevenue = await RentalCost.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalCost" },
          count: { $sum: 1 },
          avgTransaction: { $avg: "$totalCost" }
        }
      }
    ]);

    // Daily revenue breakdown - combine auction and rental revenue
    const dailyAuctionRevenue = await Purchase.aggregate([
      { 
        $match: { 
          paymentStatus: "completed",
          purchaseDate: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: "$purchaseDate" },
            month: { $month: "$purchaseDate" },
            day: { $dayOfMonth: "$purchaseDate" }
          },
          auctionRevenue: { $sum: "$purchasePrice" },
          auctionTransactions: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    const dailyRentalRevenue = await RentalCost.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          rentalRevenue: { $sum: "$totalCost" },
          rentalTransactions: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    // Merge daily revenue data
    const dailyRevenueMap = new Map();
    dailyAuctionRevenue.forEach(item => {
      const key = `${item._id.year}-${item._id.month}-${item._id.day}`;
      dailyRevenueMap.set(key, {
        _id: item._id,
        auctionRevenue: item.auctionRevenue,
        auctionTransactions: item.auctionTransactions,
        rentalRevenue: 0,
        rentalTransactions: 0
      });
    });
    dailyRentalRevenue.forEach(item => {
      const key = `${item._id.year}-${item._id.month}-${item._id.day}`;
      if (dailyRevenueMap.has(key)) {
        const existing = dailyRevenueMap.get(key);
        existing.rentalRevenue = item.rentalRevenue;
        existing.rentalTransactions = item.rentalTransactions;
      } else {
        dailyRevenueMap.set(key, {
          _id: item._id,
          auctionRevenue: 0,
          auctionTransactions: 0,
          rentalRevenue: item.rentalRevenue,
          rentalTransactions: item.rentalTransactions
        });
      }
    });
    const dailyRevenue = Array.from(dailyRevenueMap.values()).map(item => ({
      ...item,
      revenue: item.auctionRevenue + item.rentalRevenue,
      transactions: item.auctionTransactions + item.rentalTransactions
    })).sort((a, b) => {
      if (a._id.year !== b._id.year) return a._id.year - b._id.year;
      if (a._id.month !== b._id.month) return a._id.month - b._id.month;
      return a._id.day - b._id.day;
    });

    // Top revenue generating sellers - include both auction and rental income
    const topAuctionSellers = await Purchase.aggregate([
      { 
        $match: { 
          paymentStatus: "completed",
          purchaseDate: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: "$sellerId",
          auctionRevenue: { $sum: "$purchasePrice" },
          auctionSales: { $sum: 1 }
        }
      }
    ]);

    const topRentalSellers = await RentalCost.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: "$sellerId",
          rentalRevenue: { $sum: "$totalCost" },
          rentalSales: { $sum: 1 }
        }
      }
    ]);

    // Merge seller data
    const sellerRevenueMap = new Map();
    topAuctionSellers.forEach(item => {
      sellerRevenueMap.set(item._id.toString(), {
        _id: item._id,
        auctionRevenue: item.auctionRevenue,
        auctionSales: item.auctionSales,
        rentalRevenue: 0,
        rentalSales: 0
      });
    });
    topRentalSellers.forEach(item => {
      const key = item._id.toString();
      if (sellerRevenueMap.has(key)) {
        const existing = sellerRevenueMap.get(key);
        existing.rentalRevenue = item.rentalRevenue;
        existing.rentalSales = item.rentalSales;
      } else {
        sellerRevenueMap.set(key, {
          _id: item._id,
          auctionRevenue: 0,
          auctionSales: 0,
          rentalRevenue: item.rentalRevenue,
          rentalSales: item.rentalSales
        });
      }
    });

    // Get top 10 sellers by total revenue
    const topSellersData = Array.from(sellerRevenueMap.values())
      .map(item => ({
        ...item,
        totalRevenue: item.auctionRevenue + item.rentalRevenue,
        salesCount: item.auctionSales + item.rentalSales
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // Populate seller details
    const topSellers = await Promise.all(topSellersData.map(async (seller) => {
      const user = await User.findById(seller._id).select('firstName lastName email');
      return {
        _id: seller._id,
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        email: user?.email || 'N/A',
        totalRevenue: seller.totalRevenue,
        auctionRevenue: seller.auctionRevenue,
        rentalRevenue: seller.rentalRevenue,
        salesCount: seller.salesCount,
        auctionSales: seller.auctionSales,
        rentalSales: seller.rentalSales
      };
    }));

    // Revenue by vehicle type - Using aggregation for better reliability
    console.log('🔍 [Revenue] Fetching revenue by vehicle type...');
    const revenueByVehicleType = await Purchase.aggregate([
      {
        $match: {
          paymentStatus: "completed",
          purchaseDate: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'auctionrequests',
          localField: 'auctionId',
          foreignField: '_id',
          as: 'auction'
        }
      },
      {
        $unwind: {
          path: '$auction',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          vehicleType: { $ifNull: ['$carType', { $ifNull: ['$auction.carType', 'Unknown'] }] }
        }
      },
      {
        $group: {
          _id: '$vehicleType',
          revenue: { $sum: '$purchasePrice' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { revenue: -1 }
      },
      {
        $project: {
          _id: 1,
          revenue: 1,
          count: 1
        }
      }
    ]);

    console.log('📊 [Revenue] Vehicle Type Revenue:', JSON.stringify(revenueByVehicleType, null, 2));

    // Platform fees collected (assuming 5% platform fee on total revenue)
    const platformFeePercentage = 0.05;
    const totalRevenue = (auctionRevenue[0]?.total || 0) + (rentalRevenue[0]?.total || 0);
    const totalPlatformFees = totalRevenue * platformFeePercentage;

    res.json({
      success: true,
      data: {
        auctionRevenue: auctionRevenue[0] || { total: 0, count: 0, avgTransaction: 0 },
        rentalRevenue: rentalRevenue[0] || { total: 0, count: 0, avgTransaction: 0 },
        totalRevenue: (auctionRevenue[0]?.total || 0) + (rentalRevenue[0]?.total || 0),
        platformFees: totalPlatformFees,
        dailyRevenue,
        topSellers,
        revenueByVehicleType,
        period
      }
    });
  } catch (error) {
    console.error('Revenue Details Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch revenue details' });
  }
};

export default { getRevenueDetails };
