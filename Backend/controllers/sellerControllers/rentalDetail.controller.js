// controllers/sellerControllers/rentalDetail.controller.js
import RentalRequest from '../../models/RentalRequest.js';
import RentalCost from '../../models/RentalCost.js';

export const getRentalDetail = async (req, res) => {
  try {
    const rental = await RentalRequest.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    }).populate('buyerId', 'firstName lastName email phone');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }

    const rentalCost = await RentalCost.findOne({ rentalCarId: rental._id });
    const moneyReceived = rentalCost ? rentalCost.totalCost : null;

    res.json({
      success: true,
      data: { rental, moneyReceived }
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch rental details' });
  }
};

export const postMarkRentalReturned = async (req, res) => {
  try {
    const rental = await RentalRequest.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    });

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }

    // Check if rental period is completed
    const currentDate = new Date();
    if (rental.dropDate && currentDate <= new Date(rental.dropDate)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark as returned before the drop-off date'
      });
    }

    // Update rental to available status and clear buyer/dates
    rental.status = 'available';
    rental.buyerId = null;
    rental.pickupDate = null;
    rental.dropDate = null;

    await rental.save();

    res.json({
      success: true,
      message: 'Vehicle marked as returned and is now available for rent',
      data: rental
    });
  } catch (err) {
    console.error('Error marking rental as returned:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to mark rental as returned: ' + err.message
    });
  }
};
