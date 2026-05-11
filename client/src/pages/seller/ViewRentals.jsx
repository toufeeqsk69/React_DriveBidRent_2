// client/src/pages/seller/ViewRentals.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import useSellerRentals from '../../hooks/useSellerRentals';

const ViewRentals = () => {
  const { rentals, loading, error, loadRentals } = useSellerRentals();

  useEffect(() => {
    loadRentals();
  }, [loadRentals]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-orange-600 mb-10">Rental Vehicles</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center font-medium">
            {error}
          </div>
        )}

        {rentals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentals.map(rental => (
              <div key={rental._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <img 
                  src={rental.vehicleImage} 
                  alt={rental.vehicleName} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-orange-600 mb-2">
                    {rental.vehicleName}
                  </h3>
                  <p className="text-gray-600 text-sm">Cost/day: ₹{rental.costPerDay}</p>
                  <p className="text-gray-600 text-sm">Location: {rental.location}</p>
                  <div className="flex gap-2 mt-4">
                    <Link
                      to={`/seller/rental-details-alt/${rental._id}`}
                      className="flex-1 bg-orange-600 text-white text-center py-2 rounded-md text-sm hover:bg-orange-700 transition"
                    >
                      More Details
                    </Link>
                    <Link
                      to={`/seller/update-rental/${rental._id}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 rounded-md text-sm hover:bg-blue-700 transition"
                    >
                      Update
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white p-12 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Rentals Yet</h2>
            <p className="text-gray-600 mb-6">Add your first rental vehicle!</p>
            <Link
              to="/seller/add-rental"
              className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition"
            >
              Add Rental
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewRentals;