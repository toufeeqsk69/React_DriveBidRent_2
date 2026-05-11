// controllers/buyer/review.controller.js
import RentalReview from '../../models/RentalReview.js';
import RentalCost from '../../models/RentalCost.js';
import User from '../../models/User.js';

export const addReview = async (req, res) => {
    try {
        const { id: rentalCarId } = req.params;
        const buyerId = req.user._id;
        const { rating, comment } = req.body || {};

        // Validate input
        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Rating and comment are required'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if buyer has rented this car
        const rentalCost = await RentalCost.findOne({
            rentalCarId,
            buyerId
        });

        if (!rentalCost) {
            return res.status(403).json({
                success: false,
                message: 'You can only review cars you have rented'
            });
        }

        // Check if review already exists
        const existingReview = await RentalReview.findOne({
            rentalCarId,
            buyerId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this rental'
            });
        }

        // Create review
        const review = new RentalReview({
            rentalCarId,
            buyerId,
            rating,
            comment
        });

        await review.save();

        // Populate buyer info for response
        await review.populate('buyerId', 'firstName lastName');

        res.json({
            success: true,
            message: 'Review submitted successfully',
            data: { review }
        });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit review'
        });
    }
};

export const getReviews = async (req, res) => {
    try {
        const { id: rentalCarId } = req.params;

        const reviews = await RentalReview.find({ rentalCarId })
            .populate('buyerId', 'firstName lastName')
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            message: 'Reviews fetched successfully',
            data: { reviews }
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            data: { reviews: [] }
        });
    }
};

export const checkCanReview = async (req, res) => {
    try {
        const { id: rentalCarId } = req.params;
        const buyerId = req.user._id;

        // Check if buyer has rented this car
        const rentalCost = await RentalCost.findOne({
            rentalCarId,
            buyerId
        });

        // Check if review already exists
        const existingReview = await RentalReview.findOne({
            rentalCarId,
            buyerId
        });

        const canReview = !!rentalCost && !existingReview;

        res.json({
            success: true,
            data: {
                canReview,
                hasRented: !!rentalCost,
                hasReviewed: !!existingReview
            }
        });
    } catch (error) {
        console.error('Error checking review eligibility:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check review eligibility',
            data: { canReview: false }
        });
    }
};
