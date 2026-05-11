import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance.util';
import { Link } from 'react-router-dom';

export default function ChatListBuyer({ onSelect, selectedId }) {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Try to get current user id from localStorage
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch (e) { return null; }
  })();
  const _currentUserId = storedUser?._id || storedUser?.id || null;

  useEffect(() => {
    const fetchChats = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get('/chat/my-chats');
        // Filter to show rental and auction chats for buyer-seller communication
        const allChats = res.data.data || [];
        const buyerChats = allChats.filter(chat => chat.type === 'rental' || chat.type === 'auction');
        setChats(buyerChats);
      } catch (err) {
        console.error('Error fetching chats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChats();
    
    // Refresh chats every 30 seconds
    const intervalId = setInterval(fetchChats, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Listen for chatRead events and update unread counts locally
  useEffect(() => {
    const handler = (e) => {
      try {
        const { chatId } = e.detail || {};
        if (!chatId) return;
        setChats(prev => prev.map(c => {
          if (String(c._id) === String(chatId)) {
            return { ...c, unreadCount: 0 };
          }
          return c;
        }));
      } catch (err) { 
        console.error('Chat read handler error:', err); 
      }
    };

    window.addEventListener('chatRead', handler);
    return () => window.removeEventListener('chatRead', handler);
  }, []);

  // Listen for chatDeleted events and remove chat from list
  useEffect(() => {
    const handler = (e) => {
      try {
        const { chatId } = e.detail || {};
        if (!chatId) return;
        // Remove deleted chat from list immediately
        setChats(prev => prev.filter(c => String(c._id) !== String(chatId)));
      } catch (err) {
        console.error('Chat deleted handler error:', err);
      }
    };

    window.addEventListener('chatDeleted', handler);
    return () => window.removeEventListener('chatDeleted', handler);
  }, []);

  // Helper function to get user initials
  const getUserInitials = (user) => {
    if (!user) return 'S';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (lastName) return lastName[0].toUpperCase();
    return 'S';
  };

  // Helper function to get other user (seller)
  const getOtherUser = (chat) => {
    if (!chat) return null;
    // For buyer, the other user is the seller
    return chat.seller || null;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Helper function to get time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  // Helper function to get last message preview
  const getLastMessagePreview = (chat) => {
    if (!chat.lastMessage) return 'No messages yet';
    const content = typeof chat.lastMessage === 'string' ? chat.lastMessage : (chat.lastMessage.content || '');
    return content.length > 30 ? content.substring(0, 30) + '...' : content;
  };

  // Filter chats based on search
  const filteredChats = chats.filter(chat => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const otherUser = getOtherUser(chat);
    const userName = otherUser ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.toLowerCase() : '';
    const vehicleName = (chat.rentalRequest?.vehicleName || chat.auctionRequest?.vehicleName || chat.title || '').toLowerCase();
    
    return userName.includes(searchLower) || 
           vehicleName.includes(searchLower);
  });

  // Sort chats
  const sortedChats = [...filteredChats].sort((a, b) => {
    // Sort by unread first, then by last message time
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
    
    const timeA = new Date(a.lastMessageAt || a.updatedAt || a.createdAt || 0);
    const timeB = new Date(b.lastMessageAt || b.updatedAt || b.createdAt || 0);
    return timeB - timeA;
  });

  return (
    <div className="w-full h-full bg-white flex flex-col border-r border-gray-200">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Chats</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Rental & Auction communications</p>
          </div>
          {chats.filter(c => c.unreadCount > 0).length > 0 && (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white text-sm sm:text-base font-bold">
              {chats.filter(c => c.unreadCount > 0).length}
            </div>
          )}
        </div>
        
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search sellers or vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-100 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <div className="w-12 h-12 border-3 border-gray-200 rounded-full"></div>
              <div className="w-12 h-12 border-3 border-orange-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading conversations...</p>
          </div>
        ) : sortedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-6">
            <div className="w-20 h-20 mb-4 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchTerm ? 'No matches found' : 'No Active Conversations'}
            </h3>
            <p className="text-gray-500 text-center text-sm max-w-xs">
              {searchTerm 
                ? 'Try searching with different terms'
                : 'Start a conversation by contacting a seller about a rental or auction'}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedChats.map(chat => {
              const isSelected = String(selectedId) === String(chat._id);
              const isUnread = chat.unreadCount > 0;
              const otherUser = getOtherUser(chat);
              const userName = otherUser ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || 'Seller' : 'Seller';
              const vehicleName = chat.rentalRequest?.vehicleName || chat.auctionRequest?.vehicleName || chat.title || 'Vehicle';
              const status = chat.status || (chat.type === 'auction' ? 'AUCTION' : 'ACTIVE');
              const lastUpdated = chat.updatedAt || chat.createdAt;
              const lastMessagePreview = getLastMessagePreview(chat);
              const rentalDate = chat.rentalRequest?.pickupDate || chat.auctionRequest?.startDate || lastUpdated;
              
              return onSelect ? (
                <div
                  key={chat._id}
                  onClick={() => onSelect(chat._id)}
                  className={`transition-all cursor-pointer group ${
                    isSelected 
                      ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-l-orange-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                          {getUserInitials(otherUser)}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h3 className="font-semibold text-gray-900 truncate">
                              {userName}
                            </h3>
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {vehicleName}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {getTimeAgo(lastUpdated)}
                            </span>
                            {isUnread && (
                              <span className="mt-1 w-2 h-2 rounded-full bg-orange-500"></span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              status === 'ACTIVE' 
                                ? 'bg-blue-100 text-blue-800'
                                : status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {status}
                            </span>
                            <p className="text-xs text-gray-500">
                              {formatDate(rentalDate)}
                            </p>
                          </div>
                        </div>
                        
                        {lastMessagePreview && (
                          <p className="mt-2 text-sm text-gray-600 truncate">
                            {lastMessagePreview}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link 
                  key={chat._id} 
                  to={`/buyer/chats/${chat._id}`}
                  className={`block transition-all group ${
                    isSelected 
                      ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-l-orange-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                          {getUserInitials(otherUser)}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h3 className="font-semibold text-gray-900 truncate">
                              {userName}
                            </h3>
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {vehicleName}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {getTimeAgo(lastUpdated)}
                            </span>
                            {isUnread && (
                              <span className="mt-1 w-2 h-2 rounded-full bg-orange-500"></span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              status === 'ACTIVE' 
                                ? 'bg-blue-100 text-blue-800'
                                : status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {status}
                            </span>
                            <p className="text-xs text-gray-500">
                              {formatDate(rentalDate)}
                            </p>
                          </div>
                        </div>
                        
                        {lastMessagePreview && (
                          <p className="mt-2 text-sm text-gray-600 truncate">
                            {lastMessagePreview}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 text-center">
          {sortedChats.length} conversation{sortedChats.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}