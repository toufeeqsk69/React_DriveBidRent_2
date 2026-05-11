import React from 'react';

const InspectionChatHeader = ({ otherUser, carName, currentUserId, chat, onDeleteChat }) => {
  const getOtherUser = () => {
    console.log('=== GET OTHER USER DEBUG ===');
    console.log('otherUser prop:', otherUser);
    console.log('chat:', chat);
    
    if (otherUser) {
      console.log('Using provided otherUser prop');
      return otherUser;
    }
    
    if (!chat) {
      console.log('No chat data available');
      return null;
    }
    
    // Get current user ID from props or localStorage
    const storedUser = (() => { 
      try { 
        // Try authState first (Redux persisted state)
        const authState = JSON.parse(localStorage.getItem('authState'));
        if (authState?.user) return authState.user;
        
        // Fallback to user key
        return JSON.parse(localStorage.getItem('user')); 
      } catch (_e) { 
        return null; 
      } 
    })();
    
    const myId = currentUserId || storedUser?._id || storedUser?.id;
    
    console.log('myId:', myId);
    console.log('storedUser role:', storedUser?.role);
    console.log('chat.mechanic:', chat.mechanic);
    console.log('chat.auctionManager:', chat.auctionManager);
    
    // If current user is mechanic, show auction manager
    if (chat.mechanic && String(myId) === String(chat.mechanic._id)) {
      console.log('Current user is mechanic, showing auction manager');
      return chat.auctionManager;
    }
    
    // If current user is auction manager, show mechanic
    if (chat.auctionManager && String(myId) === String(chat.auctionManager._id)) {
      console.log('Current user is auction manager, showing mechanic');
      return chat.mechanic;
    }
    
    // Fallback - try to determine from user role
    const userRole = storedUser?.role;
    console.log('Falling back to role-based detection, role:', userRole);
    
    if (userRole === 'mechanic') {
      const result = chat.auctionManager || chat.manager;
      console.log('Mechanic fallback result:', result);
      return result;
    } else if (userRole === 'auctionManager' || userRole === 'auction_manager') {
      const result = chat.mechanic;
      console.log('Auction manager fallback result:', result);
      return result;
    }
    
    // Final fallback - return any available user
    const result = chat.mechanic || chat.auctionManager || chat.manager;
    console.log('Final fallback result:', result);
    return result;
  };

  const actualOtherUser = getOtherUser();

  const getUserName = () => {
    console.log('=== USER NAME DEBUG ===');
    console.log('actualOtherUser:', actualOtherUser);
    
    if (!actualOtherUser) {
      console.log('No other user found, returning default');
      return 'User';
    }
    
    // Try multiple name field combinations
    const nameFields = [
      actualOtherUser.firstName,
      actualOtherUser.first_name,
      actualOtherUser.fname
    ];
    
    const lastNameFields = [
      actualOtherUser.lastName,
      actualOtherUser.last_name,
      actualOtherUser.lname
    ];
    
    const firstName = nameFields.find(field => field && field.trim());
    const lastName = lastNameFields.find(field => field && field.trim());
    
    console.log('firstName:', firstName, 'lastName:', lastName);
    
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
    
    // Try other possible name sources
    const alternativeNames = [
      fullName,
      actualOtherUser.name,
      actualOtherUser.username,
      actualOtherUser.displayName,
      actualOtherUser.email?.split('@')[0]
    ];
    
    const name = alternativeNames.find(n => n && n.trim()) || 'User';
    
    console.log('Final selected name:', name);
    return name;
  };

  const getCarImage = () => {
    // Debug the image paths to see what's actually available
    console.log('=== CAR IMAGE DEBUG ===');
    console.log('chat:', chat);
    console.log('inspectionTask:', chat?.inspectionTask);
    
    // Try all possible image paths
    const imagePaths = [
      chat?.inspectionTask?.vehicleImage,
      chat?.inspectionTask?.carImage, 
      chat?.inspectionTask?.image,
      chat?.inspectionTask?.vehicleImages?.[0],
      chat?.inspectionTask?.images?.[0],
      chat?.vehicleImage,
      chat?.carImage,
      chat?.image,
      chat?.images?.[0],
      chat?.vehicleImages?.[0],
      // Check deeper nested structures
      chat?.inspectionTask?.vehicle?.image,
      chat?.inspectionTask?.vehicle?.vehicleImage,
      chat?.inspectionTask?.auctionRequest?.vehicleImage,
      chat?.auctionRequest?.vehicleImage,
      chat?.auctionRequest?.carImage
    ];
    
    console.log('Available image paths:', imagePaths.filter(Boolean));
    
    // Find the first non-null, non-undefined image
    const image = imagePaths.find(img => img && img !== null && img !== 'null' && img !== '');
    
    console.log('Selected image:', image);
    
    // Return the image or a default placeholder
    return image || 'https://placehold.co/400x300/cccccc/666666?text=No+Image';
  };

  const getCarName = () => {
    const name = carName || 
                 chat?.inspectionTask?.vehicleName || 
                 chat?.inspectionTask?.carName || 
                 chat?.inspectionTask?.name || 
                 chat?.vehicleName || 
                 chat?.carName || 
                 chat?.name;
    
    return name || 'Vehicle Inspection';
  };

  const getInspectionStatus = () => {
    const status = chat?.inspectionTask?.status || chat?.status;
    
    if (status === 'in_progress' || status === 'assigned') {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
          INSPECTION IN PROGRESS
        </span>
      );
    } else if (status === 'completed') {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
          INSPECTION COMPLETED
        </span>
      );
    } else if (status === 'pending') {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
          PENDING ASSIGNMENT
        </span>
      );
    }
    
    return (
      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
        INSPECTION ASSIGNED
      </span>
    );
  };

  const isAuctionManager = () => {
    const storedUser = (() => { 
      try { 
        // Try authState first (Redux persisted state)
        const authState = JSON.parse(localStorage.getItem('authState'));
        if (authState?.user) return authState.user;
        
        // Fallback to user key
        return JSON.parse(localStorage.getItem('user')); 
      } catch (_e) { 
        return null; 
      } 
    })();
    
    console.log('=== DELETE BUTTON DEBUG ===');
    console.log('storedUser:', storedUser);
    console.log('role:', storedUser?.role);
    console.log('userType:', storedUser?.userType);
    console.log('onDeleteChat prop:', onDeleteChat);
    
    const userRole = storedUser?.role || storedUser?.userType;
    const isManager = userRole === 'auctionManager' || 
                      userRole === 'auction_manager' || 
                      userRole === 'auctionmanager';
    
    console.log('isManager result:', isManager);
    return isManager;
  };

  return (
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
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            {getInspectionStatus()}
          </div>
          {isAuctionManager() && onDeleteChat && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this inspection chat?')) {
                  onDeleteChat(chat?._id);
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              title="Delete Chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Delete Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectionChatHeader;