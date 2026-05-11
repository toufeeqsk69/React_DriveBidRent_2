import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance.util';
import { Link } from 'react-router-dom';

export default function ChatListMechanic({ onSelect, selectedId }) {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const _currentUserId = JSON.parse(localStorage.getItem('user') || '{}')?._id;

  useEffect(() => {
    const fetchChats = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get('/inspection-chat/my-chats');
        setChats(res.data.data || []);
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

  // Helper function to get manager initials
  const getManagerInitials = (manager) => {
    if (!manager) return 'M';
    const firstName = manager.firstName || manager.first_name || '';
    const lastName = manager.lastName || manager.last_name || '';
    
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    return 'M';
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
    const content = chat.lastMessage.content || '';
    return content.length > 30 ? content.substring(0, 30) + '...' : content;
  };

  // Filter chats based on search
  const filteredChats = chats.filter(chat => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const managerFirstName = chat.auctionManager?.firstName?.toLowerCase() || '';
    const managerLastName = chat.auctionManager?.lastName?.toLowerCase() || '';
    const managerFullName = `${managerFirstName} ${managerLastName}`.trim();
    const vehicleName = chat.inspectionTask?.vehicleName?.toLowerCase() || '';
    const inspectionId = chat.inspectionTask?._id?.toLowerCase() || '';
    
    return managerFullName.includes(searchLower) || 
           vehicleName.includes(searchLower) ||
           inspectionId.includes(searchLower);
  });

  // Sort chats
  const sortedChats = [...filteredChats].sort((a, b) => {
    // Sort by unread first, then by last message time
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
    
    const timeA = new Date(a.updatedAt || a.createdAt || 0);
    const timeB = new Date(b.updatedAt || b.createdAt || 0);
    return timeB - timeA;
  });

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 rounded-l-3xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-white shadow-[0_4px_10px_rgba(0,0,0,0.02)] relative z-10">
        <h2 className="text-xl font-black text-gray-900 mb-1">Active Chats</h2>
        <p className="text-sm text-gray-500 font-medium">Vehicle inspections</p>
        
        {/* Search */}
        <div className="relative mt-5">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium placeholder-gray-400 transition-all"
          />
        </div>
      </div>
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-amber-500 rounded-full animate-spin mb-3"></div>
            <p className="text-sm text-gray-500 font-medium">Loading chats...</p>
          </div>
        ) : sortedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 mb-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              {searchTerm ? 'No matches found' : 'No active chats'}
            </h3>
            <p className="text-gray-500 text-xs mt-1">
              {searchTerm 
                ? 'Try different search terms'
                : 'Inspection chats will appear here'}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 font-bold text-xs bg-white border border-gray-200 rounded-lg text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100/50">
            {sortedChats.map(chat => {
              const isSelected = String(selectedId) === String(chat._id);
              const isUnread = chat.unreadCount > 0;
              const managerFirstName = chat.auctionManager?.firstName || '';
              const managerLastName = chat.auctionManager?.lastName || '';
              const managerName = managerFirstName && managerLastName 
                ? `${managerFirstName} ${managerLastName}` 
                : managerFirstName || 'Auction Manager';
              const vehicleName = chat.inspectionTask?.vehicleName || 'Vehicle';
              const status = chat.status || 'ASSIGNED';
              const lastUpdated = chat.updatedAt || chat.createdAt;
              const lastMessagePreview = getLastMessagePreview(chat);
              
              // Premium status styling
              const getStatusStyle = (s) => {
                if (s === 'COMPLETED') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                if (s === 'IN_PROGRESS') return 'bg-amber-100 text-amber-800 border-amber-200';
                return 'bg-blue-100 text-blue-800 border-blue-200';
              };

              const chatContent = (
                <div className="p-4 relative">
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-r-md shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    {/* Premium Avatar */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-sm flex items-center justify-center text-white font-bold text-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                        {getManagerInitials(chat.auctionManager)}
                      </div>
                      {isUnread && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full animate-pulse shadow-sm"></div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 py-0.5">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h3 className={`text-[15px] truncate transition-colors ${isSelected ? 'font-black text-amber-700' : 'font-bold text-gray-900'}`}>
                            {managerName}
                          </h3>
                        </div>
                        <div className="text-xs font-bold text-gray-400 whitespace-nowrap pt-1">
                          {getTimeAgo(lastUpdated)}
                        </div>
                      </div>
                      
                      <p className={`text-xs truncate mb-2 font-medium ${isSelected ? 'text-amber-800/80' : 'text-gray-600'}`}>
                        <span className="opacity-70">Task:</span> <span className="font-bold border-b border-dashed border-gray-300">{vehicleName}</span>
                      </p>
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100/50">
                        <span className={`px-2 py-0.5 border rounded-md text-[10px] uppercase font-black tracking-wider ${getStatusStyle(status)}`}>
                          {status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      {lastMessagePreview && (
                        <p className={`mt-2 text-sm truncate ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-500'}`}>
                          {lastMessagePreview}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );

              return onSelect ? (
                <div
                  key={chat._id}
                  onClick={() => onSelect(chat._id)}
                  className={`cursor-pointer transition-all duration-200 border-b border-transparent ${
                    isSelected 
                      ? 'bg-amber-50/60 shadow-[inset_0_1px_0_rgba(255,255,255,1)] border-b-gray-200/50' 
                      : 'hover:bg-white bg-transparent'
                  }`}
                >
                  {chatContent}
                </div>
              ) : (
                <Link 
                  key={chat._id} 
                  to={`/mechanic/chats/${chat._id}`}
                  className={`block transition-all duration-200 border-b border-transparent ${
                    isSelected 
                      ? 'bg-amber-50/60 shadow-[inset_0_1px_0_rgba(255,255,255,1)] border-b-gray-200/50' 
                      : 'hover:bg-white bg-transparent'
                  }`}
                >
                  {chatContent}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}