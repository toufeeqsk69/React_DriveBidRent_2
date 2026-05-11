import React from 'react';

const TrophyIcon = ({ className = 'w-3 h-3' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M8 2h8v2h1a1 1 0 011 1v2a4 4 0 01-4 4H7a4 4 0 01-4-4V5a1 1 0 011-1h1V2z" fill="currentColor" />
    <path d="M5 16a3 3 0 013-3h8a3 3 0 013 3v1a3 3 0 01-3 3H8a3 3 0 01-3-3v-1z" fill="currentColor" />
  </svg>
);

export default function ChatListItem({ chat, onClick, isSelected, viewerIsBuyer = false, currentUserId = null }) {
  // Determine image using chat.car images first, fallback to legacy fields
  const imgSrc = chat.car?.images?.[0] || chat.rentalRequest?.vehiclePhotos?.[0] || chat.rentalRequest?.vehicleImage || chat.auctionRequest?.vehicleImage || chat.auctionRequest?.vehiclePhotos?.[0] || '/placeholder-car.jpg';

  // Build car title from car object when available, else fallback
  const carName = chat.car ? `${chat.car.make || ''} ${chat.car.model || ''} ${chat.car.year || ''}`.trim() : (chat.title || chat.rentalRequest?.vehicleName || chat.auctionRequest?.vehicleName || 'Vehicle');

  // Determine which participant to show as username (always visible)
  const showSeller = String(currentUserId) === String(chat.buyer?.id || chat.buyer || '') || viewerIsBuyer;
  const username = showSeller ? (chat.seller?.name || chat.seller?.username || chat.seller?.fullName || 'Seller') : (chat.buyer?.name || chat.buyer?.username || chat.buyer?.fullName || 'Buyer');

  const date = new Date(chat.lastMessageAt || chat.createdAt || Date.now()).toLocaleDateString('en-GB');

  const isAuction = chat?.type === 'auction';
  const isRental = chat?.type === 'rental';

  // Compare current user to chat.buyer to determine buyer-vs-seller for badge rules
  const isCurrentUserBuyer = String(currentUserId) === String(chat.buyer?.id || chat.buyer || '');

  // Special rendering for inspection chats (show car image + auctionManager/mechanic info)
  if (chat?.type === 'inspection') {
    const isCurrentUserMechanic = String(currentUserId) === String((chat.mechanic && (chat.mechanic._id || chat.mechanic)) || '');
    return (
      <div
        onClick={() => onClick && onClick(chat._id)}
        className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-all cursor-pointer border-b border-gray-100 ${isSelected ? 'bg-orange-50' : ''}`}
      >
        <img 
          src={chat.inspectionTask?.vehicleImage || '/placeholder-car.jpg'} 
          alt="car"
          className="w-14 h-14 rounded-full object-cover border-2 border-orange-500"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">
            {chat.inspectionTask?.vehicleName || 'Vehicle Inspection'}
          </h3>
          <p className="text-sm text-gray-600">
            {isCurrentUserMechanic
              ? chat.auctionManager && `${chat.auctionManager.firstName} ${chat.auctionManager.lastName || ''}`
              : chat.mechanic && `${chat.mechanic.firstName} ${chat.mechanic.lastName || ''}`
            }
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500">
            {new Date(chat.lastMessageAt || chat.createdAt).toLocaleDateString('en-GB')}
          </span>
          <div className="mt-1">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
              isCurrentUserMechanic ? 'bg-orange-500 text-white' : 'bg-indigo-600 text-white'
            }`}>
              {isCurrentUserMechanic ? 'INSPECTION' : 'MECHANIC'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick && onClick(chat._id)}
      className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-all cursor-pointer border-b border-gray-100 ${isSelected ? 'bg-orange-50' : ''}`}
    >
      {/* Car Image */}
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-gray-300">
        <img
          src={imgSrc}
          alt="car"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0">
        {/* Car Name */}
        <h3 className="font-semibold text-gray-900 truncate text-base">
          {carName}
        </h3>

        {/* Username */}
        <p className="text-sm text-gray-600 mt-0.5">
          {username}
        </p>
      </div>

      {/* Right Side: Badge + Date */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        {/* Date */}
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {date}
        </span>

        {/* Role Badge */}
        {isAuction ? (
          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
            isCurrentUserBuyer
              ? 'bg-yellow-400 text-black'    // Buyer: YOU WON
              : 'bg-yellow-400 text-black'    // Seller: WINNER
          }`}>
            <TrophyIcon className="w-3 h-3" />
            {isCurrentUserBuyer ? 'YOU WON' : 'WINNER'}
          </span>
        ) : isRental ? (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            isCurrentUserBuyer
              ? 'bg-green-500 text-white'     // Buyer: RENTER (green)
              : 'bg-purple-600 text-white'    // Seller: RENTER (purple)
          }`}>
            RENTER
          </span>
        ) : null}
      </div>
    </div>
  );
}
