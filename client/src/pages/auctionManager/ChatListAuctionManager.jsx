import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance.util';
import { Link } from 'react-router-dom';
import InspectionChatListItem from '../../components/inspection/InspectionChatListItem';

export default function ChatListAuctionManager({ onSelect, selectedId }) {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')?._id;

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

  const filteredChats = chats.filter(chat => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const mechanicFirstName = chat.mechanic?.firstName?.toLowerCase() || '';
    const mechanicLastName = chat.mechanic?.lastName?.toLowerCase() || '';
    const mechanicFullName = `${mechanicFirstName} ${mechanicLastName}`.trim();
    const vehicleName = chat.inspectionTask?.vehicleName?.toLowerCase() || '';
    const inspectionId = chat.inspectionTask?._id?.toLowerCase() || '';
    
    return mechanicFullName.includes(searchLower) || 
           vehicleName.includes(searchLower) ||
           inspectionId.includes(searchLower);
  });

  const sortedChats = [...filteredChats].sort((a, b) => {
    // Sort by unread first, then by last message time
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
    
    const timeA = new Date(a.updatedAt || a.createdAt || 0);
    const timeB = new Date(b.updatedAt || b.createdAt || 0);
    return timeB - timeA;
  });

  return (
    <div className="w-full h-full bg-white flex flex-col border-r border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Chats</h2>
            <p className="text-sm text-gray-600 mt-1">Inspection communications</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold">
            {chats.filter(c => c.unreadCount > 0).length}
          </div>
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
            placeholder="Search mechanics or vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <div className="w-12 h-12 border-3 border-gray-200 rounded-full"></div>
              <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
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
                : 'You\'ll see conversations here once inspections are assigned'}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 text-sm font-medium text-amber-600 hover:text-amber-700"
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
              
              const listItem = (
                <InspectionChatListItem 
                  chat={chat} 
                  isSelected={isSelected} 
                  viewerIsBuyer={false} 
                  currentUserId={currentUserId}
                  showBadge={isUnread}
                />
              );
              
              return onSelect ? (
                <div
                  key={chat._id}
                  onClick={() => onSelect(chat._id)}
                  className={`transition-all cursor-pointer group ${
                    isSelected 
                      ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-l-amber-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="p-4">
                    {listItem}
                  </div>
                </div>
              ) : (
                <Link 
                  key={chat._id} 
                  to={`/auctionmanager/chats/${chat._id}`}
                  className={`block transition-all group ${
                    isSelected 
                      ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-l-amber-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="p-4">
                    {listItem}
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