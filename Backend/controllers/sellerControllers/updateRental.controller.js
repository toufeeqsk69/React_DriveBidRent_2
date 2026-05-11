// controllers/sellerControllers/updateRental.controller.js
import RentalRequest from '../../models/RentalRequest.js';

export const postUpdateRental = async (req, res) => {
  try {
    const rental = await RentalRequest.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    });

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found.'
      });
    }

    // Check if rental has an active or upcoming booking
    if (rental.buyerId && rental.dropDate) {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const dropDate = new Date(rental.dropDate);
      dropDate.setHours(0, 0, 0, 0);
      
      // Prevent update if rental period has not ended yet
      if (currentDate <= dropDate) {
        return res.status(400).json({
          success: false,
          message: 'Cannot update rental details while a booking is active or upcoming. The rental period must end first.'
        });
      }
      
      // If rental period has ended but not marked as returned, automatically clear the booking
      if (currentDate > dropDate) {
        rental.buyerId = null;
        rental.pickupDate = null;
        rental.dropDate = null;
      }
    }

    // ... existing code ...
    const requiredFields = ['vehicle-ac', 'vehicle-condition', 'rental-cost', 'driver-available', 'availability'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate availability field
    if (req.body['availability'] !== 'available' && req.body['availability'] !== 'unavailable') {
      return res.status(400).json({
        success: false,
        message: 'Invalid availability value. Must be either "available" or "unavailable".'
      });
    }

    // Validate cost
    const cost = parseFloat(req.body['rental-cost']);
    if (isNaN(cost) || cost <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Cost per day must be a positive number.'
      });
    }

    // Validate driver rate if driver available
    if (req.body['driver-available'] === 'yes') {
      if (!req.body['driver-rate']) {
        return res.status(400).json({
          success: false,
          message: 'Driver rate is required when driver is available.'
        });
      }
      const driverRate = parseFloat(req.body['driver-rate']);
      if (isNaN(driverRate) || driverRate <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Driver rate must be a positive number.'
        });
      }
    }

    // Update only editable fields
    rental.AC = req.body['vehicle-ac'];
    rental.condition = req.body['vehicle-condition'];
    rental.costPerDay = cost;
    rental.driverAvailable = req.body['driver-available'] === 'yes';
    rental.status = req.body['availability'];

    if (rental.driverAvailable) {
      rental.driverRate = parseFloat(req.body['driver-rate']);
    } else {
      rental.driverRate = undefined;
    }

    await rental.save();

    res.json({
      success: true,
      message: 'Rental updated successfully!',
      data: rental
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update rental: ' + err.message
    });
  }
};