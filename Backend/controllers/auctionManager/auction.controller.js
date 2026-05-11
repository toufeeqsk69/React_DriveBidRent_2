// controllers/auctionManager/auction.controller.js
import AuctionRequest from '../../models/AuctionRequest.js';
import AuctionBid from '../../models/AuctionBid.js';
import Purchase from '../../models/Purchase.js';
import User from '../../models/User.js';
import Notification from '../../models/Notification.js';
import AuctionManager from '../../models/AuctionManager.js';
import chatController from '../../controllers/chat.controller.js';
const { createChatForAuction } = chatController;

const send = (success, message, data = null) => ({
  success,
  message,
  data
});

export const startAuction = async (req, res) => {
  try {
    console.log('🚀 [startAuction] Starting auction:', req.params.id, 'by auction manager:', req.user._id);
    
    // Verify this car is assigned to the auction manager using assignedAuctionManager field
    const auction = await AuctionRequest.findById(req.params.id);
    
    if (!auction) {
      console.log('❌ [startAuction] Auction not found');
      return res.json(send(false, 'Auction not found'));
    }

    console.log('📌 [startAuction] Car details:', {
      carId: auction._id.toString(),
      vehicleName: auction.vehicleName,
      assignedAuctionManager: auction.assignedAuctionManager?.toString(),
      requestingManager: req.user._id.toString()
    });

    if (!auction.assignedAuctionManager || auction.assignedAuctionManager.toString() !== req.user._id.toString()) {
      console.log('❌ [startAuction] Car not assigned to this auction manager');
      return res.json(send(false, 'You are not authorized to start this auction'));
    }

    auction.started_auction = 'yes';
    await auction.save();
    
    console.log('✅ [startAuction] Auction started successfully');
    res.json(send(true, 'Auction started'));
  } catch (err) {
    console.error('❌ [startAuction] Error:', err);
    res.json(send(false, 'Failed to start auction'));
  }
};

export const stopAuction = async (req, res) => {
  try {
    console.log('[stopAuction] Stopping auction:', req.params.id, 'by auction manager:', req.user._id);
    
    const auction = await AuctionRequest.findById(req.params.id);
    
    if (!auction) {
      console.log('[stopAuction] Auction not found');
      return res.json(send(false, 'Auction not found'));
    }

    // Verify this car is assigned to the auction manager
    if (!auction.assignedAuctionManager || auction.assignedAuctionManager.toString() !== req.user._id.toString()) {
      console.log('[stopAuction] Car not assigned to this auction manager');
      return res.json(send(false, 'You are not authorized to stop this auction'));
    }

    if (auction.started_auction !== 'yes' || auction.auction_stopped) {
      console.log('[stopAuction] Invalid auction state');
      return res.json(send(false, 'Invalid auction state'));
    }

    const currentBid = await AuctionBid.findOne({ auctionId: auction._id, isCurrentBid: true })
      .populate('buyerId', 'firstName lastName email');

    auction.auction_stopped = true;
    auction.started_auction = 'ended';

    if (currentBid && currentBid.buyerId && currentBid.buyerId._id) {
      auction.winnerId = currentBid.buyerId._id;
      auction.finalPurchasePrice = currentBid.bidAmount;
      
      // Set payment deadline to 4 days from now
      const paymentDeadline = new Date();
      paymentDeadline.setDate(paymentDeadline.getDate() + 4);
      auction.paymentDeadline = paymentDeadline;

      const seller = await User.findById(auction.sellerId);
      try {
        await Purchase.create({
          auctionId: auction._id,
          buyerId: currentBid.buyerId._id,
          sellerId: auction.sellerId,
          vehicleName: auction.vehicleName || 'Vehicle',
          // AuctionRequest stores the primary image in mainImage.
          vehicleImage: auction.mainImage || auction.vehicleImage || auction.additionalImages?.[0] || 'https://dummyimage.com/600x400/cccccc/000000&text=Vehicle',
          year: Number(auction.year) || new Date().getFullYear(),
          mileage: Number(auction.mileage) || 0,
          carType: auction.carType,
          purchasePrice: currentBid.bidAmount,
          sellerName: seller ? `${seller.firstName} ${seller.lastName}` : 'Unknown Seller',
          paymentStatus: 'pending'
        });
      } catch (purchaseErr) {
        console.error('[stopAuction] Purchase create failed:', purchaseErr);
        return res.json(send(false, `Failed to finalize purchase: ${purchaseErr.message}`));
      }

      try {
        await AuctionBid.notifyAuctionWinner(auction._id, currentBid.buyerId._id);
      } catch (notifyErr) {
        console.error('[stopAuction] Winner notification failed:', notifyErr);
      }

      // create auction chat (5 days duration) between winner and seller
      try {
        await createChatForAuction(auction, currentBid.buyerId._id, new Date());
      } catch (e) {
        console.error('create auction chat error:', e);
      }
    } else if (currentBid && (!currentBid.buyerId || !currentBid.buyerId._id)) {
      console.log('[stopAuction] Current bid has no valid buyer reference; stopping auction without winner.');
    }

    await auction.save();
    console.log('[stopAuction] Auction stopped successfully, hasWinner:', !!currentBid);
    res.json(send(true, 'Auction stopped', { hasWinner: !!currentBid }));
  } catch (err) {
    console.error('[stopAuction] Error:', err);
    res.json(send(false, 'Server error'));
  }
};

export const viewBids = async (req, res) => {
  try {
    console.log('👀 [viewBids] Viewing bids for auction:', req.params.id, 'by auction manager:', req.user._id);
    
    const auction = await AuctionRequest.findById(req.params.id)
      .populate('sellerId', 'firstName lastName email city')
      .lean();

    if (!auction) {
      console.log('[viewBids] Auction not found');
      return res.json(send(false, 'Auction not found'));
    }

    // Verify this car is assigned to the auction manager.
    // Fallback to auctionManager.auctionCars for older records where assignedAuctionManager is missing.
    const assignedByField = !!auction.assignedAuctionManager && auction.assignedAuctionManager.toString() === req.user._id.toString();

    let assignedByArray = false;
    if (!assignedByField) {
      const manager = await AuctionManager.findById(req.user._id).select('auctionCars').lean();
      assignedByArray = !!manager?.auctionCars?.some(
        (carId) => carId.toString() === auction._id.toString()
      );

      // Auto-heal legacy records so future checks are consistent.
      if (assignedByArray && !auction.assignedAuctionManager) {
        await AuctionRequest.findByIdAndUpdate(auction._id, { assignedAuctionManager: req.user._id });
      }
    }

    if (!assignedByField && !assignedByArray) {
      console.log('[viewBids] Car not assigned to this auction manager');
      return res.json(send(false, 'You are not authorized to view bids for this auction'));
    }

    const bids = await AuctionBid.getBidsForAuction(req.params.id);
    
    // Filter out bids from blocked users
    const filteredBids = [];
    for (const bid of bids) {
      if (bid.buyerId && bid.buyerId._id) {
        const buyer = await User.findById(bid.buyerId._id).select('isBlocked');
        if (!buyer || !buyer.isBlocked) {
          filteredBids.push(bid);
        }
      }
    }
    
    const currentBid = filteredBids.find(b => b.isCurrentBid) || null;
    const pastBids = filteredBids.filter(b => !b.isCurrentBid).slice(0, 3);

    console.log('[viewBids] Loaded', filteredBids.length, 'bids for auction');
    res.json(send(true, 'Bids loaded', { auction, currentBid, pastBids }));
  } catch (err) {
    console.error('[viewBids] Error:', err);
    res.json(send(false, 'Failed to load bids'));
  }
};

export const reAuction = async (req, res) => {
  try {
    console.log('[reAuction] Re-auction attempt for:', req.params.id, 'by auction manager:', req.user._id);
    
    const auction = await AuctionRequest.findById(req.params.id);
    
    if (!auction) {
      console.log('[reAuction] Auction not found');
      return res.json(send(false, 'Auction not found'));
    }

    // Verify this car is assigned to the auction manager
    if (!auction.assignedAuctionManager || auction.assignedAuctionManager.toString() !== req.user._id.toString()) {
      console.log('[reAuction] Car not assigned to this auction manager');
      return res.json(send(false, 'You are not authorized to re-auction this car'));
    }

    console.log('[reAuction] Auction state:', {
      auctionId: auction._id,
      paymentDeadline: auction.paymentDeadline,
      currentTime: new Date(),
      auction_stopped: auction.auction_stopped,
      started_auction: auction.started_auction
    });

    // Check if auction has ended
    if (!auction.auction_stopped && auction.started_auction !== 'ended') {
      return res.json(send(false, 'Auction must be ended first'));
    }

    // Check if payment deadline has passed (allow if deadline exists and is in the past)
    const now = new Date();
    if (auction.paymentDeadline) {
      const deadline = new Date(auction.paymentDeadline);
      if (now <= deadline) {
        console.log('Payment deadline not passed:', { now, deadline });
        return res.json(send(false, 'Payment deadline has not passed yet'));
      }
    } else if (!auction.winnerId) {
      // If no payment deadline and no winner, auction ended without bids
      return res.json(send(false, 'Auction ended without any winner'));
    }

    // Check if payment was already completed
    const purchase = await Purchase.findOne({ auctionId: auction._id });
    if (purchase && purchase.paymentStatus === 'completed') {
      return res.json(send(false, 'Payment already completed'));
    }

    // Check if already re-auctioned
    if (auction.paymentFailed === true) {
      return res.json(send(false, 'This auction has already been re-auctioned'));
    }

    // Mark the previous winner as failed buyer and report them
    if (auction.winnerId) {
      auction.failedBuyerId = auction.winnerId;
      auction.paymentFailed = true;

      // Report the buyer to admin
      const failedBuyer = await User.findById(auction.winnerId);
      if (failedBuyer) {
        failedBuyer.isReported = true;
        failedBuyer.reportReason = `Failed to complete payment for ${auction.vehicleName} within 4 days after auction ended.`;
        failedBuyer.reportedAt = new Date();
        await failedBuyer.save();
      }
    }

    // Reset auction to ongoing state
    auction.started_auction = 'yes';
    auction.auction_stopped = false;
    auction.isReauctioned = true;
    auction.winnerId = null;
    auction.finalPurchasePrice = null;
    auction.paymentDeadline = null;

    // Delete ALL previous bids from the old auction
    await AuctionBid.deleteMany({ auctionId: auction._id });

    // Delete the incomplete purchase record
    if (purchase) {
      await Purchase.deleteOne({ _id: purchase._id });
    }

    await auction.save();
    console.log('[reAuction] Re-auction successful for:', auction._id);
    res.json(send(true, 'Auction re-opened successfully'));
  } catch (err) {
    console.error('[reAuction] Error:', err);
    res.json(send(false, `Failed to re-auction: ${err.message}`));
  }
};