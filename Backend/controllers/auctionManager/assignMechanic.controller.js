// controllers/auctionManager/assignMechanic.controller.js
import AuctionRequest from '../../models/AuctionRequest.js';
import User from '../../models/User.js';
import InspectionChat from '../../models/InspectionChat.js';
import mongoose from 'mongoose';

const send = (success, message, data = null) => ({
  success,
  message,
  data
});

export const getAssignMechanic = async (req, res) => {
  try {
    const request = await AuctionRequest.findById(req.params.id).populate('sellerId');
    if (!request) return res.json(send(false, 'Request not found'));

    // Get seller's city
    const sellerCity = request.sellerId?.city;
    
    console.log('=== ASSIGN MECHANIC DEBUG ===');
    console.log('Request ID:', req.params.id);
    console.log('Seller ID:', request.sellerId?._id);
    console.log('Seller City:', sellerCity);
    
    if (!sellerCity) {
      console.log('⚠️ Seller has no city defined');
      return res.json(send(false, 'Seller location not available. Please update seller address.'));
    }

    // Find mechanics in the same city who are approved
    const mechanics = await User.find({
      userType: 'mechanic',
      city: sellerCity,
      approved_status: 'Yes'
    }).select('firstName lastName shopName experienceYears city repairBikes repairCars _id');

    console.log('Found mechanics:', mechanics.length);
    if (mechanics.length > 0) {
      console.log('Mechanics:', mechanics.map(m => ({
        name: `${m.firstName} ${m.lastName}`,
        city: m.city,
        shop: m.shopName
      })));
    }

    res.json(send(true, 'Mechanics loaded', { request, mechanics }));
  } catch (err) {
    console.error('Assign mechanic error:', err);
    res.json(send(false, 'Failed to load mechanics'));
  }
};

export const assignMechanic = async (req, res) => {
  try {
    const { mechanicId, mechanicName } = req.body;

    if (!mechanicId || !mongoose.Types.ObjectId.isValid(mechanicId)) {
      return res.status(400).json(send(false, 'Valid mechanicId is required'));
    }

    const mechanic = await User.findOne({
      _id: mechanicId,
      userType: 'mechanic',
      approved_status: 'Yes'
    }).select('_id firstName lastName city');

    if (!mechanic) {
      return res.status(404).json(send(false, 'Approved mechanic not found'));
    }

    const requestDoc = await AuctionRequest.findById(req.params.id)
      .populate('sellerId', 'city')
      .select('_id sellerId');

    if (!requestDoc) {
      return res.status(404).json(send(false, 'Request not found'));
    }

    const sellerCity = requestDoc.sellerId?.city;
    if (sellerCity && mechanic.city && mechanic.city !== sellerCity) {
      return res.status(400).json(send(false, 'Mechanic city does not match seller city'));
    }

    console.log('🔧 [assignMechanic] Starting assignment process:', {
      carId: req.params.id,
      mechanicId,
      mechanicName,
      auctionManagerId: req.user._id
    });

    const updated = await AuctionRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'assignedMechanic',
        assignedMechanic: mechanicId,
        mechanicName: mechanicName || `${mechanic.firstName} ${mechanic.lastName}`,
        assignedAuctionManager: req.user._id  // Track which auction manager assigned this
      },
      { new: true }
    );

    if (!updated) {
      console.log('❌ [assignMechanic] Request not found:', req.params.id);
      return res.json(send(false, 'Request not found'));
    }

    console.log('✅ [assignMechanic] Car updated with auction manager assignment:', {
      carId: updated._id,
      assignedAuctionManager: updated.assignedAuctionManager,
      vehicleName: updated.vehicleName
    });

    // Add car to auction manager's assigned cars array
    try {
      const AuctionManager = (await import('../../models/AuctionManager.js')).default;
      const updatedManager = await AuctionManager.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { auctionCars: updated._id } },
        { new: true }
      ).select('auctionCars firstName lastName');
      
      console.log('✅ [assignMechanic] Auction manager updated:', {
        auctionManagerId: req.user._id,
        name: `${updatedManager.firstName} ${updatedManager.lastName}`,
        totalAssignedCars: updatedManager.auctionCars.length,
        carId: updated._id
      });
    } catch (amErr) {
      console.error('❌ [assignMechanic] Failed to update auction manager record:', amErr);
      return res.json(send(false, 'Failed to assign car to auction manager'));
    }

    // Add to mechanic's assigned requests
    try {
      await User.findByIdAndUpdate(
        mechanicId,
        { $addToSet: { assignedRequests: updated._id } },
        { new: true }
      );
      console.log('✅ [assignMechanic] Car added to mechanic\'s assigned requests');
    } catch (uErr) {
      console.error('❌ [assignMechanic] Failed to update mechanic assignedRequests:', uErr);
      return res.json(send(true, 'Mechanic assigned successfully, but failed to update mechanic record'));
    }

    // Auto-create an inspection chat for this assignment (one per task) using InspectionChat model
    let chatDoc = null;
    try {
      let existingChat = await InspectionChat.findOne({ inspectionTask: updated._id });

      if (!existingChat) {
        const created = await InspectionChat.create({
          mechanic: mechanicId,
          auctionManager: req.user._id,
          seller: updated.sellerId,
          inspectionTask: updated._id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          title: `Inspection: ${updated.vehicleName}`
        });
        console.log('✅ [assignMechanic] InspectionChat created for:', updated.vehicleName, 'id=', created._id);
        chatDoc = created;
      } else {
        console.log('ℹ️ [assignMechanic] Using existing InspectionChat');
        chatDoc = existingChat;
      }

      if (chatDoc) {
        chatDoc = await InspectionChat.findById(chatDoc._id)
          .populate('mechanic', 'firstName lastName _id')
          .populate('auctionManager', 'firstName lastName _id')
          .populate({ path: 'inspectionTask', select: 'vehicleName vehicleImage _id' });
      }
    } catch (cErr) {
      console.error('❌ [assignMechanic] Failed to create or fetch InspectionChat:', cErr);
    }

    console.log('✅ [assignMechanic] Assignment completed successfully');
    res.json(send(true, 'Mechanic assigned successfully', { chat: chatDoc }));
  } catch (err) {
    console.error('Assign mechanic save error:', err);
    res.status(500).json(send(false, 'Failed to assign mechanic'));
  }
};