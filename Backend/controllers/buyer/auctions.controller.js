// controllers/buyer/auctions.controller.js
import AuctionRequest from '../../models/AuctionRequest.js';
import AuctionBid from '../../models/AuctionBid.js';
import Purchase from '../../models/Purchase.js';
import AuctionCost from '../../models/AuctionCost.js';

import redisClient from '../../utils/redisClient.js';

// Controller for all auctions page with search/filter
export const getAuctions = async (req, res) => {
  try {
    const { search, condition, fuelType, transmission, minPrice, maxPrice } = req.query;

    // Build a unique cache key based on query params
    const cacheKey = `auctions:${JSON.stringify(req.query)}`;
    const startTime = Date.now();

    // Check Redis Cache first
    if (redisClient.isReady) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        const responseTime = Date.now() - startTime;
        console.log(`\x1b[32m[REDIS HIT]\x1b[0m  Key: ${cacheKey} | Time: ${responseTime}ms (served from Redis cache)\x1b[0m`);
        return res.json({
          success: true,
          message: 'Auctions fetched successfully (Cached)',
          cacheStatus: 'HIT',
          responseTime: responseTime,
          data: JSON.parse(cachedData)
        });
      }
    }

    // CACHE MISS — fetch from MongoDB Atlas
    const query = {
      status: 'approved',
      started_auction: 'yes',
      auction_stopped: false  // Only show ongoing auctions
    };

    // Optimize user search experience utilizing MongoDB text indexes instead of regex
    if (search) {
      query.$text = { $search: search };
    }
    if (condition) query.condition = condition;
    if (fuelType) query.fuelType = fuelType;
    if (transmission) query.transmission = transmission;
    if (minPrice || maxPrice) {
      query.startingBid = {};
      if (minPrice) query.startingBid.$gte = parseFloat(minPrice);
      if (maxPrice) query.startingBid.$lte = parseFloat(maxPrice);
    }

    const auctions = await AuctionRequest.find(query)
      .sort({ auctionDate: 1 })
      .populate('sellerId', 'firstName lastName email phone city state')
      .lean();

    const auctionIds = auctions.map((auction) => auction._id);
    let auctionsWithBids = auctions;

    if (auctionIds.length) {
      const currentBids = await AuctionBid.find({
        auctionId: { $in: auctionIds },
        isCurrentBid: true
      })
        .select('auctionId bidAmount')
        .lean();

      const currentBidMap = currentBids.reduce((acc, bid) => {
        acc[bid.auctionId.toString()] = bid.bidAmount;
        return acc;
      }, {});

      auctionsWithBids = auctions.map((auction) => ({
        ...auction,
        currentHighestBid: currentBidMap[auction._id.toString()] ?? auction.startingBid
      }));
    }

    const responseData = {
      auctions: auctionsWithBids,
      filters: { search, condition, fuelType, transmission, minPrice, maxPrice }
    };

    // Save to Redis Cache with 90 second TTL
    if (redisClient.isReady) {
      await redisClient.setEx(cacheKey, 90, JSON.stringify(responseData));
    }

    const responseTime = Date.now() - startTime;
    console.log(`\x1b[33m[REDIS MISS]\x1b[0m Key: ${cacheKey} | Time: ${responseTime}ms (fetched from MongoDB Atlas)\x1b[0m`);

    res.json({
      success: true,
      message: 'Auctions fetched successfully (from Atlas)',
      cacheStatus: 'MISS',
      responseTime: responseTime,
      data: responseData
    });
  } catch (err) {
    console.error('Error fetching auctions:', err);
    res.status(500).json({
      success: false,
      message: 'An error occurred while loading auctions',
      data: null
    });
  }
};

// Controller for single auction view - FIXED
export const getSingleAuction = async (req, res) => {
  try {
    // FIX: Get ID from URL params instead of query params
    const auctionId = req.params.id;

    if (!auctionId) {
      return res.status(400).json({
        success: false,
        message: 'Auction ID is required',
        data: null
      });
    }

    const auction = await AuctionRequest.findOne({
      _id: auctionId,
      started_auction: 'yes',
      auction_stopped: false  // Only show ongoing auctions
    })
      .populate('sellerId', 'firstName lastName email phone city state')
      .lean();

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found or has ended',
        data: null
      });
    }

    const currentBid = await AuctionBid.findOne({ auctionId, isCurrentBid: true })
      .sort({ bidTime: -1 })
      .lean();

    const isCurrentBidder = currentBid && req.user._id.toString() === currentBid.buyerId.toString();

    res.json({
      success: true,
      message: 'Auction details fetched',
      data: {
        auction,
        seller: auction.sellerId,
        currentBid,
        isCurrentBidder,
        isLoggedIn: true,
        user: req.user
      }
    });
  } catch (error) {
    console.error('Error fetching auction:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      data: null
    });
  }
};

// Controller for placing a bid
export const placeBid = async (req, res) => {
  try {
    const { auctionId, bidAmount } = req.body;
    const buyerId = req.user._id;

    if (!auctionId || !bidAmount) {
      return res.status(400).json({ success: false, message: 'Auction ID and bid amount are required' });
    }

    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid bid amount' });
    }

    const auction = await AuctionRequest.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    if (auction.started_auction !== 'yes' || auction.auction_stopped) {
      return res.status(400).json({ success: false, message: 'Auction is not active or has been stopped' });
    }

    const currentBid = await AuctionBid.findOne({ auctionId, isCurrentBid: true })
      .sort({ bidTime: -1 })
      .lean();

    if (currentBid && currentBid.buyerId.toString() === buyerId.toString()) {
      return res.status(400).json({ success: false, message: 'You already have the current bid' });
    }

    const minBid = currentBid ? currentBid.bidAmount + 2000 : auction.startingBid;
    if (bidValue < minBid) {
      return res.status(400).json({
        success: false,
        message: `Your bid must be at least ₹${minBid.toLocaleString()}`
      });
    }

    const newBid = new AuctionBid({
      auctionId,
      sellerId: auction.sellerId,
      buyerId,
      bidAmount: bidValue,
      isCurrentBid: true
    });

    await newBid.save();

    // Emit real-time WebSocket event
    const io = req.app.get('io');
    if (io) {
      try {
        const User = (await import('../../models/User.js')).default;
        const bidder = await User.findById(buyerId).select('firstName lastName -_id').lean();
        const payload = {
          bidAmount: bidValue,
          auctionId: auctionId.toString(),
          buyerId: buyerId.toString(),
          bidderName: bidder ? `${bidder.firstName} ${bidder.lastName.charAt(0)}.` : 'Anonymous'
        };

        // Emit to specific auction room
        io.to(auctionId.toString()).emit('new_bid', payload);

        // Emit globally for dashboard lists
        io.emit('global_new_bid', payload);
      } catch (err) {
        console.error('Socket.io error emitting new_bid:', err);
      }
    }

    res.json({
      success: true,
      message: 'Bid placed successfully',
      data: { bidAmount: bidValue, auctionId, buyerId }
    });
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Controller to check if user is the auction winner and get payment status
export const getAuctionWinnerStatus = async (req, res) => {
  try {
    const auction = await AuctionRequest.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    if (!auction.auction_stopped) {
      return res.json({ success: true, data: { isWinner: false } });
    }

    const isWinner = auction.winnerId && auction.winnerId.toString() === req.user._id.toString();
    if (!isWinner) {
      return res.json({ success: true, data: { isWinner: false } });
    }

    const purchase = await Purchase.findOne({ auctionId: auction._id, buyerId: req.user._id });

    res.json({
      success: true,
      message: 'Winner status checked',
      data: {
        isWinner: true,
        bidAmount: auction.finalPurchasePrice,
        paymentStatus: purchase ? purchase.paymentStatus : 'pending'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Controller to fetch payment details for the popup
export const getAuctionConfirmPayment = async (req, res) => {
  try {
    const auctionId = req.params.id;
    const userId = req.user._id;
    const purchase = await Purchase.findOne({ auctionId, buyerId: userId });

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    if (purchase.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Payment already completed' });
    }

    const convenienceFee = purchase.purchasePrice * 0.01;
    const totalAmount = purchase.purchasePrice + convenienceFee;

    res.json({
      success: true,
      message: 'Payment details fetched',
      data: {
        purchaseId: purchase._id,
        auctionId: purchase.auctionId,
        amount: purchase.purchasePrice,
        convenienceFee,
        totalAmount
      }
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Controller to handle final payment submission
export const completeAuctionPayment = async (req, res) => {
  try {
    const purchaseId = req.params.id;
    const userId = req.user._id;
    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    if (purchase.buyerId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (purchase.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Payment already completed' });
    }

    const convenienceFee = purchase.purchasePrice * 0.01;
    const totalAmount = purchase.purchasePrice + convenienceFee;

    const auctionCost = new AuctionCost({
      auctionId: purchase.auctionId,
      buyerId: userId,
      sellerId: purchase.sellerId,
      amountPaid: purchase.purchasePrice,
      convenienceFee,
      totalAmount,
      paymentDate: new Date()
    });

    await auctionCost.save();
    purchase.paymentStatus = 'completed';
    await purchase.save();

    res.json({ success: true, message: 'Payment completed successfully' });
  } catch (error) {
    console.error('Error completing payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Controller to fetch completed auction details with winner information
export const getCompletedAuctionDetails = async (req, res) => {
  try {
    const auctionId = req.params.id;

    const auction = await AuctionRequest.findById(auctionId)
      .populate('sellerId', 'firstName lastName email phone city state doorNo street')
      .lean();

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found',
        data: null
      });
    }

    // Check if auction is completed
    if (auction.started_auction !== 'ended') {
      return res.status(400).json({
        success: false,
        message: 'This auction has not been completed yet',
        data: null
      });
    }

    // Get the winner information from the Purchase record
    const purchase = await Purchase.findOne({ auctionId })
      .populate('buyerId', 'firstName lastName email phone city state doorNo street')
      .lean();

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase details not found',
        data: null
      });
    }

    // Get all bids for this auction to show bid history
    const bidHistory = await AuctionBid.find({ auctionId })
      .populate('buyerId', 'firstName lastName')
      .sort({ bidTime: -1 })
      .limit(10)
      .lean();

    // Filter out any bids where buyerId is null and ensure we have valid data
    const validBidHistory = bidHistory.filter(bid => bid.buyerId && bid.buyerId.firstName && bid.buyerId.lastName);

    res.json({
      success: true,
      message: 'Completed auction details fetched',
      data: {
        auction: {
          _id: auction._id,
          vehicleName: auction.vehicleName,
          vehicleImage: auction.vehicleImage,
          year: auction.year,
          mileage: auction.mileage,
          condition: auction.condition,
          fuelType: auction.fuelType,
          transmission: auction.transmission,
          startingBid: auction.startingBid,
          auctionDate: auction.auctionDate,
          mechanicReview: auction.mechanicReview
        },
        seller: {
          _id: auction.sellerId._id,
          firstName: auction.sellerId.firstName,
          lastName: auction.sellerId.lastName,
          email: auction.sellerId.email,
          phone: auction.sellerId.phone,
          city: auction.sellerId.city,
          state: auction.sellerId.state,
          address: auction.sellerId.doorNo && auction.sellerId.street
            ? `${auction.sellerId.doorNo}, ${auction.sellerId.street}, ${auction.sellerId.city}, ${auction.sellerId.state}`
            : 'Address not available'
        },
        winner: {
          _id: purchase.buyerId._id,
          firstName: purchase.buyerId.firstName,
          lastName: purchase.buyerId.lastName,
          email: purchase.buyerId.email,
          phone: purchase.buyerId.phone,
          city: purchase.buyerId.city,
          state: purchase.buyerId.state,
          address: purchase.buyerId.doorNo && purchase.buyerId.street
            ? `${purchase.buyerId.doorNo}, ${purchase.buyerId.street}, ${purchase.buyerId.city}, ${purchase.buyerId.state}`
            : 'Address not available'
        },
        finalPrice: purchase.purchasePrice,
        purchaseDate: purchase.purchaseDate,
        paymentStatus: purchase.paymentStatus,
        bidHistory: validBidHistory
      }
    });
  } catch (error) {
    console.error('Error fetching completed auction details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      data: null
    });
  }
};