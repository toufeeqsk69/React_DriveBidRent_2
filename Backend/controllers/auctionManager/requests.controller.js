// controllers/auctionManager/requests.controller.js
import AuctionRequest from '../../models/AuctionRequest.js';

const send = (success, message, data = null) => ({
  success,
  message,
  data
});

export const getRequests = async (req, res) => {
  try {
    console.log('📋 [getRequests] ========================================');
    console.log('📋 [getRequests] Fetching ALL pending requests visible to all auction managers');
    console.log('📋 [getRequests] Requesting auction manager:', req.user._id);
    
    const requests = await AuctionRequest.find({ status: 'pending' })
      .populate('sellerId', 'firstName lastName city email')
      .sort({ createdAt: -1 });

    console.log('✅ [getRequests] Found', requests.length, 'pending requests (available for ANY manager to assign)');
    if (requests.length > 0) {
      console.log('📋 [getRequests] Request IDs:', requests.map(r => ({
        id: r._id.toString(),
        vehicle: r.vehicleName,
        seller: `${r.sellerId.firstName} ${r.sellerId.lastName}`,
        assignedManager: r.assignedAuctionManager || 'None'
      })));
    }
    console.log('📋 [getRequests] ========================================');
    
    res.json(send(true, 'Requests fetched', requests));
  } catch (err) {
    console.error('❌ [getRequests] Error:', err);
    res.json(send(false, 'Failed to load requests'));
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    console.log(`📋 [rejectRequest] Rejecting request ${id} by manager ${req.user._id}`);

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.json(send(false, 'Rejection reason is required'));
    }

    const request = await AuctionRequest.findById(id);

    if (!request) {
      return res.json(send(false, 'Request not found'));
    }

    if (request.status !== 'pending') {
      return res.json(send(false, 'Can only reject pending requests'));
    }

    // Update using findByIdAndUpdate to bypass strict full-document validation on older records
    const updatedRequest = await AuctionRequest.findByIdAndUpdate(
      id,
      {
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
        rejectedBy: req.user._id
      },
      { new: true }
    );

    console.log(`✅ [rejectRequest] Request ${id} successfully rejected`);
    res.json(send(true, 'Request rejected successfully', updatedRequest));
  } catch (err) {
    console.error('❌ [rejectRequest] Error:', err);
    res.json(send(false, `Failed to reject request: ${err.message}`));
  }
};
