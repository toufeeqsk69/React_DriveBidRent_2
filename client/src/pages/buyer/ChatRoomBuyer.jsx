import React, { useEffect, useRef, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance.util';
import { useParams, useNavigate } from 'react-router-dom';
import ChatBubble from '../../components/chat/ChatBubble';
import MessageInput from '../../components/chat/MessageInput';
import RentalChatHeader from '../../components/chat/RentalChatHeader';

export default function ChatRoomBuyer({ chatIdProp }) {
  const { chatId: chatIdFromParam } = useParams();
  const navigate = useNavigate();
  const chatId = chatIdProp || chatIdFromParam;
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);
  const [myUserId, setMyUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const initialLoadRef = useRef(true);
  const pollingIntervalRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }, 100);
  };

  useEffect(() => {
    if (initialLoadRef.current && messages.length > 0) {
      scrollToBottom();
      initialLoadRef.current = false;
    }
  }, [messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Keep scroll at bottom when user is at bottom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom = 
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      if (isNearBottom) {
        scrollToBottom();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!chatId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    (async () => {
      try {
        const res = await axiosInstance.get(`/chat/${chatId}`);
        const payload = res.data.data || {};
        setChat(payload.chat || null);
        setMyUserId(payload.myUserId || null);
      } catch (err) {
        console.error('Error loading chat:', err);
      } finally {
        setIsLoading(false);
        initialLoadRef.current = true;
      }
    })();
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    
    (async () => {
      try {
        const res = await axiosInstance.get(`/chat/${chatId}/messages`);
        const fetchedMessages = res.data.data || [];
        setMessages(fetchedMessages);
        
        // Set last fetched time for polling
        if (fetchedMessages.length > 0) {
          const lastMessage = fetchedMessages[fetchedMessages.length - 1];
          setLastFetchedAt(lastMessage.createdAt);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [chatId]);

  // Poll for messages every 3 seconds
  useEffect(() => {
    if (!chatId) return;
    
    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get(
          `/chat/${chatId}/messages${lastFetchedAt ? `?since=${encodeURIComponent(lastFetchedAt)}` : ''}`
        );
        const newMsgs = res.data.data || [];
        if (newMsgs.length > 0) {
          setMessages(prev => {
            // Deduplicate by message ID to prevent repeating messages
            const existingIds = new Set(prev.map(m => m._id));
            const uniqueNewMsgs = newMsgs.filter(m => !existingIds.has(m._id));
            return uniqueNewMsgs.length > 0 ? [...prev, ...uniqueNewMsgs] : prev;
          });
          const latestTime = newMsgs[newMsgs.length - 1]?.createdAt;
          if (latestTime) {
            setLastFetchedAt(latestTime);
          }
        }
      } catch (err) {
        // Handle chat deletion (404) or other errors
        if (err.response?.status === 404) {
          console.log('Chat was deleted, stopping polling');
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          // Navigate away from deleted chat
          navigate('/buyer/chats');
        } else {
          console.error('Polling error:', err);
        }
      }
    };

    // Set up polling
    const intervalId = setInterval(fetchMessages, 3000);
    pollingIntervalRef.current = intervalId;
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [chatId, lastFetchedAt, navigate]);

  // Mark messages as read
  useEffect(() => {
    if (!chatId || !myUserId || messages.length === 0) return;
    
    const hasUnread = messages.some(m => !m.read && m.sender && m.sender._id !== myUserId);
    if (!hasUnread) return;

    (async () => {
      try {
        await axiosInstance.post(`/chat/${chatId}/mark-read`);
        setMessages(prev => prev.map(m => 
          (m.sender && m.sender._id !== myUserId ? { ...m, read: true } : m)
        ));
        try { 
          window.dispatchEvent(new CustomEvent('chatRead', { detail: { chatId } })); 
        } catch (e) {}
      } catch (err) {
        console.error('Mark-read failed:', err);
      }
    })();
  }, [messages, chatId, myUserId]);

  const handleSend = async (content) => {
    if (!chatId || !content.trim()) return;
    
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content,
      sender: { _id: myUserId },
      createdAt: new Date().toISOString(),
      isSending: true
    };

    try {
      setMessages(prev => [...prev, tempMessage]);
      
      const res = await axiosInstance.post(`/chat/${chatId}/message`, { content });
      if (res.data?.data) {
        setMessages(prev => prev.map(m => 
          m._id === tempMessage._id ? res.data.data : m
        ));
        setLastFetchedAt(res.data.data.createdAt);
      }
    } catch (err) {
      console.error('Send message error:', err);
      setMessages(prev => prev.filter(m => m._id !== tempMessage?._id));
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      // Stop polling immediately
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
      await axiosInstance.delete(`/chat/${chatId}`);
      
      // Trigger chat list refresh and navbar update
      window.dispatchEvent(new CustomEvent('chatDeleted', { detail: { chatId } }));
      
      // Navigate back to chat list
      navigate('/buyer/chats');
    } catch (err) {
      console.error('Delete chat error:', err);
      // Handle race condition - if already deleted by other user
      if (err.response?.status === 404) {
        // Chat already deleted, just navigate away
        window.dispatchEvent(new CustomEvent('chatDeleted', { detail: { chatId } }));
        navigate('/buyer/chats');
      } else {
        alert('Failed to delete chat. Please try again.');
      }
    }
  };

  const expired = chat && new Date() > new Date(chat.expiresAt);

  if (!chatId) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white p-8">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 mx-auto mb-8 text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-3">Select a Conversation</h3>
          <p className="text-gray-600 text-lg mb-8">
            Choose a chat from the sidebar to start communicating with sellers
          </p>
          <div className="inline-flex items-center justify-center space-x-2 text-orange-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-medium">Click on a seller to begin</span>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading conversation...</p>
          <p className="text-sm text-gray-500 mt-2">Preparing your chat interface</p>
        </div>
      </div>
    );
  }

  const otherUser = chat?.seller || null;

  return (
    <div className="flex flex-col h-full bg-white">
      <RentalChatHeader 
        chat={chat} 
        otherUser={otherUser} 
        carName={chat?.rentalRequest?.vehicleName} 
        rentalPeriod={`${chat?.rentalRequest ? new Date(chat?.rentalRequest?.pickupDate).toLocaleDateString() + ' - ' + new Date(chat?.rentalRequest?.dropDate).toLocaleDateString() : ''}`}
        onDeleteChat={handleDeleteChat}
      />
      
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-white to-gray-50/50"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">Start the Conversation</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Send your first message to discuss {chat?.type === 'auction' ? 'the auction' : 'the rental details'} with the seller
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                  <span className="text-sm font-medium text-blue-700">
                    {chat?.type === 'auction' ? 'Auction Chat Started' : 'Rental Chat Started'} • {new Date(chat?.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {messages.map(m => {
                const isOwn = myUserId && m.sender && 
                  (String(m.sender._id) === String(myUserId) || String(m.sender.id) === String(myUserId));
                
                return (
                  <ChatBubble 
                    key={m._id} 
                    message={m} 
                    isOwn={isOwn}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>
      
      {expired ? (
        <div className="px-8 py-4 bg-gradient-to-r from-amber-50 to-amber-100 border-t border-amber-200">
          <div className="max-w-4xl mx-auto flex items-center justify-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800">This {chat?.type === 'auction' ? 'auction' : 'rental'} chat has expired</p>
              <p className="text-xs text-amber-600">The conversation is now read-only</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto px-8">
            <MessageInput 
              onSend={handleSend} 
              disabled={expired} 
              placeholder="Type your message here..." 
              className="border-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
}