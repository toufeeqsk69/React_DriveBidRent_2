// controllers/auctionManager/approved.controller.js
import AuctionRequest from '../../models/AuctionRequest.js';

const send = (success, message, data = null) => ({
  success,
  message,
  data
});

export const getApproved = async (req, res) => {
  try {
    console.log('✅ [getApproved] ========================================');
    console.log('✅ [getApproved] Fetching approved cars for auction manager:', req.user._id);
    
    // Method 1: Using assignedAuctionManager field (more reliable)
    const carsByField = await AuctionRequest.find({ 
      status: 'approved',
      assignedAuctionManager: req.user._id
    })
      .populate('sellerId', 'firstName lastName city email')
      .populate('assignedAuctionManager', 'firstName lastName')
      .sort({ createdAt: -1 });

    console.log('📌 [getApproved] Method 1 - Filter by assignedAuctionManager field:');
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
      console.log('❌ [getApproved] Auction manager not found');
      return res.json(send(false, 'Auction manager not found'));
    }

    console.log('📌 [getApproved] Auction Manager:', `${auctionManager.firstName} ${auctionManager.lastName}`);
    console.log('📌 [getApproved] Has', auctionManager.auctionCars?.length || 0, 'cars in auctionCars array');
    if (auctionManager.auctionCars && auctionManager.auctionCars.length > 0) {
      console.log('   Car IDs:', auctionManager.auctionCars.map(id => id.toString()));
    }

    const assignedCarIds = auctionManager.auctionCars || [];
    const carsByArray = await AuctionRequest.find({ 
      status: 'approved',
      _id: { $in: assignedCarIds }
    })
      .populate('sellerId', 'firstName lastName city email')
      .sort({ createdAt: -1 });

    console.log('📌 [getApproved] Method 2 - Filter by auctionCars array:');
    console.log('   Found', carsByArray.length, 'cars');

    // Use the more reliable method (assignedAuctionManager field)
    const cars = carsByField;
    
    console.log('✅ [getApproved] Returning', cars.length, 'approved cars to frontend');
    console.log('✅ [getApproved] ========================================');
    res.json(send(true, 'Approved cars fetched', cars));
  } catch (err) {
    console.error('❌ [getApproved] Error:', err);
    res.json(send(false, 'Failed to load approved cars'));
  }
};