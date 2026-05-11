import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useSellerAuctions from '../../hooks/useSellerAuctions';

const AuctionDetails = () => {
  const { id } = useParams();
  const { currentAuction: auction, loading, error, loadAuctionById } = useSellerAuctions();

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'Not specified';
  const _formatDateTime = (date) => date ? new Date(date).toLocaleString() : 'Not specified';

  useEffect(() => {
    loadAuctionById(id);
  }, [id, loadAuctionById]);

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>
        <Link to="/seller/view-auctions" className="text-orange-600 hover:text-orange-700 font-medium">
          &larr; Back to All Auctions
        </Link>
      </div>
    </div>
  );

  if (loading || !auction) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-xl text-gray-600">Loading...</div>
    </div>
  );

  const isAuctionEnded = auction.started_auction === 'ended' || auction.auction_stopped;
  const hasWinner = auction.winnerId && isAuctionEnded;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Link to="/seller/view-auctions" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6 font-medium">
          &larr; Back to All Auctions
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rejection Banner */}
          {auction.status === 'rejected' && auction.rejectionReason && (
            <div className="lg:col-span-3 bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl shadow-sm mb-2">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-bold text-red-800">Vehicle Application Rejected</h3>
                  <div className="mt-2 text-sm text-red-700 font-medium">
                    <p>{auction.rejectionReason}</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-red-600">If you have addressed these issues, you may submit a new vehicle request.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Car Image Component */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img
                src={auction.mainImage || auction.vehicleImage || 'https://via.placeholder.com/800x500?text=No+Image'}
                alt={auction.vehicleName || 'Vehicle image'}
                className="w-full h-96 object-cover bg-gray-100"
              />
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{auction.vehicleName || 'Unnamed Vehicle'}</h1>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 font-medium">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${auction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      auction.status === 'approved' ? 'bg-green-100 text-green-800' :
                        auction.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          auction.status === 'assignedMechanic' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {capitalize(auction.status || 'pending')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Car Details Component */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Vehicle Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Year:</span>
                  <span className="text-gray-900 font-semibold">{auction.year || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Mileage:</span>
                  <span className="text-gray-900 font-semibold">{auction.mileage ? `${auction.mileage.toLocaleString()} km` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Fuel Type:</span>
                  <span className="text-gray-900 font-semibold">{capitalize(auction.fuelType || 'N/A')}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Transmission:</span>
                  <span className="text-gray-900 font-semibold">{capitalize(auction.transmission || 'N/A')}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="font-medium text-gray-700">Condition:</span>
                  <span className="text-gray-900 font-semibold">{capitalize(auction.condition || 'N/A')}</span>
                </div>
              </div>
              
            </div>
          </div>

          {/* Auction Details Component */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Auction Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-600 font-medium">Auction Date</span>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(auction.auctionDate)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-medium">Expected Bid</span>
                    <p className="text-2xl font-bold text-orange-600">
                      ₹{auction.expectedBid ? auction.expectedBid.toLocaleString('en-IN') : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Amount you expected to receive</p>
                  </div>
                  {auction.startingBid && (
                    <div>
                      <span className="text-sm text-gray-600 font-medium">Auction Starting Bid</span>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{auction.startingBid.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Minimum bid set by Auction Manager</p>
                    </div>
                  )}
                  {auction.started_auction !== 'no' && (
                    <div>
                      <span className="text-sm text-gray-600 font-medium">Auction Status</span>
                      <p className={`text-lg font-semibold ${auction.started_auction === 'yes' ? 'text-green-600' : 'text-blue-600'
                        }`}>
                        {auction.started_auction === 'yes' ? 'Active' : 'Ended'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {auction.currentBid && (
                    <>
                      <div>
                        <span className="text-sm text-gray-600 font-medium">Current Highest Bid</span>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{auction.currentBid.bidAmount ? auction.currentBid.bidAmount.toLocaleString('en-IN') : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 font-medium">Current Bidder</span>
                        <p className="text-lg font-semibold text-gray-900">
                          {auction.currentBid.buyerId?.firstName} {auction.currentBid.buyerId?.lastName}
                        </p>
                      </div>
                    </>
                  )}
                  {!auction.currentBid && auction.started_auction !== 'no' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 font-medium">No bids placed yet</p>
                    </div>
                  )}
                </div>
              </div>

              {(auction.status === 'approved' || auction.status === 'assignedMechanic') && auction.started_auction !== 'no' && (
                <Link
                  to={`/seller/view-bids/${auction._id}`}
                  className="inline-block mt-6 bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  View All Bids
                </Link>
              )}
            </div>
          </div>

          {/* Buyer Details Component (if auction completed) */}
          {hasWinner && (
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-lg p-6 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-green-800">Auction Winner</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-600 font-medium">Winner Name</span>
                    <p className="text-lg font-semibold text-gray-900">
                      {auction.winnerId?.firstName} {auction.winnerId?.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-medium">Email</span>
                    <p className="text-gray-900">{auction.winnerId?.email || 'N/A'}</p>
                  </div>
                  {auction.winnerId?.phone && (
                    <div>
                      <span className="text-sm text-gray-600 font-medium">Phone</span>
                      <p className="text-gray-900">{auction.winnerId.phone}</p>
                    </div>
                  )}
                  <div className="pt-4 border-t border-green-200">
                    <span className="text-sm text-gray-600 font-medium">Final Purchase Price</span>
                    <p className="text-2xl font-bold text-green-700">
                      ₹{auction.finalPurchasePrice ? auction.finalPurchasePrice.toLocaleString('en-IN') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mechanic Details Component (if mechanic assigned) */}
          {auction.status === 'assignedMechanic' && auction.assignedMechanic && (
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-blue-800">Assigned Mechanic</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-600 font-medium">Mechanic Name</span>
                    <p className="text-lg font-semibold text-gray-900">
                      {auction.assignedMechanic?.firstName} {auction.assignedMechanic?.lastName}
                    </p>
                  </div>
                  {auction.assignedMechanic?.phone && (
                    <div>
                      <span className="text-sm text-gray-600 font-medium">Phone</span>
                      <p className="text-gray-900 font-semibold">{auction.assignedMechanic.phone}</p>
                    </div>
                  )}
                  {auction.assignedMechanic?.shopName && (
                    <div>
                      <span className="text-sm text-gray-600 font-medium">Shop Name</span>
                      <p className="text-gray-900 font-semibold">{auction.assignedMechanic.shopName}</p>
                    </div>
                  )}
                </div>
                {auction.chatId && auction.reviewStatus !== 'completed' && (
                  <div className="mt-6 pt-6 border-t border-blue-200">
                    <Link
                      to={`/seller/inspection-chats/${auction.chatId}`}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      CHAT & SCHEDULE INSPECTION
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;