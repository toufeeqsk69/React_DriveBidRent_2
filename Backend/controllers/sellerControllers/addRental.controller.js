// controllers/sellerControllers/addRental.controller.js
import RentalRequest from '../../models/RentalRequest.js';
import { uploadToCloudinary } from '../../utils/fileUpload.js';

export const postAddRental = async (req, res) => {
  console.log('Request Body:', req.body);

  if (!req.file) {
    return res.status(400).json({ 
      success: false,
      message: 'Vehicle image upload failed or is missing.'
    });
  }

  try {
    const requiredFields = [
      'vehicle-name', 
      'vehicle-year',
      'vehicle-ac',
      'vehicle-capacity',
      'vehicle-condition',
      'vehicle-fuel-type',
      'vehicle-transmission',
      'rental-cost',
      'driver-available'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    if (req.body['driver-available'] === 'yes' && !req.body['driver-rate']) {
      return res.status(400).json({
        success: false,
        message: 'Driver rate is required when driver is available'
      });
    }

    let imageUrl = req.file.path;
    if (!imageUrl && req.file.buffer) {
      const uploaded = await uploadToCloudinary(req.file.buffer, 'drivebidrent');
      imageUrl = uploaded?.secure_url || uploaded?.url || null;
    }

    const newRental = new RentalRequest({
      vehicleName: req.body['vehicle-name'],
      vehicleImage: imageUrl,
      year: parseInt(req.body['vehicle-year']),
      AC: req.body['vehicle-ac'],
      capacity: parseInt(req.body['vehicle-capacity']),
      condition: req.body['vehicle-condition'],
      fuelType: req.body['vehicle-fuel-type'],
      transmission: req.body['vehicle-transmission'],
      costPerDay: parseFloat(req.body['rental-cost']),
      driverAvailable: req.body['driver-available'] === 'yes',
      driverRate: req.body['driver-available'] === 'yes' ? parseFloat(req.body['driver-rate']) : undefined,
      sellerId: req.user._id,
      status: 'available'
    });

    const savedRental = await newRental.save();
    console.log('Saved Rental:', savedRental);

    return res.json({
      success: true,
      message: 'Rental Request Submitted',
      data: savedRental
    });

  } catch (err) {
    console.error('Save Error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Error saving rental: ' + err.message
    });
  }
};