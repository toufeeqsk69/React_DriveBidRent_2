// client/src/pages/buyer/components/modals/ReviewModal.jsx
import { useState } from 'react';

export default function ReviewModal({ isOpen, onClose, onSubmit, rentalName }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        if (!comment.trim()) {
            setError('Please write a comment');
            return;
        }

        if (comment.length > 1000) {
            setError('Comment must be less than 1000 characters');
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit({ rating, comment });
            setRating(0);
            setComment('');
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setRating(0);
            setComment('');
            setError('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
                    <p className="text-gray-600 text-sm mt-1">Share your experience with {rentalName}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Star Rating */}
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Rating
                        </label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="text-3xl focus:outline-none transition-transform hover:scale-110"
                                >
                                    <span
                                        className={
                                            star <= (hoverRating || rating)
                                                ? 'text-orange-500'
                                                : 'text-gray-300'
                                        }
                                    >
                                        ★
                                    </span>
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                                {rating} star{rating !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Your Review
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us about your rental experience..."
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                            disabled={submitting}
                        />
                        <p className="text-xs text-gray-500 mt-1 text-right">
                            {comment.length}/1000 characters
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-3 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}