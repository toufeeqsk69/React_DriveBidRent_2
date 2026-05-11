import React, { useState } from 'react';

const RentalChatHeader = ({ chat, otherUser, carName, rentalPeriod, onDeleteChat }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const getUserName = () => {
    console.log('=== RENTAL USER NAME DEBUG ===');
    console.log('otherUser:', otherUser);
    
    if (!otherUser) {
      console.log('No other user in rental chat');
      return 'User';
    }
    
    // Try multiple name field combinations
    const firstName = otherUser.firstName || otherUser.first_name || otherUser.fname || '';
    const lastName = otherUser.lastName || otherUser.last_name || otherUser.lname || '';
    
    const fullName = `${firstName} ${lastName}`.trim();
    
    const name = fullName || 
                 otherUser.name || 
                 otherUser.username || 
                 otherUser.displayName ||
                 otherUser.email?.split('@')[0] || 
                 'User';
    
    console.log('Rental user name result:', name);
    return name;
  };

  const getCarImage = () => {
    console.log('=== CAR IMAGE DEBUG ===');
    console.log('chat.rentalRequest:', chat?.rentalRequest);
    console.log('chat.auctionRequest:', chat?.auctionRequest);
    
    // Try multiple possible image paths for rental or auction chat
    const imagePaths = [
      chat?.rentalRequest?.vehicleImage,
      chat?.rentalRequest?.carImage,
      chat?.rentalRequest?.image,
      chat?.rentalRequest?.vehicleImages?.[0],
      chat?.auctionRequest?.vehicleImage,
      chat?.auctionRequest?.carImage,
      chat?.auctionRequest?.image,
      chat?.auctionRequest?.vehicleImages?.[0],
      chat?.vehicleImage,
      chat?.carImage,
      chat?.image
    ];
    
    console.log('Image paths available:', imagePaths.filter(Boolean));
    
    const image = imagePaths.find(img => img && img !== null && img !== 'null' && img !== '');
    console.log('Selected image:', image);
    
    const placeholderText = chat?.type === 'auction' ? 'Auction+Vehicle' : 'Rental+Vehicle';
    return image || `https://placehold.co/400x300/3b82f6/ffffff?text=${placeholderText}`;
  };

  const getCarName = () => {
    return carName || 
           chat?.rentalRequest?.vehicleName || 
           chat?.auctionRequest?.vehicleName || 
           chat?.title || 
           'Vehicle';
  };

  const getRentalPeriod = () => {
    if (rentalPeriod) return rentalPeriod;
    
    // For auction chats
    if (chat?.type === 'auction') {
      if (chat?.auctionRequest?.startDate && chat?.auctionRequest?.endDate) {
        const start = new Date(chat.auctionRequest.startDate).toLocaleDateString();
        const end = new Date(chat.auctionRequest.endDate).toLocaleDateString();
        return `Auction: ${start} - ${end}`;
      }
      return 'Auction Discussion';
    }
    
    // For rental chats
    if (chat?.rentalRequest?.pickupDate && chat?.rentalRequest?.dropDate) {
      const pickup = new Date(chat.rentalRequest.pickupDate).toLocaleDateString();
      const drop = new Date(chat.rentalRequest.dropDate).toLocaleDateString();
      return `${pickup} - ${drop}`;
    }
    
    return 'Rental Period';
  };

  const getRentalStatus = () => {
    // For auction chats
    if (chat?.type === 'auction') {
      if (chat?.auctionRequest?.auction_stopped) {
        return (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
            AUCTION STOPPED
          </span>
        );
      }
      const endDate = chat?.auctionRequest?.endDate ? new Date(chat.auctionRequest.endDate) : null;
      const now = new Date();
      if (endDate && now < endDate) {
        return (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
            ACTIVE AUCTION
          </span>
        );
      } else if (endDate && now >= endDate) {
        return (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            AUCTION ENDED
          </span>
        );
      }
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
          AUCTION
        </span>
      );
    }
    
    // For rental chats
    if (chat?.rentalRequest?.status === 'active') {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
          ACTIVE RENTAL
        </span>
      );
    } else if (chat?.rentalRequest?.status === 'pending') {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
          PENDING
        </span>
      );
    } else if (chat?.rentalRequest?.status === 'completed') {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
          COMPLETED
        </span>
      );
    }
    return null;
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (onDeleteChat) {
      onDeleteChat(chat?._id);
    }
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="bg-orange-600 text-white px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30">
              <img 
                src={getCarImage()} 
                alt="car" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{getUserName()}</h3>
              <p className="text-sm text-white/90">{getCarName()}</p>
              <p className="text-xs text-white/80">{getRentalPeriod()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              {getRentalStatus()}
            </div>
            {onDeleteChat && (
              <button
                onClick={handleDeleteClick}
                className="p-2 rounded-lg bg-white/10 hover:bg-red-500 transition-all duration-200 group"
                title="Delete Chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Delete Chat</h3>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete this conversation with <strong>{getUserName()}</strong>?
              </p>
              <p className="text-sm text-gray-600 mb-4">
                This will permanently remove all messages and chat history for <strong>{getCarName()}</strong>.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800 font-medium">⚠️ This action cannot be undone!</p>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={handleCancelDelete}
                className="px-5 py-2.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
              >
                Delete Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RentalChatHeader;