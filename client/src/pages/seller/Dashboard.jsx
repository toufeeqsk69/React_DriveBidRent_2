import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Recent chats removed from dashboard — keep chats on chat pages only
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-orange-600 mb-10">Welcome, Seller!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Auction Listings Card */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <h2 className="text-2xl font-semibold text-orange-600 mb-4">Auction Listings</h2>
            <p className="text-gray-600 mb-6">Manage your vehicles listed for auction.</p>
            <div className="space-y-3">
              <Link 
                to="/seller/add-auction" 
                className="block w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Add New Auction
              </Link>
              <Link 
                to="/seller/view-auctions" 
                className="block w-full bg-white text-orange-600 border border-orange-600 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors duration-200"
              >
                View Auctions
              </Link>
            </div>
          </div>

          {/* Rental Listings Card */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <h2 className="text-2xl font-semibold text-orange-600 mb-4">Rental Listings</h2>
            <p className="text-gray-600 mb-6">Manage your vehicles listed for rent.</p>
            <div className="space-y-3">
              <Link 
                to="/seller/add-rental" 
                className="block w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Add New Rental
              </Link>
              <Link 
                to="/seller/view-rentals" 
                className="block w-full bg-white text-orange-600 border border-orange-600 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors duration-200"
              >
                View Rentals
              </Link>
            </div>
          </div>

          {/* Earnings Card */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <h2 className="text-2xl font-semibold text-orange-600 mb-4">Earnings</h2>
            <p className="text-gray-600 mb-6">View your total earnings and analytics.</p>
            <Link 
              to="/seller/view-earnings" 
              className="block w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              View Earnings
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Chats removed: chats live on chat pages only */}
    </div>
  );
};

export default Dashboard;