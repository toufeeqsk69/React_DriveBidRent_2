// controllers/buyer/my-bids.controller.js
import AuctionBid from '../../models/AuctionBid.js';
import AuctionRequest from '../../models/AuctionRequest.js';

export const getMyBids = async (req, res) => {
  try {
    const buyerId = req.user._id;

    const myBids = await AuctionBid.find({ buyerId })
      .populate('auctionId')
      .populate('sellerId', 'firstName lastName')
      .sort({ bidTime: -1 })
      .lean();

    const auctionMap = new Map();

    myBids.forEach(bid => {
      if (bid.auctionId && !auctionMap.has(bid.auctionId._id.toString())) {
        auctionMap.set(bid.auctionId._id.toString(), {
          auction: bid.auctionId,
          seller: bid.sellerId,
          myHighestBid: bid.bidAmount,
          totalBids: 1,
          lastBidTime: bid.bidTime,
          bidStatus: 'active'
        });
      } else if (bid.auctionId) {
        const existingAuction = auctionMap.get(bid.auctionId._id.toString());
        if (bid.bidAmount > existingAuction.myHighestBid) {
          existingAuction.myHighestBid = bid.bidAmount;
        }
        existingAuction.totalBids += 1;
        if (bid.bidTime > existingAuction.lastBidTime) {
          existingAuction.lastBidTime = bid.bidTime;
        }
      }
    });

    const auctionsWithBids = await Promise.all(
      Array.from(auctionMap.values()).map(async item => {
        let bidStatus = 'active';
        if (item.auction.auction_stopped || item.auction.started_auction === 'ended') {
          bidStatus = 'ended';
        } else if (item.auction.started_auction === 'no') {
          bidStatus = 'pending';
        } else if (item.auction.started_auction === 'yes') {
          bidStatus = 'active';
        }

        let highestBid = null;
        if (bidStatus === 'ended' || bidStatus === 'active') {
          const topBid = await AuctionBid.findOne({ auctionId: item.auction._id })
            .sort({ bidAmount: -1 })
            .select('bidAmount')
            .lean();
          highestBid = topBid ? topBid.bidAmount : null;
        }

        return {
          ...item,
          bidStatus,
          highestBid
        };
      })
    );

    res.json({
      success: true,
      message: 'My bids fetched successfully',
      data: { auctionsWithBids, activePage: 'my-bids' }
    });

    // res.render('buyer_dashboard/my-bids', {
    //   user: req.user,
    //   auctionsWithBids,
    //   activePage: 'my-bids'
    // });
  } catch (error) {
    console.error('Error fetching my bids:', error);
    res.json({
      success: false,
      message: 'Failed to load your bids',
      data: { auctionsWithBids: [] }
    });

    // res.render('buyer_dashboard/my-bids', {
    //   user: req.user,
    //   auctionsWithBids: [],
    //   error: 'Failed to load your bids'
    // });
  }
};