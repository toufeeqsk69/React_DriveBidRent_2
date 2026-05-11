// controllers/sellerControllers/viewAuctions.controller.js
import AuctionRequest from '../../models/AuctionRequest.js';
import AuctionBid from '../../models/AuctionBid.js';

// GET: Get all auctions created by the logged-in seller
export const getViewAuctions = async (req, res) => {
  try {
    const auctions = await AuctionRequest.find({ sellerId: req.user._id })
      .populate('assignedMechanic', 'firstName lastName doorNo street city state')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: auctions || []
    });
  } catch (err) {
    console.error('Error fetching auction data:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load auction data'
    });
  }
};

// GET: Get bids for a specific auction (with auction details)
export const getViewBids = async (req, res) => {
  try {
    const auctionId = req.params.id;

    const auction = await AuctionRequest.findOne({
      _id: auctionId,
      sellerId: req.user._id
    })
      .populate('assignedMechanic', 'firstName lastName doorNo street city state')
      .lean();

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }


    // Fetch all bids for this auction
    const bids = await AuctionBid.find({ auctionId })
      .populate('buyerId', 'firstName lastName email phone')
      .sort({ bidTime: -1 })
      .lean();

    res.json({
      success: true,
      data: bids
    });
  } catch (err) {
    console.error('Error accessing auction bids:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to access auction bids.'
    });
  }
};

export const acceptBid = async (req, res) => {
  try {
    const bidId = req.params.id;
    const bid = await AuctionBid.findByIdAndUpdate(
      bidId,
      { status: 'accepted' },
      { new: true }
    );

    if (!bid) {
      return res.status(404).json({ success: false, message: 'Bid not found' });
    }

    res.json({ success: true, message: 'Bid accepted', data: bid });
  } catch (err) {
    console.error('Error accepting bid:', err);
    res.status(500).json({ success: false, message: 'Failed to accept bid' });
  }
};

export const rejectBid = async (req, res) => {
  try {
    const bidId = req.params.id;
    const bid = await AuctionBid.findByIdAndUpdate(
      bidId,
      { status: 'rejected' },
      { new: true }
    );

    if (!bid) {
      return res.status(404).json({ success: false, message: 'Bid not found' });
    }

    res.json({ success: true, message: 'Bid rejected', data: bid });
  } catch (err) {
    console.error('Error rejecting bid:', err);
    res.status(500).json({ success: false, message: 'Failed to reject bid' });
  }
};