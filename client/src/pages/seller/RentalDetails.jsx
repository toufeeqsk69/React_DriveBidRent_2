import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import useSellerRentals from '../../hooks/useSellerRentals';

const RentalDetails = () => {
  const { id } = useParams();
  const { currentRental: rental, reviews, loading: _rentalLoading, loadRentalById, loadReviews, markRentalAsReturned } = useSellerRentals();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadRentalById(id);
    loadReviews(id);
  }, [id, loadRentalById, loadReviews]);

  const handleMarkAsReturned = async () => {
    setLoading(true);
    setError(null);
    try {
      await markRentalAsReturned(id);
      setSuccess('Vehicle marked as returned and is now available for rent!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to mark rental as returned. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isRentalCompleted = () => {
    if (!rental?.dropDate) return false;
    const currentDate = new Date();
    const dropDate = new Date(rental.dropDate);
    return currentDate > dropDate;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>
          <Link to="/seller/view-rentals" className="text-orange-600 hover:text-orange-700 font-medium">
            Back to Rentals
          </Link>
        </div>
      </div>
    );
  }

  if (!rental) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-orange-600 mb-10">Rental Vehicle Details</h1>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-6">
              <img
                src={rental.vehicleImage}
                alt={rental.vehicleName}
                className="w-full h-auto rounded-lg shadow-md mb-6"
              />
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{rental.vehicleName}</h2>
                <p className="text-lg text-gray-700 mb-1">Cost per day: ₹{rental.costPerDay?.toLocaleString('en-IN')}</p>
                <p className="text-lg text-gray-700">Location: {rental.location}</p>
              </div>
            </div>

            <div className="md:w-1/2 p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Vehicle Specifications</h2>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Year:</span>
                  <span className="text-gray-900">{rental.year}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">AC:</span>
                  <span className="text-gray-900">{rental.ac ? 'Available' : 'Not Available'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Capacity:</span>
                  <span className="text-gray-900">{rental.capacity} passengers</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Condition:</span>
                  <span className="text-gray-900 capitalize">{rental.condition}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Fuel Type:</span>
                  <span className="text-gray-900 capitalize">{rental.fuelType}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Transmission:</span>
                  <span className="text-gray-900 capitalize">{rental.transmission}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Driver Available:</span>
                  <span className="text-gray-900">{rental.driverAvailable ? 'Yes' : 'No'}</span>
                </div>
                {rental.driverAvailable && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-700">Driver Rate:</span>
                    <span className="text-gray-900">₹{rental.driverRate?.toLocaleString('en-IN')}/day</span>
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-3">
                {error && (
                  <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{error}</div>
                )}
                {success && (
                  <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm">{success}</div>
                )}
                <div className="flex gap-4">
                  <Link
                    to="/seller/view-rentals"
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200"
                  >
                    Back to Rentals
                  </Link>
                  <Link
                    to={`/seller/edit-rental/${rental._id}`}
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200"
                  >
                    Update Details
                  </Link>
                </div>
                {isRentalCompleted() && rental?.buyerId && rental?.status === 'unavailable' && (
                  <button
                    onClick={handleMarkAsReturned}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-green-700 disabled:opacity-70 transition-colors duration-200"
                  >
                    {loading ? 'Processing...' : '✓ Mark as Returned & Make Available'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Customer Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.buyerId?.firstName} {review.buyerId?.lastName}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RentalDetails;