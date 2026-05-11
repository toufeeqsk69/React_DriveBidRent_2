import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.util';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CompletedAuctionDetails() {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompletedAuctionDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCompletedAuctionDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/buyer/auctions/${id}/completed`);
      if (response.data.success) {
        setAuction(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load auction details');
      }
    } catch (err) {
      console.error('Error fetching completed auction details:', err);
      setError(err.response?.data?.message || 'Failed to load auction details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error || !auction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-2xl p-10 text-center border border-red-200">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-xl text-gray-700 mb-8">{error}</p>
            <Link
              to="/buyer/auctions"
              className="px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition inline-block"
            >
              Back to Auctions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { auction: auctionData, seller, winner, finalPrice, purchaseDate, bidHistory, mechanicReview: _mechanicReview } = auction;

  // Safety checks
  if (!auctionData || !seller || !winner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-2xl p-10 text-center border border-red-200">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-xl text-gray-700 mb-8">Unable to load complete auction details. Some required data is missing.</p>
            <Link
              to="/buyer/auctions"
              className="px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition inline-block"
            >
              Back to Auctions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      {/* Header with status badge */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <Link
            to="/buyer/auctions"
            className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
          >
            ← Back to Auctions
          </Link>
          <div className="bg-green-100 border-2 border-green-600 text-green-800 px-6 py-3 rounded-lg font-bold text-lg">
            ✓ Auction Completed
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section with Image */}
        <div className="relative h-96 md:h-[450px] bg-cover bg-center bg-no-repeat rounded-3xl overflow-hidden shadow-2xl mb-12"
          style={{
            backgroundImage: `url(${auctionData.vehicleImage})`,
            backgroundColor: '#1a1a1a'
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 flex items-center justify-center h-full px-6">
            <div className="text-center max-w-4xl">
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">
                {auctionData.vehicleName}
              </h1>
              <div className="inline-block bg-white/20 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/30">
                <p className="text-3xl font-bold text-white">
                  Final Price: <span className="text-orange-300">₹{finalPrice.toLocaleString('en-IN')}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Auction Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Car Details Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-10 border border-orange-100">
              <h2 className="text-4xl font-bold text-orange-600 mb-8">Vehicle Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-gray-600 font-semibold text-sm uppercase tracking-wide">Year</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{auctionData.year}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold text-sm uppercase tracking-wide">Mileage</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{auctionData.mileage.toLocaleString()} km</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold text-sm uppercase tracking-wide">Condition</p>
                    <p className="text-2xl font-bold text-green-600 capitalize mt-2">{auctionData.condition}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-gray-600 font-semibold text-sm uppercase tracking-wide">Fuel Type</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{auctionData.fuelType}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold text-sm uppercase tracking-wide">Transmission</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2 capitalize">{auctionData.transmission}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold text-sm uppercase tracking-wide">Starting Bid</p>
                    <p className="text-2xl font-bold text-orange-600 mt-2">₹{auctionData.startingBid.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Auction Timeline */}
            <div className="bg-white rounded-3xl shadow-2xl p-10 border border-orange-100">
              <h2 className="text-4xl font-bold text-orange-600 mb-8">Auction Timeline</h2>
              
              <div className="space-y-6">
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 border-2 border-green-600">
                    <span className="text-2xl">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-600 font-semibold">Purchase Completed</p>
                    <p className="text-xl font-bold text-green-600">
                      {new Date(purchaseDate).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>


          </div>

          {/* Right Column - Seller & Winner Info */}
          <div className="space-y-8">
            {/* Winner Card - Simplified */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-2xl p-8 border-2 border-green-600">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-green-800">Winning Buyer</h3>
              </div>
              
              <div className="space-y-5 border-t-2 border-green-200 pt-6">
                <div>
                  <p className="text-green-700 font-semibold text-sm">Winner Name</p>
                  <p className="text-2xl font-bold text-gray-800">{winner.firstName} {winner.lastName}</p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-green-300">
                  <p className="text-gray-600 font-semibold text-sm">Final Winning Bid</p>
                  <p className="text-4xl font-black text-green-600 mt-3">₹{finalPrice.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Seller Card */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl shadow-2xl p-8 border-2 border-blue-600">
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">🚗</div>
                <h3 className="text-3xl font-bold text-blue-800">Seller Information</h3>
              </div>
              
              <div className="space-y-5 border-t-2 border-blue-200 pt-6">
                <div>
                  <p className="text-blue-700 font-semibold text-sm">Name</p>
                  <p className="text-xl font-bold text-gray-800">{seller.firstName} {seller.lastName}</p>
                </div>
                
                <div>
                  <p className="text-blue-700 font-semibold text-sm">Email</p>
                  <p className="text-lg text-gray-800 break-words">{seller.email}</p>
                </div>
                
                <div>
                  <p className="text-blue-700 font-semibold text-sm">Phone</p>
                  <p className="text-lg text-gray-800">{seller.phone}</p>
                </div>
                
                <div>
                  <p className="text-blue-700 font-semibold text-sm">Address</p>
                  <p className="text-sm text-gray-800">{seller.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final Bid Details */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 border border-orange-100 mb-12">
          <h2 className="text-4xl font-bold text-orange-600 mb-8">Final Bid Details</h2>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-8 border-2 border-orange-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-orange-700 font-semibold text-sm uppercase tracking-wide mb-2">Final Bid Amount</p>
                  <p className="text-4xl font-black text-orange-600">₹{finalPrice.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-orange-700 font-semibold text-sm uppercase tracking-wide mb-2">Total Bids Placed</p>
                  <p className="text-4xl font-black text-blue-600">{bidHistory?.length || 0}</p>
                </div>
                <div>
                  <p className="text-orange-700 font-semibold text-sm uppercase tracking-wide mb-2">Final Bid Time</p>
                  <p className="text-lg font-bold text-gray-800">
                    {new Date(purchaseDate).toLocaleDateString('en-IN')} <br />
                    {new Date(purchaseDate).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
