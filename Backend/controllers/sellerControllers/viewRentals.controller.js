// controllers/sellerControllers/viewRentals.controller.js
import RentalRequest from '../../models/RentalRequest.js';

export const getViewRentals = async (req, res) => {
  try {
    const rentals = await RentalRequest.find({ sellerId: req.user._id });
    
    const processedRentals = rentals.map(rental => ({
      ...rental._doc,
      location: req.user.city || 'City not specified'
    }));
    
    res.json({ success: true, data: processedRentals });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: 'Failed to load rental listings' });
  }
};

export const postToggleRentalStatus = async (req, res) => {
  try {
    const rentalId = req.params.id;
    const rental = await RentalRequest.findById(rentalId);
    
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }
    
    if (rental.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    rental.status = rental.status === 'available' ? 'unavailable' : 'available';
    await rental.save();
    
    return res.json({ success: true, newStatus: rental.status });
  } catch (err) {
    console.error('Error toggling status:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};