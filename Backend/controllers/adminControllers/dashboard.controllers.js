import User from '../../models/User.js';
import RentalCost from '../../models/RentalCost.js';
import Purchase from '../../models/Purchase.js';
import AuctionBid from '../../models/AuctionBid.js';
import AuctionRequest from '../../models/AuctionRequest.js';

const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBuyers = await User.countDocuments({ userType: "buyer" });
    const totalSellers = await User.countDocuments({ userType: "seller" });
    const totalMechanics = await User.countDocuments({ userType: "mechanic" });

    const rentalCosts = await RentalCost.find()
      .populate("sellerId", "firstName lastName")
      .populate("rentalCarId", "vehicleName")
      .lean();

    const totalRentalEarnings = rentalCosts.reduce((sum, cost) => sum + (cost.totalCost || 0), 0);

    const purchases = await Purchase.find()
      .populate("sellerId", "firstName lastName")
      .populate("auctionId", "vehicleName")
      .lean();

    // Platform earns 1% convenience fee from auctions
    const totalAuctionEarnings = purchases.reduce((sum, purchase) => sum + (purchase.purchasePrice * 0.01 || 0), 0);
    const totalEarnings = totalRentalEarnings + totalAuctionEarnings;

    const rentalActivities = rentalCosts.map((cost) => ({
      description: `Rental earning: ₹${cost.totalCost.toLocaleString("en-IN", { minimumFractionDigits: 2 })} from ${cost.sellerId?.firstName || ""} ${cost.sellerId?.lastName || ""} (${cost.rentalCarId?.vehicleName || "Unknown"})`,
      timestamp: cost.createdAt,
    }));

    const auctionActivities = purchases.map((purchase) => {
      const convenienceFee = purchase.purchasePrice * 0.01;
      return {
        description: `Auction fee: ₹${convenienceFee.toLocaleString("en-IN", { minimumFractionDigits: 2 })} from ${purchase.sellerId?.firstName || ""} ${purchase.sellerId?.lastName || ""} (₹${purchase.purchasePrice.toLocaleString("en-IN")} sale)`,
        timestamp: purchase.purchaseDate,
      };
    });

    const recentBids = await AuctionBid.find()
      .populate("buyerId", "firstName lastName")
      .populate("auctionId", "vehicleName")
      .sort({ bidTime: -1 })
      .limit(5)
      .lean();

    const bidActivities = recentBids.map((bid) => ({
      description: `New bid: ₹${bid.bidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} by ${bid.buyerId?.firstName || ""} ${bid.buyerId?.lastName || ""} on ${bid.auctionId?.vehicleName || "Unknown"}`,
      timestamp: bid.bidTime,
    }));

    const recentAuctions = await AuctionRequest.find({ status: "approved" })
      .populate("sellerId", "firstName lastName")
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    const auctionApprovalActivities = recentAuctions.map((auction) => ({
      description: `Auction approved for ${auction.vehicleName} by ${auction.sellerId?.firstName || ""} ${auction.sellerId?.lastName || ""}`,
      timestamp: auction.updatedAt,
    }));

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("firstName lastName createdAt")
      .lean();

    const userActivities = recentUsers.map((user) => ({
      description: `New user registered: ${user.firstName} ${user.lastName}`,
      timestamp: user.createdAt,
    }));

    const recentActivity = [
      ...userActivities,
      ...rentalActivities,
      ...auctionActivities,
      ...bidActivities,
      ...auctionApprovalActivities,
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    res.json({
      success: true,
      message: "Admin dashboard data fetched successfully",
      data: {
        totalUsers,
        totalBuyers,
        totalSellers,
        totalMechanics,
        totalEarnings,
        recentActivity,
      },
    });
  } catch (err) {
    console.error("Error fetching admin dashboard:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard",
      data: null,
    });
  }
};

export default { getAdminDashboard };