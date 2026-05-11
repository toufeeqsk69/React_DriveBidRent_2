import User from '../../models/User.js';
import RentalRequest from '../../models/RentalRequest.js';
import AuctionRequest from '../../models/AuctionRequest.js';
import RentalCost from '../../models/RentalCost.js';
import AuctionCost from '../../models/AuctionCost.js';
import Purchase from '../../models/Purchase.js';

const getAnalytics = async (req, res) => {
  try {
    // ===== USER STATISTICS =====
    const totalUsers = await User.countDocuments();
    const buyersCount = await User.countDocuments({ userType: 'buyer' });
    const sellersCount = await User.countDocuments({ userType: 'seller' });
    const mechanicsCount = await User.countDocuments({ userType: 'mechanic' });
    const auctionManagersCount = await User.countDocuments({ userType: 'auction_manager' });
    const driversCount = await User.countDocuments({ userType: 'driver' });
    
    const userTypeDistribution = [
      { name: 'Buyers', value: buyersCount },
      { name: 'Sellers', value: sellersCount },
      { name: 'Mechanics', value: mechanicsCount },
      { name: 'Auction Managers', value: auctionManagersCount },
      { name: 'Drivers', value: driversCount },
    ].filter(item => item.value > 0); // Only include types with users

    // ===== CAR TYPE DISTRIBUTION =====
    // Count ALL cars requested by sellers, regardless of status
    const carTypeDistribution = await AuctionRequest.aggregate([
      { $group: { _id: '$carType', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
      { $sort: { value: -1 } },
    ]);

    // ===== CAR MODEL DISTRIBUTION =====
    // Count ALL car models requested, regardless of approval status
    const carModelDistribution = await AuctionRequest.aggregate([
      { $match: { vehicleName: { $exists: true, $ne: null } } },
      { 
        $project: {
          vehicleName: 1,
          carType: 1,
          // Normalize vehicle name by trimming and converting to lowercase
          normalizedName: { 
            $toLower: { 
              $trim: { input: '$vehicleName' } 
            } 
          }
        }
      },
      { 
        $group: { 
          _id: { 
            carType: '$carType', 
            normalizedName: '$normalizedName' 
          }, 
          count: { $sum: 1 },
          // Keep original name for display (first occurrence)
          displayName: { $first: '$vehicleName' }
        } 
      },
      { 
        $project: { 
          // Combine car type and name for display
          name: { 
            $concat: [
              { $toUpper: { $substrCP: ['$displayName', 0, 1] } },
              { $substrCP: ['$displayName', 1, { $strLenCP: '$displayName' }] },
              ' (', 
              '$_id.carType', 
              ')'
            ]
          },
          value: '$count', 
          _id: 0 
        } 
      },
      { $sort: { value: -1 } },
      { $limit: 10 }, // Top 10 models
    ]);

    // ===== TOP SELLERS =====
    // Count ALL cars listed by sellers, regardless of approval status
    const topSellers = await AuctionRequest.aggregate([
      { 
        $match: { 
          sellerId: { $exists: true, $ne: null } 
        } 
      },
      { 
        $group: { 
          _id: '$sellerId', 
          totalCarsListed: { $sum: 1 },
          carsSold: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$started_auction', 'ended'] },
                  { $ne: ['$winnerId', null] }
                ]},
                1,
                0
              ]
            }
          }
        } 
      },
      { $sort: { totalCarsListed: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'sellerInfo'
        }
      },
      { $unwind: '$sellerInfo' },
      {
        $project: {
          name: { $concat: ['$sellerInfo.firstName', ' ', '$sellerInfo.lastName'] },
          email: '$sellerInfo.email',
          totalCarsListed: 1,
          carsSold: 1,
          _id: 0
        }
      }
    ]);

    // Also include rental listings for sellers
    const topRentalProviders = await RentalRequest.aggregate([
      { 
        $match: { 
          sellerId: { $exists: true, $ne: null } 
        } 
      },
      { 
        $group: { 
          _id: '$sellerId', 
          totalRentalsListed: { $sum: 1 }
        } 
      },
      { $sort: { totalRentalsListed: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'sellerInfo'
        }
      },
      { $unwind: '$sellerInfo' },
      {
        $project: {
          name: { $concat: ['$sellerInfo.firstName', ' ', '$sellerInfo.lastName'] },
          email: '$sellerInfo.email',
          totalRentalsListed: 1,
          _id: 0
        }
      }
    ]);

    // ===== TOP BUYERS =====
    const topBuyers = await Purchase.aggregate([
      { 
        $match: { 
          winnerId: { $exists: true, $ne: null } 
        } 
      },
      { 
        $group: { 
          _id: '$winnerId', 
          totalPurchases: { $sum: 1 },
          totalSpent: { $sum: '$finalPurchasePrice' }
        } 
      },
      { $sort: { totalPurchases: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'buyerInfo'
        }
      },
      { $unwind: '$buyerInfo' },
      {
        $project: {
          name: { $concat: ['$buyerInfo.firstName', ' ', '$buyerInfo.lastName'] },
          email: '$buyerInfo.email',
          totalPurchases: 1,
          totalSpent: 1,
          _id: 0
        }
      }
    ]);

    // Also include rental users
    const topRenters = await RentalCost.aggregate([
      { 
        $match: { 
          buyerId: { $exists: true, $ne: null } 
        } 
      },
      { 
        $group: { 
          _id: '$buyerId', 
          totalRentals: { $sum: 1 }
        } 
      },
      { $sort: { totalRentals: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'buyerInfo'
        }
      },
      { $unwind: '$buyerInfo' },
      {
        $project: {
          name: { $concat: ['$buyerInfo.firstName', ' ', '$buyerInfo.lastName'] },
          email: '$buyerInfo.email',
          totalRentals: 1,
          _id: 0
        }
      }
    ]);

    // ===== REVENUE STATISTICS =====
    // Calculate auction revenue from Purchase documents (1% convenience fee)
    const totalAuctionRevenue = await Purchase.aggregate([
      { 
        $group: { 
          _id: null, 
          total: { 
            $sum: { 
              $multiply: ['$purchasePrice', 0.01] // 1% convenience fee
            } 
          } 
        } 
      }
    ]);
    
    const totalRentalRevenue = await RentalCost.aggregate([
      { $group: { _id: null, total: { $sum: '$totalCost' } } }
    ]);

    const auctionRevenue = totalAuctionRevenue[0]?.total || 0;
    const rentalRevenue = totalRentalRevenue[0]?.total || 0;

    const revenueDistribution = [
      { name: 'Auction Revenue', value: auctionRevenue },
      { name: 'Rental Revenue', value: rentalRevenue },
    ];

    // ===== AUCTION STATUS DISTRIBUTION =====
    // Show detailed status of all auction requests
    const pendingApproval = await AuctionRequest.countDocuments({ status: 'pending' });
    const assignedToMechanic = await AuctionRequest.countDocuments({ status: 'assignedMechanic' });
    const approvedNotStarted = await AuctionRequest.countDocuments({ 
      status: 'approved', 
      $or: [
        { started_auction: 'no' },
        { started_auction: { $exists: false } },
        { started_auction: null }
      ]
    });
    const liveAuctions = await AuctionRequest.countDocuments({ started_auction: 'yes' });
    const endedAuctions = await AuctionRequest.countDocuments({ started_auction: 'ended' });
    const rejectedAuctions = await AuctionRequest.countDocuments({ status: 'rejected' });

    const auctionStatusDistribution = [
      { name: 'Pending Approval', value: pendingApproval },
      { name: 'Assigned to Mechanic', value: assignedToMechanic },
      { name: 'Approved (Not Started)', value: approvedNotStarted },
      { name: 'Live Auctions', value: liveAuctions },
      { name: 'Ended Auctions', value: endedAuctions },
      { name: 'Rejected', value: rejectedAuctions },
    ].filter(item => item.value > 0);

    // ===== GENERAL STATISTICS =====
    const totalCarsRented = await RentalCost.countDocuments();
    const totalAuctionListings = await AuctionRequest.countDocuments();
    const totalCarsSold = await Purchase.countDocuments();
    const activeRentals = await RentalRequest.countDocuments({ status: 'unavailable' });

    const vehiclePerformance = await AuctionRequest.aggregate([
      {
        $match: {
          status: "approved",
          started_auction: "ended",
          winnerId: { $exists: true, $ne: null },
          vehicleName: { $exists: true, $ne: null },
          startingBid: { $exists: true },
          finalPurchasePrice: { $exists: true },
        },
      },
      {
        $project: {
          vehicleName: 1,
          startingPrice: "$startingBid",
          finalSalePrice: "$finalPurchasePrice",
        },
      },
      { $sort: { finalSalePrice: -1 } },
      { $limit: 10 }, // Top 10 performing vehicles
    ]);

    res.json({
      success: true,
      message: "Analytics data fetched successfully",
      data: {
        // Overview
        totalUsers,
        totalCarsRented,
        totalAuctionListings,
        totalCarsSold,
        activeRentals,
        totalRevenue: auctionRevenue + rentalRevenue,
        
        // Distributions
        userTypeDistribution,
        carTypeDistribution,
        carModelDistribution,
        revenueDistribution,
        auctionStatusDistribution,
        
        // Top performers
        topSellers,
        topRentalProviders,
        topBuyers,
        topRenters,
        
        // Performance
        vehiclePerformance,
      },
    });
  } catch (err) {
    console.error("Error fetching analytics data:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load analytics data: " + err.message,
      data: null,
    });
  }
};

export default { getAnalytics };