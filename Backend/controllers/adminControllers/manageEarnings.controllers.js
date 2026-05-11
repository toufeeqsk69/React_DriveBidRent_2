import User from '../../models/User.js';
import RentalCost from '../../models/RentalCost.js';
import RentalRequest from '../../models/RentalRequest.js';
import Purchase from '../../models/Purchase.js';
import AuctionRequest from '../../models/AuctionRequest.js';

const getManageEarnings = async (req, res) => {
  try {
    // Get all rental transactions
    const rentalCosts = await RentalCost.find()
      .populate('sellerId', 'firstName lastName email')
      .populate('buyerId', 'firstName lastName email')
      .populate('rentalCarId', 'vehicleName carType')
      .sort({ createdAt: -1 })
      .lean();

    // Platform revenue from rentals is the full totalCost
    const totalRentalRevenue = rentalCosts.reduce((sum, cost) => sum + (cost.totalCost || 0), 0);

    // Get all auction transactions (purchases)
    const purchases = await Purchase.find()
      .populate('sellerId', 'firstName lastName email')
      .populate('buyerId', 'firstName lastName email')
      .populate('auctionId', 'vehicleName carType')
      .sort({ purchaseDate: -1 })
      .lean();

    // Platform revenue from auctions is 1% of purchase price
    const totalAuctionRevenue = purchases.reduce((sum, purchase) => sum + (purchase.purchasePrice * 0.01 || 0), 0);

    const totalRevenue = totalRentalRevenue + totalAuctionRevenue;

    // Calculate monthly earnings for the last 12 months
    const now = new Date();
    const monthlyEarnings = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthRentalEarnings = rentalCosts
        .filter(cost => new Date(cost.createdAt) >= monthDate && new Date(cost.createdAt) < nextMonth)
        .reduce((sum, cost) => sum + (cost.totalCost || 0), 0);
      
      const monthAuctionEarnings = purchases
        .filter(purchase => new Date(purchase.purchaseDate) >= monthDate && new Date(purchase.purchaseDate) < nextMonth)
        .reduce((sum, purchase) => sum + (purchase.purchasePrice * 0.01 || 0), 0);
      
      monthlyEarnings.push({
        month: monthDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        rentalRevenue: monthRentalEarnings,
        auctionRevenue: monthAuctionEarnings,
        totalRevenue: monthRentalEarnings + monthAuctionEarnings
      });
    }

    // Calculate daily earnings for the last 30 days
    const dailyEarnings = [];
    for (let i = 29; i >= 0; i--) {
      const dayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
      
      const dayRentalEarnings = rentalCosts
        .filter(cost => new Date(cost.createdAt) >= dayDate && new Date(cost.createdAt) < nextDay)
        .reduce((sum, cost) => sum + (cost.totalCost || 0), 0);
      
      const dayAuctionEarnings = purchases
        .filter(purchase => new Date(purchase.purchaseDate) >= dayDate && new Date(purchase.purchaseDate) < nextDay)
        .reduce((sum, purchase) => sum + (purchase.purchasePrice * 0.01 || 0), 0);
      
      dailyEarnings.push({
        date: dayDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        rentalRevenue: dayRentalEarnings,
        auctionRevenue: dayAuctionEarnings,
        totalRevenue: dayRentalEarnings + dayAuctionEarnings
      });
    }

    // Prepare rental transactions with detailed info
    const rentalTransactions = rentalCosts.map(cost => ({
      id: cost._id,
      type: 'Rental',
      vehicleName: cost.rentalCarId?.vehicleName || 'Unknown',
      carType: cost.rentalCarId?.carType || 'N/A',
      sellerName: cost.sellerId ? `${cost.sellerId.firstName} ${cost.sellerId.lastName}` : 'Unknown',
      sellerEmail: cost.sellerId?.email || 'N/A',
      buyerName: cost.buyerId ? `${cost.buyerId.firstName} ${cost.buyerId.lastName}` : 'Unknown',
      buyerEmail: cost.buyerId?.email || 'N/A',
      amount: cost.totalCost,
      platformRevenue: cost.totalCost,
      date: cost.createdAt
    }));

    // Prepare auction transactions with detailed info
    const auctionTransactions = purchases.map(purchase => {
      const convenienceFee = purchase.purchasePrice * 0.01;
      return {
        id: purchase._id,
        type: 'Auction',
        vehicleName: purchase.vehicleName || 'Unknown',
        carType: purchase.auctionId?.carType || 'N/A',
        sellerName: purchase.sellerId ? `${purchase.sellerId.firstName} ${purchase.sellerId.lastName}` : purchase.sellerName || 'Unknown',
        sellerEmail: purchase.sellerId?.email || 'N/A',
        buyerName: purchase.buyerId ? `${purchase.buyerId.firstName} ${purchase.buyerId.lastName}` : 'Unknown',
        buyerEmail: purchase.buyerId?.email || 'N/A',
        salePrice: purchase.purchasePrice,
        amount: convenienceFee,
        platformRevenue: convenienceFee,
        date: purchase.purchaseDate
      };
    });

    // Combine and sort all transactions
    const allTransactions = [...rentalTransactions, ...auctionTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Statistics
    const stats = {
      totalTransactions: allTransactions.length,
      totalRentalTransactions: rentalTransactions.length,
      totalAuctionTransactions: auctionTransactions.length,
      averageRentalRevenue: rentalTransactions.length > 0 ? totalRentalRevenue / rentalTransactions.length : 0,
      averageAuctionRevenue: auctionTransactions.length > 0 ? totalAuctionRevenue / auctionTransactions.length : 0,
      averageTransactionValue: allTransactions.length > 0 ? totalRevenue / allTransactions.length : 0
    };

    res.json({
      success: true,
      message: "Earnings data fetched successfully",
      data: {
        totalRevenue,
        totalAuctionRevenue,
        totalRentalRevenue,
        transactions: allTransactions,
        recentTransactions: allTransactions.slice(0, 10),
        monthlyEarnings,
        dailyEarnings,
        stats
      },
    });
  } catch (err) {
    console.error('Error fetching earnings data:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load earnings data',
      data: null,
    });
  }
};

export default { getManageEarnings };