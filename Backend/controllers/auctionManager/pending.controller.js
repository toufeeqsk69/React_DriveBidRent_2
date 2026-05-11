// controllers/auctionManager/pending.controller.js
import AuctionRequest from '../../models/AuctionRequest.js';

const send = (success, message, data = null) => ({
  success,
  message,
  data
});

export const getPending = async (req, res) => {
  try {
    console.log('📋 [getPending] ========================================');
    console.log('📋 [getPending] Fetching pending cars for auction manager:', req.user._id);
    
    // Method 1: Using assignedAuctionManager field (more reliable)
    const carsByField = await AuctionRequest.find({ 
      status: 'assignedMechanic',
      assignedAuctionManager: req.user._id
    })
      .populate('sellerId', 'firstName lastName city')
      .populate('assignedAuctionManager', 'firstName lastName')
      .sort({ createdAt: -1 });

    console.log('📌 [getPending] Method 1 - Filter by assignedAuctionManager field:');
    console.log('   Found', carsByField.length, 'cars');
    if (carsByField.length > 0) {
      console.log('   Cars:', carsByField.map(c => ({
        id: c._id.toString(),
        name: c.vehicleName,
        assignedTo: c.assignedAuctionManager ? `${c.assignedAuctionManager.firstName} ${c.assignedAuctionManager.lastName}` : 'None'
      })));
    }

    // Method 2: Using auction manager's auctionCars array (backup)
    const AuctionManager = (await import('../../models/AuctionManager.js')).default;
    const auctionManager = await AuctionManager.findById(req.user._id).select('auctionCars firstName lastName');
    
    if (!auctionManager) {
      console.log('❌ [getPending] Auction manager not found');
      return res.json(send(false, 'Auction manager not found'));
    }

    console.log('📌 [getPending] Auction Manager:', `${auctionManager.firstName} ${auctionManager.lastName}`);
    console.log('📌 [getPending] Has', auctionManager.auctionCars?.length || 0, 'cars in auctionCars array');
    if (auctionManager.auctionCars && auctionManager.auctionCars.length > 0) {
      console.log('   Car IDs:', auctionManager.auctionCars.map(id => id.toString()));
    }

    const assignedCarIds = auctionManager.auctionCars || [];
    const carsByArray = await AuctionRequest.find({ 
      status: 'assignedMechanic',
      _id: { $in: assignedCarIds }
    })
      .populate('sellerId', 'firstName lastName city')
      .sort({ createdAt: -1 });

    console.log('📌 [getPending] Method 2 - Filter by auctionCars array:');
    console.log('   Found', carsByArray.length, 'cars');

    // Use the more reliable method (assignedAuctionManager field)
    const cars = carsByField;
    
    console.log('✅ [getPending] Returning', cars.length, 'pending cars to frontend');
    console.log('📋 [getPending] ========================================');
    res.json(send(true, 'Pending cars fetched', cars));
  } catch (err) {
    console.error('❌ [getPending] Error:', err);
    res.json(send(false, 'Failed to load pending cars'));
  }
};

export const getReview = async (req, res) => {
  try {
    const car = await AuctionRequest.findById(req.params.id)
      .populate('assignedMechanic', 'firstName lastName');

    if (!car) return res.json(send(false, 'Car not found'));

    const review = car.mechanicReview || {};
    const mechanicName = car.assignedMechanic
      ? `${car.assignedMechanic.firstName} ${car.assignedMechanic.lastName}`
      : 'Unknown';

    res.json(send(true, 'Review fetched', {
      ...review,
      reviewStatus: car.reviewStatus || 'pending',
      mechanicName
    }));
  } catch (err) {
    console.error('Review error:', err);
    res.json(send(false, 'Error fetching review'));
  }
};

export const updateStatus = async (req, res) => {
  try {
    console.log('🔄 [updateStatus] Updating status for car:', req.params.id, 'to:', req.body.status);

    const { status, startingBid } = req.body;

    const car = await AuctionRequest.findById(req.params.id);

    if (!car) {
      console.log('❌ [updateStatus] Car not found');
      return res.json(send(false, 'Car not found'));
    }

    // Verify this car is assigned to the auction manager
    if (!car.assignedAuctionManager || car.assignedAuctionManager.toString() !== req.user._id.toString()) {
      console.log('❌ [updateStatus] Car not assigned to this auction manager');
      return res.json(send(false, 'You are not authorized to update this car'));
    }

    if (['approved', 'rejected'].includes(status) && car.reviewStatus === 'pending') {
      return res.json(send(false, 'Cannot change status until mechanic review is complete'));
    }

    if (status === 'approved' && (!car.mechanicReview?.mechanicalCondition || !car.mechanicReview?.bodyCondition)) {
      return res.json(send(false, 'Complete mechanic review required for approval'));
    }

    // Build the update object
    const updateData = { status };

    // When approving, set the manager-defined starting bid
    if (status === 'approved' && startingBid && Number(startingBid) > 0) {
      updateData.startingBid = Number(startingBid);
      console.log('💰 [updateStatus] Setting manager-defined starting bid:', updateData.startingBid);
    }

    const updated = await AuctionRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    console.log('✅ [updateStatus] Status updated to:', updated.status, '| Starting bid:', updated.startingBid);
    res.json(send(true, 'Status updated', { status: updated.status, startingBid: updated.startingBid }));
  } catch (err) {
    console.error('❌ [updateStatus] Error:', err);
    res.json(send(false, 'Failed to update status'));
  }
};

export const getPendingCarDetails = async (req, res) => {
  try {
    const car = await AuctionRequest.findById(req.params.id)
      .populate('assignedMechanic', 'firstName lastName')
      .populate('sellerId', 'firstName lastName email phone city');

    if (!car) return res.json(send(false, 'Car not found'));

    res.json(send(true, 'Car details fetched', car));
  } catch (err) {
    console.error('Car details error:', err);
    res.json(send(false, 'Failed to load car details'));
  }
};