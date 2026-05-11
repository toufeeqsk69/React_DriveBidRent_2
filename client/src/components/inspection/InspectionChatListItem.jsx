import React from 'react';

const InspectionChatListItem = ({ chat, onClick, isSelected, viewerIsBuyer: _viewerIsBuyer, currentUserId }) => {
  const getOtherUser = () => {
    if (!chat) return null;
    
    // For mechanic viewing: show auction manager
    // For auction manager viewing: show mechanic
    const storedUser = (() => { 
      try { 
        return JSON.parse(localStorage.getItem('user')); 
      } catch (_e) { 
        return null; 
      } 
    })();
    
    const myId = currentUserId || storedUser?._id || storedUser?.id;
    
    // If current user is mechanic, show auction manager
    if (chat.mechanic && String(myId) === String(chat.mechanic._id)) {
      return chat.auctionManager;
    }
    
    // If current user is auction manager, show mechanic
    if (chat.auctionManager && String(myId) === String(chat.auctionManager._id)) {
      return chat.mechanic;
    }
    
    // Fallback
    return chat.mechanic || chat.auctionManager;
  };

  const otherUser = getOtherUser();
  
  const getUserName = () => {
    if (!otherUser) return 'User';
    return `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || 'User';
  };

  const getCarImage = () => {
    return chat?.inspectionTask?.vehicleImage || 
           chat?.inspectionTask?.carImage || 
           chat?.vehicleImage || 
           chat?.carImage || 
           '/placeholder-car.jpg';
  };

  const getCarName = () => {
    return chat?.inspectionTask?.vehicleName || 
           chat?.inspectionTask?.carName || 
           chat?.vehicleName || 
           chat?.carName || 
           'Vehicle Inspection';
  };

  const getInspectionDate = () => {
    const date = chat?.inspectionTask?.scheduledDate || chat?.createdAt;
    if (date) {
      return new Date(date).toLocaleDateString();
    }
    return '';
  };

  const getInspectionStatus = () => {
    const status = chat?.inspectionTask?.status || chat?.status;
    
    if (status === 'in_progress' || status === 'assigned') {
      return 'IN PROGRESS';
    } else if (status === 'completed') {
      return 'COMPLETED';
    } else if (status === 'pending') {
      return 'PENDING';
    }
    return 'ASSIGNED';
  };

  const getStatusColor = () => {
    const status = chat?.inspectionTask?.status || chat?.status;
    
    if (status === 'in_progress' || status === 'assigned') {
      return 'bg-yellow-500';
    } else if (status === 'completed') {
      return 'bg-green-500';
    } else if (status === 'pending') {
      return 'bg-blue-500';
    }
    return 'bg-orange-500';
  };

  const handleClick = () => {
    if (onClick) {
      onClick(chat._id);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
        isSelected ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
      }`}
    >
      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 mr-4">
        <img 
          src={getCarImage()} 
          alt="car" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900 truncate">{getUserName()}</h4>
          <span className="text-xs text-gray-500">{getInspectionDate()}</span>
        </div>
        
        <p className="text-sm text-gray-600 truncate mt-1">{getCarName()}</p>
        
        <div className="flex items-center justify-between mt-2">
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold text-white ${getStatusColor()}`}>
            {getInspectionStatus()}
          </span>
          {chat.unreadCount > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full">
              {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectionChatListItem;