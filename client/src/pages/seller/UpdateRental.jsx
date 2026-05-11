import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.util';

const UpdateRental = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    'vehicle-ac': '',
    'vehicle-condition': '',
    'rental-cost': '',
    'driver-available': '',
    'driver-rate': '',
    'availability': ''
  });
  const [readOnlyData, setReadOnlyData] = useState({
    'vehicle-name': '',
    'vehicle-year': '',
    'vehicle-capacity': '',
    'vehicle-fuel-type': '',
    'vehicle-transmission': '',
    vehicleImage: null
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReturnButton, setShowReturnButton] = useState(false);
  const [isRentalActive, setIsRentalActive] = useState(false);

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const response = await axiosInstance.get(`/seller/rental-details/${id}`);
        if (response.data.success) {
          const rental = response.data.data.rental;
          // Editable fields
          setFormData({
            'vehicle-ac': rental.ac ? 'available' : 'not',
            'vehicle-condition': rental.condition || '',
            'rental-cost': rental.costPerDay || '',
            'driver-available': rental.driverAvailable ? 'yes' : 'no',
            'driver-rate': rental.driverRate || '',
            'availability': rental.status || 'unavailable'
          });
          // Read-only fields
          setReadOnlyData({
            'vehicle-name': rental.vehicleName || '',
            'vehicle-year': rental.year || '',
            'vehicle-capacity': rental.capacity || '',
            'vehicle-fuel-type': rental.fuelType || '',
            'vehicle-transmission': rental.transmission || '',
            vehicleImage: rental.vehicleImage || null
          });

          // Check if rental is currently active (not yet returned)
          if (rental.buyerId && rental.dropDate) {
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            const dropDate = new Date(rental.dropDate);
            dropDate.setHours(0, 0, 0, 0);
            
            // Rental is active if current date is before or on drop date
            const isActive = currentDate <= dropDate;
            setIsRentalActive(isActive);
            
            // Show return button if rental period ended but not marked as returned
            setShowReturnButton(currentDate > dropDate);
          }
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Failed to load rental details');
      }
    };
    fetchRental();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    let isValid = true;
    setError(null);

    if (!formData['vehicle-ac']) {
      setError('Please select AC availability.');
      isValid = false;
    }
    if (!formData['vehicle-condition']) {
      setError('Please select vehicle condition.');
      isValid = false;
    }
    if (!formData['rental-cost']) {
      setError('Cost per day is required.');
      isValid = false;
    }
    const cost = parseFloat(formData['rental-cost']);
    if (isNaN(cost) || cost <= 0) {
      setError('Cost per day must be a positive number.');
      isValid = false;
    }
    if (!formData['driver-available']) {
      setError('Please select driver availability.');
      isValid = false;
    }
    if (formData['driver-available'] === 'yes' && !formData['driver-rate']) {
      setError('Driver rate is required when driver is available.');
      isValid = false;
    }
    if (formData['driver-available'] === 'yes') {
      const driverRate = parseFloat(formData['driver-rate']);
      if (isNaN(driverRate) || driverRate <= 0) {
        setError('Driver rate must be a positive number.');
        isValid = false;
      }
    }
    if (!formData['availability']) {
      setError('Please select availability status.');
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    const submitData = new FormData();
    // Only send editable fields
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        submitData.append(key, formData[key]);
      }
    });
    try {
      const response = await axiosInstance.put(`/seller/update-rental/${id}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setSuccess('Rental updated successfully!');
        setError(null);
        setTimeout(() => navigate('/seller/view-rentals'), 2000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsReturned = async () => {
    if (!window.confirm('Mark this rental as returned and make it available for new bookings?')) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await axiosInstance.post(`/seller/rental/mark-returned/${id}`);
      if (response.data.success) {
        setSuccess('Vehicle marked as returned and is now available for rent!');
        setTimeout(() => navigate('/seller/view-rentals'), 2000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to mark rental as returned. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Update Rental Vehicle</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
            <p className="font-medium">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6">
            <p className="font-medium">{success}</p>
          </div>
        )}
        
        {isRentalActive && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded mb-6">
            <p className="font-medium">⚠️ This vehicle is currently rented and cannot be modified until the rental period ends.</p>
          </div>
        )}
        
        {showReturnButton && (
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded mb-6">
            <p className="font-medium">✓ Rental period ended. Mark as returned to make it available for new bookings, or update the details below.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow space-y-6">
          {/* Read-Only Section */}
          <div className={`p-6 border-b ${isRentalActive ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Vehicle Information <span className="text-sm font-normal text-gray-500">(Cannot be changed)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Name */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Vehicle Name</label>
                <input
                  type="text"
                  value={readOnlyData['vehicle-name']}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed"
                />
              </div>

              {/* Year */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  value={readOnlyData['vehicle-year']}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed"
                />
              </div>

              {/* Capacity */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Capacity</label>
                <input
                  type="number"
                  value={readOnlyData['vehicle-capacity']}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed"
                />
              </div>

              {/* Fuel Type */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Fuel Type</label>
                <input
                  type="text"
                  value={readOnlyData['vehicle-fuel-type'] ? readOnlyData['vehicle-fuel-type'].charAt(0).toUpperCase() + readOnlyData['vehicle-fuel-type'].slice(1) : ''}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed"
                />
              </div>

              {/* Transmission */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Transmission</label>
                <input
                  type="text"
                  value={readOnlyData['vehicle-transmission'] ? readOnlyData['vehicle-transmission'].charAt(0).toUpperCase() + readOnlyData['vehicle-transmission'].slice(1) : ''}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed"
                />
              </div>

              {/* Image */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Current Image</label>
                {readOnlyData.vehicleImage && (
                  <img
                    src={readOnlyData.vehicleImage}
                    alt="Vehicle"
                    className="w-full h-32 object-cover rounded border border-gray-300"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Editable Section */}
          <div className={`p-6 ${isRentalActive ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Rental Details <span className="text-sm font-normal text-gray-500">(You can update these)</span>
            </h2>

            <div className="space-y-6">
              {/* AC */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">AC Availability <span className="text-red-500">*</span></label>
                <select
                  name="vehicle-ac"
                  value={formData['vehicle-ac']}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select AC Availability</option>
                  <option value="available">Available</option>
                  <option value="not">Not Available</option>
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Condition <span className="text-red-500">*</span></label>
                <select
                  name="vehicle-condition"
                  value={formData['vehicle-condition']}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select Condition</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>

              {/* Cost Per Day */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Cost per Day (₹) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="rental-cost"
                  value={formData['rental-cost']}
                  onChange={handleChange}
                  required
                  min="1"
                  step="0.01"
                  placeholder="Enter daily rental cost"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Driver Available */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Driver Available <span className="text-red-500">*</span></label>
                <select
                  name="driver-available"
                  value={formData['driver-available']}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select Driver Availability</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* Driver Rate */}
              {formData['driver-available'] === 'yes' && (
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Driver Rate (₹/day) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="driver-rate"
                    value={formData['driver-rate']}
                    onChange={handleChange}
                    required
                    min="1"
                    step="0.01"
                    placeholder="Enter driver daily rate"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Availability */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Availability for Rentals <span className="text-red-500">*</span></label>
                <select
                  name="availability"
                  value={formData['availability']}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select Availability</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
                <p className="text-sm text-gray-600 mt-1">
                  Set to "Available" to show this vehicle in rental listings.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 space-y-3">
            {showReturnButton && (
              <button
                type="button"
                onClick={handleMarkAsReturned}
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white font-medium py-3 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Mark as Returned & Make Available'}
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || isRentalActive}
              className="w-full bg-orange-600 text-white font-medium py-3 rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRentalActive ? 'Cannot Update - Vehicle is Rented' : (isSubmitting ? 'Updating...' : 'Update Rental Details')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateRental;