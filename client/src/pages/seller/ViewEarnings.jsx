import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance.util';
import LoadingSpinner from '../components/LoadingSpinner';

const ViewEarnings = () => {
  const [totalAuctionEarnings, setTotalAuctionEarnings] = useState(0);
  const [totalRentalEarnings, setTotalRentalEarnings] = useState(0);
  const [recentEarnings, setRecentEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await axiosInstance.get('/seller/view-earnings');
        if (response.data.success) {
          const data = response.data.data;
          setTotalAuctionEarnings(data.totalAuctionEarnings || 0);
          setTotalRentalEarnings(data.totalRentalEarnings || 0);
          setRecentEarnings(data.recentEarnings || []);
        } else {
          setError(response.data.message || 'Failed to load earnings data');
        }
      } catch (err) {
        setError('Failed to load earnings. Please try again.');
        console.error('Error fetching earnings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 max-w-md">{error}</div>
        </div>
      </div>
    );
  }

  const totalEarnings = totalAuctionEarnings + totalRentalEarnings;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-orange-600 mb-10">Your Earnings</h1>

        {/* Total Earnings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6 text-center">
            <h2 className="text-2xl font-semibold mb-2">Total Auction Earnings</h2>
            <p className="text-3xl font-bold">₹{totalAuctionEarnings.toLocaleString('en-IN')}</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6 text-center">
            <h2 className="text-2xl font-semibold mb-2">Total Rental Earnings</h2>
            <p className="text-3xl font-bold">₹{totalRentalEarnings.toLocaleString('en-IN')}</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 text-center">
            <h2 className="text-2xl font-semibold mb-2">Total Earnings</h2>
            <p className="text-3xl font-bold">₹{totalEarnings.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Recent Earnings Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recent Earnings</h2>
          
          {recentEarnings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentEarnings.map((earning, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-medium">{earning.description || 'Earning'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-green-600 font-bold text-lg">
                          ₹{(earning.amount || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {earning.createdAt ? new Date(earning.createdAt).toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                          earning.type === 'auction' ? 'bg-orange-100 text-orange-800' :
                          earning.type === 'rental' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {earning.type || 'earning'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">No recent earnings available.</p>
              <p className="text-gray-500 mt-2">Your earnings will appear here once you start making sales.</p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Earnings Information</h3>
          <ul className="text-yellow-700 space-y-1">
            <li>• Auction earnings are updated when auctions are successfully completed</li>
            <li>• Rental earnings are calculated based on completed rental periods</li>
            <li>• All amounts are in Indian Rupees (₹)</li>
            <li>• Recent earnings show the last 10 transactions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ViewEarnings;