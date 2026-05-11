// controllers/superAdminControllers/trends.controllers.js
import User from '../../models/User.js';
import AuctionRequest from '../../models/AuctionRequest.js';
import AuctionBid from '../../models/AuctionBid.js';
import RentalRequest from '../../models/RentalRequest.js';
import Purchase from '../../models/Purchase.js';
import RentalCost from '../../models/RentalCost.js';

const getTrends = async (req, res) => {
  try {
    // Current trends analysis
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // User signup trends (comparing last 30 days with previous 30 days)
    const recentSignups = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const previousSignups = await User.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });

    const signupGrowth = previousSignups > 0
      ? (((recentSignups - previousSignups) / previousSignups) * 100).toFixed(2)
      : 100;

    // Auction activity trends
    const recentAuctions = await AuctionRequest.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const previousAuctions = await AuctionRequest.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });

    const auctionGrowth = previousAuctions > 0
      ? (((recentAuctions - previousAuctions) / previousAuctions) * 100).toFixed(2)
      : 100;

    // Bidding activity trends
    const recentBids = await AuctionBid.countDocuments({
      bidTime: { $gte: thirtyDaysAgo }
    });

    const previousBids = await AuctionBid.countDocuments({
      bidTime: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });

    const biddingGrowth = previousBids > 0
      ? (((recentBids - previousBids) / previousBids) * 100).toFixed(2)
      : 100;

    // Rental activity trends
    const recentRentals = await RentalRequest.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const previousRentals = await RentalRequest.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });

    const rentalGrowth = previousRentals > 0
      ? (((recentRentals - previousRentals) / previousRentals) * 100).toFixed(2)
      : 100;

    // Revenue trends (combine Purchase and RentalCost)
    const recentAuctionRevenue = await Purchase.aggregate([
      { $match: { paymentStatus: "completed", purchaseDate: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: "$purchasePrice" } } }
    ]);

    const recentRentalRevenue = await RentalCost.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: "$totalCost" } } }
    ]);

    const previousAuctionRevenue = await Purchase.aggregate([
      { $match: { paymentStatus: "completed", purchaseDate: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: "$purchasePrice" } } }
    ]);

    const previousRentalRevenue = await RentalCost.aggregate([
      { $match: { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: "$totalCost" } } }
    ]);

    const recentRevenueTotal = (recentAuctionRevenue[0]?.total || 0) + (recentRentalRevenue[0]?.total || 0);
    const previousRevenueTotal = (previousAuctionRevenue[0]?.total || 0) + (previousRentalRevenue[0]?.total || 0);

    console.log('💰 [Trends Revenue Debug]');
    console.log('Recent (last 30 days):');
    console.log('  - Auction Revenue:', recentAuctionRevenue[0]?.total || 0);
    console.log('  - Rental Revenue:', recentRentalRevenue[0]?.total || 0);
    console.log('  - Total:', recentRevenueTotal);
    console.log('Previous (30-60 days ago):');
    console.log('  - Auction Revenue:', previousAuctionRevenue[0]?.total || 0);
    console.log('  - Rental Revenue:', previousRentalRevenue[0]?.total || 0);
    console.log('  - Total:', previousRevenueTotal);

    const revenueGrowth = previousRevenueTotal > 0
      ? (((recentRevenueTotal - previousRevenueTotal) / previousRevenueTotal) * 100).toFixed(2)
      : 100;

    // Most popular vehicle types (trending) - from auctions only (rentals don't have vehicle type)
    const trendingAuctionVehicleTypes = await AuctionRequest.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $toLower: "$carType" },
          auctionCount: { $sum: 1 }
        }
      },
      { $sort: { auctionCount: -1 } },
      { $limit: 10 }
    ]);

    // Note: RentalRequest doesn't have a vehicle type field, so we count all rentals
    const totalRentals = await RentalRequest.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Vehicle type trends (auction types only, since rentals don't have vehicle type)
    const trendingVehicleTypes = trendingAuctionVehicleTypes
      .map(item => ({
        _id: item._id,
        auctionCount: item.auctionCount,
        count: item.auctionCount
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Most active time of day for bids
    const biddingTimeDistribution = await AuctionBid.aggregate([
      { $match: { bidTime: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $hour: "$bidTime" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // User retention (users who bid in both periods)
    const activeUsersRecent = await AuctionBid.distinct('buyerId', {
      bidTime: { $gte: thirtyDaysAgo }
    });

    const activeUsersPrevious = await AuctionBid.distinct('buyerId', {
      bidTime: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });

    const retainedUsers = activeUsersRecent.filter(id =>
      activeUsersPrevious.some(prevId => prevId.equals(id))
    ).length;

    const retentionRate = activeUsersPrevious.length > 0
      ? ((retainedUsers / activeUsersPrevious.length) * 100).toFixed(2)
      : 0;

    // Average auction duration for completed auctions
    const avgAuctionDuration = await AuctionRequest.aggregate([
      {
        $match: {
          status: "approved",
          auction_stopped: true,
          auctionDate: { $gte: thirtyDaysAgo }
        }
      },
      {
        $project: {
          duration: {
            $divide: [
              { $subtract: ["$updatedAt", "$auctionDate"] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: "$duration" }
        }
      }
    ]);

    // Conversion rate (auctions to purchases)
    const completedAuctionsRecent = await AuctionRequest.countDocuments({
      status: "approved",
      auction_stopped: true,
      auctionDate: { $gte: thirtyDaysAgo }
    });

    const purchasesRecent = await Purchase.countDocuments({
      purchaseDate: { $gte: thirtyDaysAgo }
    });

    const conversionRate = completedAuctionsRecent > 0
      ? ((purchasesRecent / completedAuctionsRecent) * 100).toFixed(2)
      : 0;

    console.log('[Trends Metrics Debug]');
    console.log('Conversion Rate:');
    console.log('  - Completed Auctions (last 30 days):', completedAuctionsRecent);
    console.log('  - Purchases (last 30 days):', purchasesRecent);
    console.log('  - Conversion Rate:', conversionRate + '%');
    console.log('Avg Auction Duration:');
    console.log('  - Number of completed auctions:', avgAuctionDuration.length > 0 ? 'found' : 'none');
    console.log('  - Average Duration:', avgAuctionDuration[0]?.avgDuration?.toFixed(2) || 0, 'days');

    res.json({
      success: true,
      data: {
        growth: {
          signups: { current: recentSignups, previous: previousSignups, growth: signupGrowth },
          auctions: { current: recentAuctions, previous: previousAuctions, growth: auctionGrowth },
          rentals: { current: recentRentals, previous: previousRentals, growth: rentalGrowth },
          bidding: { current: recentBids, previous: previousBids, growth: biddingGrowth },
          revenue: {
            current: recentRevenueTotal,
            previous: previousRevenueTotal,
            growth: revenueGrowth,
            auctionCurrent: (recentAuctionRevenue[0]?.total || 0),
            rentalCurrent: (recentRentalRevenue[0]?.total || 0)
          }
        },
        trendingVehicleTypes,
        biddingTimeDistribution,
        retention: {
          retainedUsers,
          totalPreviousUsers: activeUsersPrevious.length,
          retentionRate
        },
        avgAuctionDuration: avgAuctionDuration[0]?.avgDuration?.toFixed(2) || 0,
        conversionRate
      }
    });
  } catch (error) {
    console.error('Trends Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trends' });
  }
};

export default { getTrends };
