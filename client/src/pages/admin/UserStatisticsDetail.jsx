import React from 'react';

const UserStatisticsDetail = ({ userType, statistics, expandedSections, toggleSection }) => {
  if (!statistics) return null;

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
  };

  // Seller Statistics Component
  if (userType === 'seller') {
    return (
      <div className="mt-6 pt-6 border-t-2 border-orange-500">
        <h3 className="text-xl font-bold text-orange-500 mb-4">Statistics</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Auction Activity */}
          <div className="bg-white border-2 border-blue-200 rounded-lg shadow-sm">
            <div className="p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Auction Activity</h4>
              <p className="text-sm text-gray-700"><strong>Total Cars Listed:</strong> {statistics.totalAuctionsListed}</p>
              <p className="text-sm text-gray-700"><strong>Cars Sold:</strong> {statistics.carsSold}</p>
              <p className="text-sm text-gray-700"><strong>Active Auctions:</strong> {statistics.activeAuctions}</p>
              <p className="text-sm text-gray-700 mt-2"><strong className="text-green-700">Earnings:</strong> ₹{statistics.auctionEarnings.toLocaleString()}</p>
              
              {statistics.auctionsList?.length > 0 && (
                <button
                  onClick={() => toggleSection('auctions')}
                  className="w-full mt-3 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium transition flex items-center justify-center gap-1"
                >
                  {expandedSections.auctions ? <><i className="fas fa-chevron-up"></i> Hide</> : <><i className="fas fa-chevron-down"></i> Auctions List</>}
                </button>
              )}

              {statistics.soldCarsList?.length > 0 && (
                <button
                  onClick={() => toggleSection('soldCars')}
                  className="w-full mt-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded text-xs font-medium transition flex items-center justify-center gap-1"
                >
                  {expandedSections.soldCars ? <><i className="fas fa-chevron-up"></i> Hide</> : <><i className="fas fa-chevron-down"></i> Sold Cars</>}
                </button>
              )}
            </div>
            {expandedSections.auctions && statistics.auctionsList?.length > 0 && (
              <div className="border-t border-blue-200 bg-blue-50/50 max-h-48 overflow-y-auto">
                {statistics.auctionsList.map((car, idx) => (
                  <div key={idx} className="px-4 py-2 border-b border-blue-100 last:border-b-0 text-xs hover:bg-blue-100/50 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{car.vehicleName} ({car.year})</p>
                        <p className="text-gray-600">₹{car.startingBid?.toLocaleString()} • {car.mileage?.toLocaleString()} km</p>
                        <p className="text-gray-500 mt-0.5">Added: {formatDate(car.createdAt)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        car.started_auction === 'yes' ? 'bg-green-100 text-green-800 animate-pulse' :
                        car.started_auction === 'ended' ? 'bg-gray-100 text-gray-800' :
                        car.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {car.started_auction === 'yes' ? 'LIVE' :
                         car.started_auction === 'ended' ? 'Ended' :
                         car.status === 'approved' ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {expandedSections.soldCars && statistics.soldCarsList?.length > 0 && (
              <div className="border-t border-green-200 bg-green-50/50 max-h-48 overflow-y-auto">
                {statistics.soldCarsList.map((car, idx) => (
                  <div key={idx} className="px-4 py-2 border-b border-green-100 last:border-b-0 text-xs hover:bg-green-100/50 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{car.vehicleName} ({car.year})</p>
                        <p className="text-green-700 font-medium">Sold: ₹{car.finalPurchasePrice?.toLocaleString()}</p>
                        {car.winnerId && (
                          <p className="text-gray-600 mt-0.5">
                            <i className="fas fa-trophy text-yellow-600 text-xs"></i> {car.winnerId.firstName} {car.winnerId.lastName}
                          </p>
                        )}
                        <p className="text-gray-500 text-xs mt-0.5">Sold on: {formatDate(car.createdAt)}</p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                        Sold
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rental Activity */}
          <div className="bg-white border-2 border-purple-200 rounded-lg shadow-sm">
            <div className="p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Rental Activity</h4>
              <p className="text-sm text-gray-700"><strong>Total Listings:</strong> {statistics.totalRentalListings}</p>
              <p className="text-sm text-gray-700"><strong>Active Rentals:</strong> {statistics.activeRentals}</p>
              <p className="text-sm text-gray-700 mt-2"><strong className="text-green-700">Earnings:</strong> ₹{statistics.rentalEarnings.toLocaleString()}</p>
              
              {statistics.rentalsList?.length > 0 && (
                <button
                  onClick={() => toggleSection('rentals')}
                  className="w-full mt-3 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-medium transition flex items-center justify-center gap-1"
                >
                  {expandedSections.rentals ? <><i className="fas fa-chevron-up"></i> Hide</> : <><i className="fas fa-chevron-down"></i> Details</>}
                </button>
              )}
            </div>
            {expandedSections.rentals && statistics.rentalsList?.length > 0 && (
              <div className="border-t border-purple-200 bg-purple-50/50 max-h-48 overflow-y-auto">
                {statistics.rentalsList.map((car, idx) => (
                  <div key={idx} className="px-4 py-2 border-b border-purple-100 last:border-b-0 text-xs hover:bg-purple-100/50 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{car.vehicleName} ({car.year})</p>
                        <p className="text-gray-600">₹{car.costPerDay}/day</p>
                        {car.buyerId && (
                          <p className="text-gray-500 mt-0.5">Renter: {car.buyerId.firstName} {car.buyerId.lastName}</p>
                        )}
                        {car.pickupDate && car.dropDate && (
                          <p className="text-gray-500 text-xs mt-0.5">
                            {formatDate(car.pickupDate)} - {formatDate(car.dropDate)}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        car.status === 'unavailable' ? 'bg-orange-100 text-orange-800 animate-pulse' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {car.status === 'unavailable' ? 'RENTED' : 'Available'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total Earnings */}
          <div className="bg-gradient-to-br from-green-500 to-green-700 p-4 rounded-lg text-white">
            <h4 className="font-semibold mb-2">Total Earnings</h4>
            <p className="text-3xl font-bold">₹{statistics.totalEarnings.toLocaleString()}</p>
          </div>
        </div>
      </div>
    );
  }

  // Mechanic Statistics Component
  if (userType === 'mechanic') {
    return (
      <div className="mt-6 pt-6 border-t-2 border-orange-500">
        <h3 className="text-xl font-bold text-orange-500 mb-4">Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Assigned Cars */}
          <div className="bg-white border-2 border-blue-200 rounded-lg shadow-sm">
            <div className="p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Cars Assigned</h4>
              <p className="text-2xl font-bold text-blue-700 mb-2">{statistics.carsAssigned}</p>
              <p className="text-sm text-gray-700"><strong>Inspected:</strong> {statistics.carsInspected}</p>
              <p className="text-sm text-gray-700"><strong>Pending:</strong> {statistics.carsAssigned - statistics.carsInspected}</p>
              
              {statistics.assignedCarsList?.length > 0 && (
                <button
                  onClick={() => toggleSection('assigned')}
                  className="w-full mt-3 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium transition flex items-center justify-center gap-1"
                >
                  {expandedSections.assigned ? <><i className="fas fa-chevron-up"></i> Hide</> : <><i className="fas fa-chevron-down"></i> View All</>}
                </button>
              )}
            </div>
            {expandedSections.assigned && statistics.assignedCarsList?.length > 0 && (
              <div className="border-t border-blue-200 bg-blue-50/50 max-h-60 overflow-y-auto">
                {statistics.assignedCarsList.map((car, idx) => (
                  <div key={idx} className="px-4 py-2 border-b border-blue-100 last:border-b-0 text-xs hover:bg-blue-100/50 transition">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{car.vehicleName} ({car.year})</p>
                        <p className="text-gray-600">{car.mileage?.toLocaleString()} km</p>
                        {car.sellerId && <p className="text-gray-500 mt-0.5">Seller: {car.sellerId.firstName} {car.sellerId.lastName}</p>}
                        <p className="text-gray-500 text-xs mt-0.5">Assigned: {formatDate(car.createdAt)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                        car.reviewStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                        'bg-yellow-100 text-yellow-800 animate-pulse'
                      }`}>
                        {car.reviewStatus === 'completed' ? 'Done' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inspected Cars */}
          <div className="bg-white border-2 border-green-200 rounded-lg shadow-sm">
            <div className="p-4">
              <h4 className="font-semibold text-green-900 mb-2">Completed Inspections</h4>
              <p className="text-2xl font-bold text-green-700 mb-2">{statistics.carsInspected}</p>
              <p className="text-sm text-gray-700">Reviews submitted</p>
              
              {statistics.inspectedCarsList?.length > 0 && (
                <button
                  onClick={() => toggleSection('inspected')}
                  className="w-full mt-3 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded text-xs font-medium transition flex items-center justify-center gap-1"
                >
                  {expandedSections.inspected ? <><i className="fas fa-chevron-up"></i> Hide</> : <><i className="fas fa-chevron-down"></i> View All</>}
                </button>
              )}
            </div>
            {expandedSections.inspected && statistics.inspectedCarsList?.length > 0 && (
              <div className="border-t border-green-200 bg-green-50/50 max-h-60 overflow-y-auto">
                {statistics.inspectedCarsList.map((car, idx) => (
                  <div key={idx} className="px-4 py-2 border-b border-green-100 last:border-b-0 text-xs hover:bg-green-100/50 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{car.vehicleName} ({car.year})</p>
                        <p className="text-gray-600">{car.mileage?.toLocaleString()} km</p>
                        {(car.multipointInspection?.overallRating || car.mechanicReview?.conditionRating) && (
                          <p className="text-green-700 font-medium mt-0.5">Rating: {car.multipointInspection?.overallRating ? `${car.multipointInspection.overallRating}/10` : car.mechanicReview.conditionRating}</p>
                        )}
                        {car.sellerId && <p className="text-gray-500 text-xs mt-0.5">Seller: {car.sellerId.firstName} {car.sellerId.lastName}</p>}
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                        Inspected
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Buyer Statistics Component
  if (userType === 'buyer') {
    return (
      <div className="mt-6 pt-6 border-t-2 border-orange-500">
        <h3 className="text-xl font-bold text-orange-500 mb-4">Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Auction Activity */}
          <div className="bg-white border-2 border-blue-200 rounded-lg shadow-sm">
            <div className="p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Auction Activity</h4>
              <p className="text-sm text-gray-700"><strong>Participated:</strong> {statistics.auctionsParticipated}</p>
              <p className="text-sm text-gray-700"><strong>Won:</strong> {statistics.auctionsWon}</p>
              <p className="text-sm text-gray-700"><strong>Purchased:</strong> {statistics.carsPurchased}</p>
              
              {statistics.wonAuctionsList?.length > 0 && (
                <button
                  onClick={() => toggleSection('wonAuctions')}
                  className="w-full mt-3 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium transition flex items-center justify-center gap-1"
                >
                  {expandedSections.wonAuctions ? <><i className="fas fa-chevron-up"></i> Hide</> : <><i className="fas fa-chevron-down"></i> Won Cars</>}
                </button>
              )}
            </div>
            {expandedSections.wonAuctions && statistics.wonAuctionsList?.length > 0 && (
              <div className="border-t border-blue-200 bg-blue-50/50 max-h-60 overflow-y-auto">
                {statistics.wonAuctionsList.map((car, idx) => (
                  <div key={idx} className="px-4 py-2 border-b border-blue-100 last:border-b-0 text-xs hover:bg-blue-100/50 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{car.vehicleName} ({car.year})</p>
                        <p className="text-green-700 font-medium">Won at: ₹{car.finalPurchasePrice?.toLocaleString()}</p>
                        {car.sellerId && <p className="text-gray-500 mt-0.5">Seller: {car.sellerId.firstName} {car.sellerId.lastName}</p>}
                        <p className="text-gray-500 text-xs mt-0.5">Won on: {formatDate(car.createdAt)}</p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 whitespace-nowrap">
                        Won
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rental Activity */}
          <div className="bg-white border-2 border-purple-200 rounded-lg shadow-sm">
            <div className="p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Rental Activity</h4>
              <p className="text-sm text-gray-700"><strong>Total Rentals:</strong> {statistics.totalRentals}</p>
              <p className="text-sm text-gray-700"><strong>Active Rentals:</strong> {statistics.activeRentals}</p>
              
              {statistics.rentalsList?.length > 0 && (
                <button
                  onClick={() => toggleSection('rentals')}
                  className="w-full mt-3 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-medium transition flex items-center justify-center gap-1"
                >
                  {expandedSections.rentals ? <><i className="fas fa-chevron-up"></i> Hide</> : <><i className="fas fa-chevron-down"></i> Details</>}
                </button>
              )}
            </div>
            {expandedSections.rentals && statistics.rentalsList?.length > 0 && (
              <div className="border-t border-purple-200 bg-purple-50/50 max-h-60 overflow-y-auto">
                {statistics.rentalsList.map((car, idx) => (
                  <div key={idx} className="px-4 py-2 border-b border-purple-100 last:border-b-0 text-xs hover:bg-purple-100/50 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{car.vehicleName} ({car.year})</p>
                        <p className="text-gray-600">₹{car.costPerDay}/day</p>
                        {car.pickupDate && (
                          <p className="text-gray-500 text-xs mt-0.5">
                            From: {formatDate(car.pickupDate)}
                            {car.dropDate && ` to ${formatDate(car.dropDate)}`}
                          </p>
                        )}
                        {car.sellerId && <p className="text-gray-500 text-xs mt-0.5">Owner: {car.sellerId.firstName} {car.sellerId.lastName}</p>}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        car.status === 'unavailable' ? 'bg-orange-100 text-orange-800 animate-pulse' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {car.status === 'unavailable' ? 'Active' : 'Returned'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Auction Manager Statistics Component
  if (userType === 'auction_manager') {
    return (
      <div className="mt-6 pt-6 border-t-2 border-orange-500">
        <h3 className="text-xl font-bold text-orange-500 mb-4">Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border-2 border-blue-200 rounded-lg shadow-sm">
            <div className="p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Cars Accepted</h4>
              <p className="text-2xl font-bold text-blue-700 mb-2">{statistics.carsAccepted}</p>
              <p className="text-sm text-gray-700">Total requests approved</p>
            </div>
          </div>
          
          <div className="bg-white border-2 border-green-200 rounded-lg shadow-sm">
            <div className="p-4">
              <h4 className="font-semibold text-green-900 mb-2">Cars Auctioned</h4>
              <p className="text-2xl font-bold text-green-700 mb-2">{statistics.carsAuctioned}</p>
              <p className="text-sm text-gray-700">Started or completed</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default UserStatisticsDetail;
