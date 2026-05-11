import AuctionRequest from '../../models/AuctionRequest.js';

// 1. Lock the official inspection date
// so cloudinary.uploader.upload_stream works out of the box.

// 1. Lock the official inspection date
export const scheduleInspection = async (req, res) => {
  try {
    const { auctionId, date, time } = req.body;
    
    if (!date || !time) {
      return res.status(400).json({ success: false, message: 'Date and time are required' });
    }

    const auction = await AuctionRequest.findOneAndUpdate(
      { _id: auctionId, assignedMechanic: req.user._id },
      { 
        inspectionDate: date, 
        inspectionTime: time, 
        inspectionStatus: 'scheduled' 
      },
      { new: true }
    );

    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction request not found or unauthorized' });
    }

    res.json({ success: true, message: 'Inspection scheduled successfully', data: auction });
  } catch (err) {
    console.error('Schedule Inspection Error:', err);
    res.status(500).json({ success: false, message: 'Server error while scheduling inspection' });
  }
};

export const submitInspection = async (req, res) => {
  try {
    const { auctionId } = req.params;
    
    const {
      exterior, interior, engine, testDrive, overallRating, isApprovedForAuction, mechanicSummary
    } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const auction = await AuctionRequest.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    if (!auction.assignedMechanic || auction.assignedMechanic.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not assigned to you' });
    }

    if (!exterior || !interior || !engine || !testDrive || overallRating === undefined || isApprovedForAuction === undefined || !mechanicSummary) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const updatePayload = {
      inspectionStatus: 'completed',
      reviewStatus: 'completed',
      multipointInspection: {
        exterior, interior, engine, testDrive, overallRating, isApprovedForAuction, mechanicSummary
      },
      mechanicReview: {
        mechanicalCondition: `Engine: ${engine.startupSmoothness}, Battery: ${engine.batteryHealth}`,
        bodyCondition: `Paint: ${exterior.paintCondition}/10. Tires: ${exterior.tiresCondition}`,
        recommendations: mechanicSummary,
        conditionRating: `${overallRating}/10`
      }
    };

    await AuctionRequest.findByIdAndUpdate(auctionId, updatePayload, { 
      new: true,
      runValidators: false 
    });

    return res.json({ 
      success: true, 
      message: 'Inspection report submitted successfully!' 
    });

  } catch (err) {
    console.error('Submit Inspection Error:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while submitting inspection'
    });
  }
};
