import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.util';

const AddRental = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    'vehicle-name': '',
    'vehicle-year': '',
    'vehicle-ac': '',
    'vehicle-capacity': '',
    'vehicle-condition': '',
    'vehicle-fuel-type': '',
    'vehicle-transmission': '',
    'rental-cost': '',
    'driver-available': '',
    'driver-rate': '',
    vehicleImage: null
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const validateForm = () => {
    let isValid = true;
    setError(null);
    if (formData['vehicle-name'].trim().length < 2) {
      setError('Vehicle name is required and should be at least 2 characters.');
      isValid = false;
    }
    if (!formData.vehicleImage || !formData.vehicleImage.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      isValid = false;
    }
    const currentYear = new Date().getFullYear();
    if (formData['vehicle-year'] < 1900 || formData['vehicle-year'] > currentYear) {
      setError('Year must be between 1900 and 2025.');
      isValid = false;
    }
    if (!formData['vehicle-ac']) {
      setError('Please select AC availability.');
      isValid = false;
    }
    if (formData['vehicle-capacity'] < 1) {
      setError('Capacity must be at least 1 passenger.');
      isValid = false;
    }
    ['vehicle-condition', 'vehicle-fuel-type', 'vehicle-transmission', 'driver-available'].forEach(field => {
      if (!formData[field]) {
        setError(`Please select ${field.replace('-', ' ')}.`);
        isValid = false;
      }
    });
    if (formData['rental-cost'] <= 0) {
      setError('Cost must be a positive amount.');
      isValid = false;
    }
    if (formData['driver-available'] === 'yes' && formData['driver-rate'] <= 0) {
      setError('Driver rate must be a positive amount if driver is available.');
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    try {
      const response = await axiosInstance.post('/seller/add-rental', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setSuccess('Rental added successfully!');
        // Redirect to view rentals page after successful submission
        setTimeout(() => {
          navigate('/seller/view-rentals');
        }, 1000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const driverAvailable = formData['driver-available'];
    const driverRateContainer = document.getElementById('driver-rate-container');
    if (driverRateContainer) {
      driverRateContainer.style.display = driverAvailable === 'yes' ? 'block' : 'none';
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData['driver-available']]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-orange-600 mb-8">Add Vehicle for Rent</h1>
        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center font-medium">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6 text-center font-medium">{success}</div>}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
          <div>
            <label className="block font-medium text-gray-700 mb-2">Vehicle Name</label>
            <input 
              type="text" 
              name="vehicle-name" 
              value={formData['vehicle-name']} 
              onChange={handleChange} 
              required 
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200" 
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-2">Vehicle Image</label>
            <input 
              type="file" 
              name="vehicleImage" 
              onChange={handleChange} 
              required 
              accept="image/*" 
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200" 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-gray-700 mb-2">Year</label>
              <input 
                type="number" 
                name="vehicle-year" 
                value={formData['vehicle-year']} 
                onChange={handleChange} 
                required 
                min="1900" 
                max="2025" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200" 
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-2">AC</label>
              <select 
                name="vehicle-ac" 
                value={formData['vehicle-ac']} 
                onChange={handleChange} 
                required 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
              >
                <option value="">Select</option>
                <option value="available">Available</option>
                <option value="not">Not Available</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block font-medium text-gray-700 mb-2">Capacity</label>
              <input 
                type="number" 
                name="vehicle-capacity" 
                value={formData['vehicle-capacity']} 
                onChange={handleChange} 
                required 
                min="1" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200" 
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-2">Condition</label>
              <select 
                name="vehicle-condition" 
                value={formData['vehicle-condition']} 
                onChange={handleChange} 
                required 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
              >
                <option value="">Select</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-2">Fuel Type</label>
              <select 
                name="vehicle-fuel-type" 
                value={formData['vehicle-fuel-type']} 
                onChange={handleChange} 
                required 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
              >
                <option value="">Select</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-gray-700 mb-2">Transmission</label>
              <select 
                name="vehicle-transmission" 
                value={formData['vehicle-transmission']} 
                onChange={handleChange} 
                required 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
              >
                <option value="">Select</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-2">Cost/day (₹)</label>
              <input 
                type="number" 
                name="rental-cost" 
                value={formData['rental-cost']} 
                onChange={handleChange} 
                required 
                min="0" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200" 
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-2">Driver Available</label>
            <select 
              name="driver-available" 
              value={formData['driver-available']} 
              onChange={handleChange} 
              required 
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div id="driver-rate-container" style={{ display: 'none' }}>
            <label className="block font-medium text-gray-700 mb-2">Driver Rate (₹/day)</label>
            <input 
              type="number" 
              name="driver-rate" 
              value={formData['driver-rate']} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200" 
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-70 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRental;