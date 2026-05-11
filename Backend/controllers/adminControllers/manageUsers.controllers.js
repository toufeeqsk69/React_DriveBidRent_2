import User from '../../models/User.js';
import AuctionRequest from '../../models/AuctionRequest.js';
import AuctionBid from '../../models/AuctionBid.js';
import AuctionCost from '../../models/AuctionCost.js';
import Purchase from '../../models/Purchase.js';
import RentalRequest from '../../models/RentalRequest.js';
import RentalCost from '../../models/RentalCost.js';
import mongoose from 'mongoose';

const getManageUsers = async (req, res) => {
  try {
    const pendingMechanics = await User.find({ 
      userType: 'mechanic',
      approved_status: 'No'
    }).lean();

    const approvedMechanics = await User.find({ 
      userType: 'mechanic',
      approved_status: 'Yes'
    }).lean();

    const buyers = await User.find({ userType: 'buyer' }).lean();
    const sellers = await User.find({ userType: 'seller' }).lean();
    
    // Get reported users (buyers who failed to complete payment) - exclude blocked users
    const reportedUsers = await User.find({ 
      isReported: true,
      isBlocked: { $ne: true }
    }).lean();

    // Get blocked users (all user types)
    const blockedUsers = await User.find({ 
      isBlocked: true 
    }).lean();

    res.json({
      success: true,
      message: "Users fetched successfully",
      data: { pendingMechanics, approvedMechanics, buyers, sellers, reportedUsers, blockedUsers }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching users",
      data: null
    });
  }
};

const approveMechanic = async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { approved_status: 'Yes' } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Mechanic not found' });
    }

    res.json({ success: true, message: 'Mechanic approved successfully', data: updatedUser });
  } catch (error) {
    console.error('Error approving mechanic:', error);
    res.status(500).json({ success: false, message: 'Error approving mechanic: ' + error.message });
  }
};

const declineUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Error deleting user: ' + error.message });
  }
};

const deleteBuyer = async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ _id: req.params.id, userType: 'buyer' });
    if (!deletedUser) return res.status(404).json({ success: false, message: 'Buyer not found' });
    res.json({ success: true, message: 'Buyer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting buyer: ' + error.message });
  }
};

const deleteSeller = async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ _id: req.params.id, userType: 'seller' });
    if (!deletedUser) return res.status(404).json({ success: false, message: 'Seller not found' });
    res.json({ success: true, message: 'Seller deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting seller: ' + error.message });
  }
};

const blockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Toggle block status
    user.isBlocked = !user.isBlocked;
    user.blockedAt = user.isBlocked ? new Date() : null;
    await user.save();

    // If user is being blocked, remove their bids from all auctions (ongoing and ended)
    if (user.isBlocked) {
      const AuctionBid = (await import('../../models/AuctionBid.js')).default;
      const AuctionRequest = (await import('../../models/AuctionRequest.js')).default;

      // Find all auctions where this user has any bids
      const userBids = await AuctionBid.find({ 
        buyerId: userId
      });

      // Group bids by auction
      const auctionIds = [...new Set(userBids.map(b => b.auctionId.toString()))];

      for (const auctionId of auctionIds) {
        const auction = await AuctionRequest.findById(auctionId);
        
        if (!auction) continue;

        // Only process ongoing auctions (not ended/stopped)
        // For ended auctions, bids remain as historical records
        if (auction.started_auction === 'yes' && !auction.auction_stopped) {
          console.log(`Processing ongoing auction ${auctionId} - removing blocked user's bids`);

          // First, set all bids for this auction to not current
          await AuctionBid.updateMany(
            { auctionId: auctionId },
            { $set: { isCurrentBid: false } }
          );

          // Delete ALL bids from the blocked user for this auction
          const deletedResult = await AuctionBid.deleteMany({
            auctionId: auctionId,
            buyerId: userId
          });

          console.log(`Deleted ${deletedResult.deletedCount} bid(s) from blocked user for auction ${auctionId}`);

          // Find the new highest bid from remaining bidders
          const highestBid = await AuctionBid.findOne({
            auctionId: auctionId
          })
          .sort({ bidAmount: -1, bidTime: -1 })
          .exec();

          if (highestBid) {
            // Set the new highest bid as current
            highestBid.isCurrentBid = true;
            await highestBid.save();
            console.log(`New highest bidder for auction ${auctionId}: ₹${highestBid.bidAmount}`);
          } else {
            // No remaining bids - auction continues with no current bid
            console.log(`No remaining bids for auction ${auctionId} - auction continues without bids`);
          }
        }
      }
    }

    const message = user.isBlocked ? 'User blocked successfully' : 'User unblocked successfully';
    res.json({ success: true, message, data: { isBlocked: user.isBlocked } });
  } catch (error) {
    console.error('Error blocking/unblocking user:', error);
    res.status(500).json({ success: false, message: 'Error updating user status: ' + error.message });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).lean();
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    let statistics = {};

    // Seller statistics
    if (user.userType === 'seller') {
      // Total cars listed for auction - with details
      const auctionsList = await AuctionRequest.find({ sellerId: new mongoose.Types.ObjectId(userId) })
        .select('vehicleName year mileage startingBid status started_auction finalPurchasePrice createdAt')
        .lean();
      
      // Cars sold through auction (auctions that have ended with a winner)
      const soldCars = await AuctionRequest.find({ 
        sellerId: new mongoose.Types.ObjectId(userId), 
        started_auction: 'ended',
        winnerId: { $exists: true, $ne: null }
      })
      .select('vehicleName year finalPurchasePrice winnerId createdAt')
      .populate('winnerId', 'firstName lastName email')
      .lean();
      
      // Total rental listings - with details
      const rentalsList = await RentalRequest.find({ sellerId: new mongoose.Types.ObjectId(userId) })
        .select('vehicleName year costPerDay status buyerId pickupDate dropDate createdAt')
        .populate('buyerId', 'firstName lastName email')
        .lean();
      
      // Currently active auctions
      const activeAuctionsList = await AuctionRequest.find({ 
        sellerId: new mongoose.Types.ObjectId(userId), 
        started_auction: 'yes'
      })
      .select('vehicleName year startingBid auctionDate')
      .lean();
      
      // Currently active rentals (rented out)
      const activeRentalsList = await RentalRequest.find({ 
        sellerId: new mongoose.Types.ObjectId(userId), 
        status: 'unavailable'
      })
      .select('vehicleName year costPerDay buyerId pickupDate dropDate')
      .populate('buyerId', 'firstName lastName email')
      .lean();
      
      // Money earned from auctions
      const auctionEarnings = await AuctionCost.aggregate([
        { $match: { sellerId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: '$amountPaid' } } }
      ]);
      const totalAuctionEarnings = auctionEarnings.length > 0 ? auctionEarnings[0].total : 0;
      
      // Money earned from rentals
      const rentalEarnings = await RentalCost.aggregate([
        { $match: { sellerId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: '$totalCost' } } }
      ]);
      const totalRentalEarnings = rentalEarnings.length > 0 ? rentalEarnings[0].total : 0;
      
      statistics = {
        totalAuctionsListed: auctionsList.length,
        carsSold: soldCars.length,
        totalRentalListings: rentalsList.length,
        activeAuctions: activeAuctionsList.length,
        activeRentals: activeRentalsList.length,
        auctionEarnings: totalAuctionEarnings,
        rentalEarnings: totalRentalEarnings,
        totalEarnings: totalAuctionEarnings + totalRentalEarnings,
        auctionsList,
        soldCarsList: soldCars,
        rentalsList,
        activeAuctionsList,
        activeRentalsList
      };
    }
    
    // Mechanic statistics
    else if (user.userType === 'mechanic') {
      // Cars assigned to this mechanic - with details
      const assignedCars = await AuctionRequest.find({ 
        assignedMechanic: new mongoose.Types.ObjectId(userId)
      })
      .select('vehicleName year mileage reviewStatus status createdAt')
      .populate('sellerId', 'firstName lastName email')
      .lean();
      
      // Cars inspected (review completed)
      const inspectedCars = await AuctionRequest.find({ 
        assignedMechanic: new mongoose.Types.ObjectId(userId),
        reviewStatus: 'completed'
      })
      .select('vehicleName year mileage mechanicReview createdAt')
      .populate('sellerId', 'firstName lastName email')
      .lean();
      
      statistics = {
        carsAssigned: assignedCars.length,
        carsInspected: inspectedCars.length,
        assignedCarsList: assignedCars,
        inspectedCarsList: inspectedCars
      };
    }
    
    // Auction Manager statistics
    else if (user.userType === 'auction_manager') {
      // Cars accepted (approved) - with details
      const acceptedCars = await AuctionRequest.find({ 
        status: 'approved'
      })
      .select('vehicleName year mileage startingBid status started_auction createdAt')
      .populate('sellerId', 'firstName lastName email')
      .lean();
      
      // Cars auctioned (started or ended) - with details
      const auctionedCars = await AuctionRequest.find({ 
        started_auction: { $in: ['yes', 'ended'] }
      })
      .select('vehicleName year mileage startingBid status started_auction auctionDate winnerId createdAt')
      .populate('sellerId', 'firstName lastName email')
      .populate('winnerId', 'firstName lastName email')
      .lean();
      
      statistics = {
        carsAccepted: acceptedCars.length,
        carsAuctioned: auctionedCars.length,
        acceptedCarsList: acceptedCars,
        auctionedCarsList: auctionedCars
      };
    }
    
    // Buyer statistics
    else if (user.userType === 'buyer') {
      // Auctions participated in (unique auctions where user placed bids) - with details
      const auctionBids = await AuctionBid.find({ 
        buyerId: new mongoose.Types.ObjectId(userId)
      })
      .populate({
        path: 'auctionId',
        select: 'vehicleName year startingBid started_auction',
        populate: { path: 'sellerId', select: 'firstName lastName' }
      })
      .lean();
      
      // Get unique auctions
      const uniqueAuctions = [...new Map(auctionBids.map(bid => [bid.auctionId?._id?.toString(), bid.auctionId])).values()].filter(a => a);
      
      // Auctions won - with details
      const wonAuctions = await AuctionRequest.find({ 
        winnerId: new mongoose.Types.ObjectId(userId),
        started_auction: 'ended'
      })
      .select('vehicleName year finalPurchasePrice createdAt')
      .populate('sellerId', 'firstName lastName email')
      .lean();
      
      // Cars purchased - with details
      const purchasedCars = await Purchase.find({ 
        buyerId: new mongoose.Types.ObjectId(userId)
      })
      .select('vehicleName year purchasePrice purchaseDate')
      .populate('sellerId', 'firstName lastName email')
      .lean();
      
      // Total rentals - with details
      const rentalsList = await RentalRequest.find({ 
        buyerId: new mongoose.Types.ObjectId(userId)
      })
      .select('vehicleName year costPerDay status pickupDate dropDate')
      .populate('sellerId', 'firstName lastName email')
      .lean();
      
      // Currently active rentals
      const activeRentalsList = await RentalRequest.find({ 
        buyerId: new mongoose.Types.ObjectId(userId),
        status: 'unavailable'
      })
      .select('vehicleName year costPerDay pickupDate dropDate')
      .populate('sellerId', 'firstName lastName email')
      .lean();
      
      statistics = {
        auctionsParticipated: uniqueAuctions.length,
        auctionsWon: wonAuctions.length,
        carsPurchased: purchasedCars.length,
        totalRentals: rentalsList.length,
        activeRentals: activeRentalsList.length,
        participatedAuctionsList: uniqueAuctions,
        wonAuctionsList: wonAuctions,
        purchasedCarsList: purchasedCars,
        rentalsList,
        activeRentalsList
      };
    }

    res.json({
      success: true,
      user,
      statistics
    });
    
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user details: ' + error.message 
    });
  }
};

export default { getManageUsers, approveMechanic, declineUser, deleteBuyer, deleteSeller, blockUser, getUserDetails };