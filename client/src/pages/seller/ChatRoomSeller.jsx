import React, { useEffect, useRef, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance.util';
import { useParams, useNavigate } from 'react-router-dom';
import ChatBubble from '../../components/chat/ChatBubble';
import MessageInput from '../../components/chat/MessageInput';
import RentalChatHeader from '../../components/chat/RentalChatHeader';

export default function ChatRoomSeller({ chatIdProp }) {
  const { chatId: chatIdFromParam } = useParams();
  const navigate = useNavigate();
  const chatId = chatIdProp || chatIdFromParam;
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);
  const [myUserId, setMyUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  // Load chat info
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
      }
    })();
  }, [chatId]);

  // Load messages
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

  // Poll for new messages
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
        if (err.response?.status === 404) {
          // Chat was deleted
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          navigate('/seller/chats');
        } else {
          console.error('Polling error:', err);
        }
      }
    };

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

  // Send message
  const handleSend = async (content) => {
    if (!chatId || !content.trim()) return;
    
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content,
      sender: { _id: myUserId },
      createdAt: new Date().toISOString(),
      isSending: true
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    try {
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

  // Delete chat
  const handleDeleteChat = async (chatId) => {
    try {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
      await axiosInstance.delete(`/chat/${chatId}`);
      window.dispatchEvent(new CustomEvent('chatDeleted', { detail: { chatId } }));
      navigate('/seller/chats');
    } catch (err) {
      console.error('Delete chat error:', err);
      if (err.response?.status === 404) {
        window.dispatchEvent(new CustomEvent('chatDeleted', { detail: { chatId } }));
        navigate('/seller/chats');
      } else {
        alert('Failed to delete chat. Please try again.');
      }
    }
  };

  const expired = chat && new Date() > new Date(chat.expiresAt);
  const otherUser = chat?.buyer || null;

  // No chat selected
  if (!chatId) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Conversation</h3>
          <p className="text-gray-500 mb-4">Choose a chat from the sidebar to begin</p>
          <div className="inline-flex items-center justify-center space-x-2 text-orange-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-medium">Click on a renter to start</span>
          </div>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <RentalChatHeader 
        chat={chat} 
        otherUser={otherUser} 
        carName={chat?.rentalRequest?.vehicleName} 
        rentalPeriod={`${chat?.rentalRequest ? new Date(chat?.rentalRequest?.pickupDate).toLocaleDateString() + ' - ' + new Date(chat?.rentalRequest?.dropDate).toLocaleDateString() : ''}`}
        onDeleteChat={handleDeleteChat}
      />
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-1">No messages yet</h3>
                <p className="text-gray-500 text-sm">Send your first message to start the conversation</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat started indicator */}
              <div className="text-center mb-4">
                <div className="inline-block px-3 py-1 bg-gray-100 rounded-full">
                  <span className="text-xs text-gray-600">
                    {chat?.type === 'auction' ? 'Auction Chat Started' : chat?.type === 'rental' ? 'Rental Chat Started' : 'Chat Started'} • {new Date(chat?.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {/* Messages */}
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
      
      {/* Expired chat notice */}
      {expired && (
        <div className="px-4 py-3 bg-amber-50 border-t border-amber-200">
          <div className="max-w-3xl mx-auto flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-amber-700">This chat has expired and is read-only</p>
          </div>
        </div>
      )}
      
      {/* Message input */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto p-4">
          <MessageInput 
            onSend={handleSend} 
            disabled={expired} 
            placeholder="Type your message..." 
          />
        </div>
      </div>
    </div>
  );
}