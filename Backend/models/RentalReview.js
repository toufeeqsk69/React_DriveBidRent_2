// models/RentalReview.js
import mongoose from 'mongoose';

const RentalReviewSchema = new mongoose.Schema({
    rentalCarId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RentalRequest',
        required: true
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 1000
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure one review per buyer per rental
RentalReviewSchema.index({ rentalCarId: 1, buyerId: 1 }, { unique: true });

export default mongoose.model('RentalReview', RentalReviewSchema);
