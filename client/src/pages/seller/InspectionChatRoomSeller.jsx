import React, { useEffect, useRef, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance.util';
import { useParams } from 'react-router-dom';
import InspectionChatBubble from '../../components/inspection/InspectionChatBubble';
import InspectionMessageInput from '../../components/inspection/InspectionMessageInput';
import InspectionChatHeader from '../../components/inspection/InspectionChatHeader';
// eslint-disable-next-line no-unused-vars
import toast from 'react-hot-toast';

export default function InspectionChatRoomSeller({ chatIdProp }) {
  const { chatId: chatIdFromParam } = useParams();
  const chatId = chatIdProp || chatIdFromParam;
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);
  const [myUserId, setMyUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const initialLoadRef = useRef(true);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
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

  useEffect(() => {
    if (!chatId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    (async () => {
      try {
        const res = await axiosInstance.get(`/inspection-chat/${chatId}`);
        const data = res.data.data || res.data || {};
        const chatData = data.chat || data || null;
        
        setChat(chatData);
        const storedUser = (() => {
          try { return JSON.parse(localStorage.getItem('user')); } catch (e) { return null; }
        })();
        const userId = data.myUserId || storedUser?._id || storedUser?.id || null;
        setMyUserId(userId);
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
        const res = await axiosInstance.get(`/inspection-chat/${chatId}/messages`);
        const fetchedMessages = res.data.data || [];
        setMessages(fetchedMessages);
        
        if (fetchedMessages.length > 0) {
          const lastMessage = fetchedMessages[fetchedMessages.length - 1];
          setLastFetchedAt(lastMessage.createdAt);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    
    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get(
          `/inspection-chat/${chatId}/messages${lastFetchedAt ? `?since=${encodeURIComponent(lastFetchedAt)}` : ''}`
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
        console.error('Polling error:', err);
      }
    };

    const intervalId = setInterval(fetchMessages, 3000);
    return () => clearInterval(intervalId);
  }, [chatId, lastFetchedAt]);

  useEffect(() => {
    if (!chatId || !myUserId || messages.length === 0) return;
    
    const hasUnread = messages.some(m => !m.read && m.sender && m.sender._id !== myUserId);
    if (!hasUnread) return;

    (async () => {
      try {
        await axiosInstance.post(`/inspection-chat/${chatId}/mark-read`);
        setMessages(prev => prev.map(m => 
          (m.sender && m.sender._id !== myUserId ? { ...m, read: true } : m)
        ));
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
      
      const res = await axiosInstance.post(`/inspection-chat/${chatId}/message`, { content });
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

  const expired = chat && new Date() > new Date(chat.expiresAt);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white border-l border-gray-100">
        <div className="w-16 h-16 border-4 border-gray-100 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <InspectionChatHeader
          carName={chat?.inspectionTask?.vehicleName || "Vehicle Inspection"}
          currentUserId={myUserId}
          chat={chat}
        />
        <div className="bg-blue-50 px-6 py-3 flex items-center justify-between border-b border-blue-100 shadow-inner">
          <span className="text-sm font-bold text-blue-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Discuss a time that works for you. The mechanic will set the final date.
          </span>
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8fafc]/50 relative"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center min-h-[300px]">
              <div className="text-center p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Start the Conversation</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto font-medium">
                  Message the mechanic to arrange an inspection time.
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map(m => {
                const isOwn = myUserId && m.sender && 
                  (String(m.sender._id) === String(myUserId) || String(m.sender.id) === String(myUserId));
                
                return (
                  <InspectionChatBubble 
                    key={m._id} 
                    message={m} 
                    isOwn={isOwn} 
                    className={isOwn ? 'ml-auto' : 'mr-auto'}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>
      
      {expired ? (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center text-sm font-bold text-gray-900">
           This inspection chat has expired
        </div>
      ) : (
        <div className="border-t border-gray-100 bg-white p-4 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          <div className="max-w-4xl mx-auto">
            <InspectionMessageInput 
              onSend={handleSend} 
              disabled={expired} 
              placeholder="Type your message here..." 
              className="border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 rounded-2xl shadow-sm bg-gray-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}
