import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import useSellerAuctions from '../../hooks/useSellerAuctions';

const ViewAuctions = () => {
  const { auctions, loading, error, loadAuctions } = useSellerAuctions();
  const navigate = useNavigate();

  const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
  const formatDate = (d) =>
    d ? new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  // Helper to determine display tag for an auction
  const getAuctionTag = (auction) => {
    // If auction has been re-auctioned and auction ended, show "Auction completed"
    if (auction.isReauctioned && auction.auction_stopped) {
      return { text: 'Auction completed', color: 'bg-gray-100 text-gray-800' };
    }
    // If auction is currently being re-auctioned (ongoing or waiting), show "Re-auction"
    if (auction.isReauctioned) {
      return { text: 'Re-auction', color: 'bg-purple-100 text-purple-800' };
    }
    // Regular auction ended
    if (auction.auction_stopped || auction.started_auction === 'ended') {
      return { text: 'Auction completed', color: 'bg-gray-100 text-gray-800' };
    }
    // Regular auction ongoing (first time)
    if (auction.started_auction === 'yes') {
      return { text: 'Approved', color: 'bg-green-100 text-green-800' };
    }
    // Not started yet (approved but not started)
    if (auction.status === 'approved' || auction.status === 'assignedMechanic') {
      return { text: 'Pending Start', color: 'bg-yellow-100 text-yellow-800' };
    }
    // Default status based tags
    if (auction.status === 'pending') {
      return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
    }
    if (auction.status === 'rejected') {
      return { text: 'Rejected', color: 'bg-red-100 text-red-800' };
    }
    return { text: capitalize(auction.status), color: 'bg-gray-100 text-gray-800' };
  };

  useEffect(() => {
    loadAuctions();
  }, [loadAuctions]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-orange-600">My Auctions</h1>
          <Link 
            to="/seller/add-auction" 
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Add New Auction
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center font-medium">
            {error}
          </div>
        )}

        {auctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <div
                key={auction._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/seller/auction-details/${auction._id}`)}
              >
                <img
                  src={auction.mainImage || auction.vehicleImage || 'https://via.placeholder.com/600x400?text=No+Image'}
                  alt={auction.vehicleName}
                  className="w-full h-48 object-cover bg-gray-100"
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-800">
                      {capitalize(auction.vehicleName)}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getAuctionTag(auction).color}`}>
                      {getAuctionTag(auction).text}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year:</span>
                      <span className="font-medium text-gray-900">{auction.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Bid:</span>
                      <span className="font-bold text-orange-600">
                        ₹{auction.expectedBid?.toLocaleString('en-IN') || 'N/A'}
                      </span>
                    </div>
                    {auction.startingBid && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Auction Starting Bid:</span>
                        <span className="font-bold text-green-600">
                          ₹{auction.startingBid.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Auction Date:</span>
                      <span className="font-medium text-gray-900">{formatDate(auction.auctionDate)}</span>
                    </div>
                    {auction.assignedMechanic && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mechanic:</span>
                        <span className="font-medium text-gray-900">
                          {auction.assignedMechanic.firstName} {auction.assignedMechanic.lastName}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/seller/auction-details/${auction._id}`);
                      }}
                      className="flex-1 bg-orange-600 text-white text-center py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200"
                    >
                      View Details
                    </button>
                    {(auction.status === 'approved' || auction.status === 'assignedMechanic') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/seller/view-bids/${auction._id}`);
                        }}
                        className="flex-1 bg-green-600 text-white text-center py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
                      >
                        View Bids
                      </button>
                    )}
                  </div>
                  
                  {auction.status === 'rejected' && auction.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Rejection Reason
                      </p>
                      <p className="text-sm text-red-700 line-clamp-2">
                        {auction.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Auctions Yet</h2>
              <p className="text-gray-600 mb-6">Start by adding your first vehicle for auction!</p>
              <Link
                to="/seller/add-auction"
                className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Add Your First Auction
              </Link>
            </div>
          </div>
        )}

        {/* Stats Section */}
        {auctions.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{auctions.length}</div>
              <div className="text-gray-600 text-sm">Total Auctions</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {auctions.filter(a => a.status === 'approved' || a.started_auction === 'yes' || a.started_auction === 'ended').length}
              </div>
              <div className="text-gray-600 text-sm">Approved</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {auctions.filter(a => a.status === 'pending').length}
              </div>
              <div className="text-gray-600 text-sm">Pending</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {auctions.filter(a => a.status === 'assignedMechanic').length}
              </div>
              <div className="text-gray-600 text-sm">In Progress</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {auctions.filter(a => a.status === 'rejected').length}
              </div>
              <div className="text-gray-600 text-sm">Rejected</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAuctions;