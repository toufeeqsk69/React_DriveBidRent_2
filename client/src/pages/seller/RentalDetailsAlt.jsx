// client/src/pages/seller/RentalDetailsAlt.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.util';
import LoadingSpinner from '../components/LoadingSpinner';

const RentalDetailsAlt = () => {
  const { id } = useParams();
  const [rental, setRental] = useState(null);
  const [moneyReceived, setMoneyReceived] = useState(null);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const response = await axiosInstance.get(`/seller/rental-details/${id}`);
        if (response.data.success) {
          setRental(response.data.data.rental);
          setMoneyReceived(response.data.data.moneyReceived);
          if (response.data.data.rental.status === 'unavailable') {
            setShowPopup(true);
          }
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Failed to load rental details');
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await axiosInstance.get(`/seller/rentals/${id}/reviews`);
        if (response.data.success) {
          setReviews(response.data.data.reviews);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };

    fetchRental();
    fetchReviews();
  }, [id]);

  const closePopup = () => setShowPopup(false);

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Rental details not found</h2>
        <Link to="/seller/view-rentals" className="text-orange-600 hover:underline">
          ← Back to Rentals
        </Link>
      </div>
    );
  }

  if (!rental) return <LoadingSpinner />;

  const formattedPickupDate = rental.pickupDate
    ? new Date(rental.pickupDate).toLocaleDateString('en-GB')
    : 'Not specified';
  const formattedDropDate = rental.dropDate
    ? new Date(rental.dropDate).toLocaleDateString('en-GB')
    : 'Not specified';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h2 className="text-xl font-bold text-orange-600 mb-3">Rental Status</h2>
            <p className="text-gray-700 mb-4">This car has been taken by someone for rental.</p>
            <button
              onClick={closePopup}
              className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-orange-600 mb-8">Rental Vehicle Details</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Image + Basic Info */}
          <div className="space-y-6">
            <img
              src={rental.vehicleImage}
              alt={rental.vehicleName}
              className="w-full h-80 object-cover rounded-lg shadow-md"
            />

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">{rental.vehicleName}</h3>
              <p className="text-gray-600">Cost per day: <strong>₹{rental.costPerDay}</strong></p>
              <p className="text-gray-600">Location: <strong>{rental.location}</strong></p>
            </div>

            {/* Rental Info */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Rental Information</h3>
              {rental.status === 'unavailable' && rental.buyerId ? (
                <div className="space-y-2 text-sm">
                  <p><strong>Renter:</strong> {rental.buyerId.firstName} {rental.buyerId.lastName}</p>
                  <p><strong>Email:</strong> {rental.buyerId.email}</p>
                  <p><strong>Phone:</strong> {rental.buyerId.phone}</p>
                  <p><strong>Pickup:</strong> {formattedPickupDate}</p>
                  <p><strong>Drop:</strong> {formattedDropDate}</p>
                  <p><strong>Money Received:</strong> ₹{moneyReceived?.toFixed(2) || 'N/A'}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No rental information available.</p>
              )}
            </div>
          </div>

          {/* Right: Specifications */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-orange-600 pb-2">
              Vehicle Specifications
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Year</span>
                <span>{rental.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">AC</span>
                <span>{rental.AC === 'available' ? 'Available' : 'Not Available'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Capacity</span>
                <span>{rental.capacity} passengers</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Condition</span>
                <span className="capitalize">{rental.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Fuel Type</span>
                <span className="capitalize">{rental.fuelType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Transmission</span>
                <span className="capitalize">{rental.transmission}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Driver</span>
                <span>
                  {rental.driverAvailable ? `Yes (₹${rental.driverRate}/day)` : 'No'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${rental.status === 'available'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                  }`}>
                  {rental.status}
                </span>
              </div>
            </div>

            <Link
              to="/seller/view-rentals"
              className="mt-6 inline-block bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition"
            >
              ← Back to Rentals
            </Link>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Customer Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No reviews yet</p>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
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

export default RentalDetailsAlt;