// controllers/buyer/rentals.controller.js
import RentalRequest from '../../models/RentalRequest.js';
import RentalCost from '../../models/RentalCost.js';
import User from '../../models/User.js';
import ChatController from '../../controllers/chat.controller.js';
import redisClient from '../../utils/redisClient.js';

export const getRentals = async (req, res) => {
  try {
    const { search, fuelType, transmission, minPrice, maxPrice, capacity, city } = req.query;

    // Build a unique cache key based on query params
    const cacheKey = `rentals:${JSON.stringify(req.query)}`;
    const startTime = Date.now();

    // Check Redis Cache first
    if (redisClient.isReady) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        const responseTime = Date.now() - startTime;
        console.log(`\x1b[32m[REDIS HIT]\x1b[0m  Key: ${cacheKey} | Time: ${responseTime}ms (served from Redis cache)\x1b[0m`);
        return res.json({
          success: true,
          message: 'Rentals fetched successfully (Cached)',
          cacheStatus: 'HIT',
          responseTime: responseTime,
          data: JSON.parse(cachedData)
        });
      }
    }

    // CACHE MISS — fetch from MongoDB Atlas
    const query = { status: 'available' };

    if (search) query.vehicleName = { $regex: search, $options: 'i' };
    if (fuelType) query.fuelType = fuelType;
    if (transmission) query.transmission = transmission;
    if (minPrice || maxPrice) {
      query.costPerDay = {};
      if (minPrice) query.costPerDay.$gte = parseFloat(minPrice);
      if (maxPrice) query.costPerDay.$lte = parseFloat(maxPrice);
    }
    if (capacity) query.capacity = { $gte: parseInt(capacity) };

    let rentals = await RentalRequest.find(query)
      .populate('sellerId', 'firstName lastName email phone city state')
      .lean();

    if (city) {
      rentals = rentals.filter(rental => rental.sellerId && rental.sellerId.city && rental.sellerId.city.toLowerCase() === city.toLowerCase());
    }

    const sellersWithRentals = await RentalRequest.find({ status: 'available' })
      .populate('sellerId', 'city')
      .lean();

    const uniqueCities = [...new Set(
      sellersWithRentals
        .filter(rental => rental.sellerId && rental.sellerId.city)
        .map(rental => rental.sellerId.city)
    )].sort();

    const responseData = {
      rentals,
      filters: { searchQuery: search, fuelType, transmission, minPrice, maxPrice, capacity, city },
      uniqueCities
    };

    // Save to Redis Cache with 90 second TTL
    if (redisClient.isReady) {
      await redisClient.setEx(cacheKey, 90, JSON.stringify(responseData));
    }

    const responseTime = Date.now() - startTime;
    console.log(`\x1b[33m[REDIS MISS]\x1b[0m Key: ${cacheKey} | Time: ${responseTime}ms (fetched from MongoDB Atlas)\x1b[0m`);

    res.json({
      success: true,
      message: 'Rentals fetched successfully (from Atlas)',
      cacheStatus: 'MISS',
      responseTime: responseTime,
      data: responseData
    });
  } catch (err) {
    console.error('Error fetching rentals:', err);
    res.status(500).json({
      success: false,
      message: 'An error occurred while loading rentals',
      data: null
    });
  }
};

export const getSingleRental = async (req, res) => {
  try {
    // FIX: Get ID from URL params instead of query params
    const rentalId = req.params.id;
    
    const rental = await RentalRequest.findById(rentalId)
      .populate('sellerId', 'firstName lastName email phone city state')
      .lean();

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Rental details fetched',
      data: {
        rentalId: rental._id,
        vehicleName: rental.vehicleName,
        vehicleImage: rental.vehicleImage,
        year: rental.year,
        condition: rental.condition,
        capacity: rental.capacity,
        fuelType: rental.fuelType,
        transmission: rental.transmission,
        AC: rental.AC,
        costPerDay: rental.costPerDay,
        driverAvailable: rental.driverAvailable,
        driverRate: rental.driverRate,
        status: rental.status,
        seller: rental.sellerId,
        user: req.user
      }
    });
  } catch (err) {
    console.error('Error fetching single rental:', err);
    res.status(500).json({
      success: false,
      message: 'An error occurred while loading the rental',
      data: null
    });
  }
};

export const bookRental = async (req, res) => {
  try {
    const { rentalCarId, sellerId, pickupDate, dropDate, totalCost, includeDriver } = req.body;
    const buyerId = req.user._id;

    if (!rentalCarId || !buyerId || !sellerId || !pickupDate || !dropDate || !totalCost) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const rentalRequest = await RentalRequest.findById(rentalCarId);
    if (!rentalRequest) {
      return res.status(404).json({ success: false, message: 'Rental request not found' });
    }

    const updatedRentalRequest = await RentalRequest.findByIdAndUpdate(
      rentalCarId,
      {
        buyerId,
        pickupDate,
        dropDate,
        includeDriver: includeDriver || false,
        status: 'unavailable'
      },
      { new: true }
    );

    const rentalCost = new RentalCost({
      rentalCarId,
      buyerId,
      sellerId,
      totalCost,
      includeDriver: includeDriver || false
    });

    const savedRentalCost = await rentalCost.save();

    // Create chat for this rental (chat is unique per rental)
    try {
      if (updatedRentalRequest) {
        await ChatController.createChatForRental(updatedRentalRequest);
      }
    } catch (err) {
      console.warn('Failed to create chat for rental:', err.message || err);
    }
    
    // Convert to lean object for response
    const rentalData = updatedRentalRequest.toObject ? updatedRentalRequest.toObject() : updatedRentalRequest;

    res.json({
      success: true,
      message: 'Rental booked successfully',
      data: { rentalRequest: rentalData, totalCost }
    });
  } catch (err) {
    console.error('Error in POST /rental:', err);
    res.status(500).json({ success: false, message: 'Failed to save rental details: ' + err.message });
  }
};