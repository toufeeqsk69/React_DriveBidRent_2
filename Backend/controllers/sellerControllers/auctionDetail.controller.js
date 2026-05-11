
// controllers/sellerControllers/auctionDetail.controller.js
import AuctionRequest from '../../models/AuctionRequest.js';
import AuctionBid from '../../models/AuctionBid.js';
import InspectionChat from '../../models/InspectionChat.js';

export const getAuctionDetail = async (req, res) => {
  try {
    const auction = await AuctionRequest.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    })
      .populate('winnerId', 'firstName lastName email phone')
      .populate('assignedMechanic', 'firstName lastName email phone shopName experienceYears repairBikes repairCars')
      .lean();

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    // Fetch current highest bid if auction has started
    let currentBid = null;
    if (auction.started_auction === 'yes' || auction.started_auction === 'ended') {
      currentBid = await AuctionBid.findOne({
        auctionId: auction._id,
        isCurrentBid: true
      })
        .populate('buyerId', 'firstName lastName email phone')
        .lean();
    }

    // Find associated inspection chat
    const chat = await InspectionChat.findOne({ inspectionTask: auction._id }).lean();

    res.json({
      success: true,
      data: {
        ...auction,
        currentBid: currentBid,
        chatId: chat ? chat._id : null
      }
    });
  } catch (err) {
    console.error('Error fetching auction details:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch auction details' });
  }
};
