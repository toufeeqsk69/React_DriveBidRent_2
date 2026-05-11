import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance.util';
import { Link } from 'react-router-dom';

export default function ChatListSeller({ onSelect, selectedId }) {
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
        const [normalRes, inspectionRes] = await Promise.allSettled([
          axiosInstance.get('/chat/my-chats'),
          axiosInstance.get('/inspection-chat/my-chats')
        ]);
        
        let allChats = [];
        
        if (normalRes.status === 'fulfilled' && normalRes.value.data.data) {
          const sellerChats = normalRes.value.data.data.filter(chat => chat.type === 'rental' || chat.type === 'auction');
          allChats = [...allChats, ...sellerChats];
        }

        if (inspectionRes.status === 'fulfilled' && inspectionRes.value.data.data) {
          const inspectionChats = inspectionRes.value.data.data.map(chat => ({
            ...chat,
            type: 'inspection'
          }));
          allChats = [...allChats, ...inspectionChats];
        }

        setChats(allChats);
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
    if (!user) return 'R';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (lastName) return lastName[0].toUpperCase();
    return 'R';
  };

  const getOtherUser = (chat) => {
    if (!chat) return null;
    if (chat.type === 'inspection') {
      // For seller, the other user is the mechanic OR auction manager
      return chat.mechanic || chat.auctionManager || null;
    }
    // For regular seller, the other user is the buyer
    return chat.buyer || null;
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
    
    // For older dates, show month/day
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Helper function to get last message preview
  const getLastMessagePreview = (chat) => {
    if (!chat.lastMessage) return 'No messages yet';
    const content = typeof chat.lastMessage === 'string' ? chat.lastMessage : (chat.lastMessage.content || '');
    return content.length > 40 ? content.substring(0, 40) + '...' : content;
  };

  // Helper function to get chatter name
  const getChatterName = (chat) => {
    const otherUser = getOtherUser(chat);
    if (!otherUser) return 'Renter';
    
    const firstName = otherUser.firstName || '';
    const lastName = otherUser.lastName || '';
    
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    
    return chat.type === 'inspection' ? 'Inspector' : 'Renter';
  };

  // Filter chats based on search
  const filteredChats = chats.filter(chat => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const chatterName = getChatterName(chat).toLowerCase();
    const vehicleName = (chat.inspectionTask?.vehicleName || chat.rentalRequest?.vehicleName || chat.auctionRequest?.vehicleName || chat.title || '').toLowerCase();
    
    return chatterName.includes(searchLower) || 
           vehicleName.includes(searchLower);
  });

  // Sort chats by last activity
  const sortedChats = [...filteredChats].sort((a, b) => {
    // Unread chats first
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
    
    // Then by last message time
    const timeA = new Date(a.lastMessageAt || a.updatedAt || a.createdAt || 0);
    const timeB = new Date(b.lastMessageAt || b.updatedAt || b.createdAt || 0);
    return timeB - timeA;
  });

  return (
    <div className="w-full h-full bg-white flex flex-col border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Messages</h2>
        <p className="text-sm text-gray-500">Rentals & Inspections</p>
        
        {/* Search */}
        <div className="relative mt-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600">Loading chats...</p>
          </div>
        ) : sortedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-4">
            <div className="w-16 h-16 mb-3 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">
              {searchTerm ? 'No matches found' : 'No conversations'}
            </h3>
            <p className="text-gray-500 text-center text-sm max-w-xs">
              {searchTerm 
                ? 'Try different search terms'
                : 'Chats with renters will appear here'}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-3 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
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
              const chatterName = getChatterName(chat);
              const vehicleName = chat.inspectionTask?.vehicleName || chat.rentalRequest?.vehicleName || chat.auctionRequest?.vehicleName || chat.title || 'Vehicle';
              const lastUpdated = chat.updatedAt || chat.createdAt;
              const _lastMessagePreview = getLastMessagePreview(chat);
              
              const ChatItem = ({ children }) => onSelect ? (
                <div
                  onClick={() => onSelect(chat._id)}
                  className={`cursor-pointer ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  {children}
                </div>
              ) : (
                <Link 
                  to={chat.type === 'inspection' ? `/seller/inspection-chats/${chat._id}` : `/seller/chats/${chat._id}`}
                  className={`block ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  {children}
                </Link>
              );

              return (
                <ChatItem key={chat._id}>
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                          {getUserInitials(otherUser)}
                        </div>
                        {isUnread && (
                          <div className="relative">
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 truncate text-base flex items-center gap-2">
                              {vehicleName}
                              {chat.type === 'inspection' && (
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded border border-indigo-200 uppercase font-bold tracking-wider">
                                  Inspection
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {chatterName}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {getTimeAgo(lastUpdated)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ChatItem>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          {sortedChats.length} chat{sortedChats.length !== 1 ? 's' : ''}
          {chats.some(c => c.unreadCount > 0) && (
            <span className="ml-2">
              • {chats.filter(c => c.unreadCount > 0).length} unread
            </span>
          )}
        </div>
      </div>
    </div>
  );
}