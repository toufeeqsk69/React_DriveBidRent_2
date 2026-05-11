import React from 'react';

const ChatBubble = ({ message, isOwn }) => {
  // Debug message alignment
  console.log('ChatBubble - message:', message._id, 'isOwn:', isOwn, 'sender:', message.sender?._id);
  
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 px-4`}>
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`px-4 py-3 rounded-2xl shadow-sm break-words ${
          isOwn 
            ? 'bg-green-500 text-white rounded-br-md' 
            : 'bg-gray-200 text-gray-800 rounded-bl-md'
        }`}>
          <div className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</div>
          
          <div className={`mt-2 flex items-center gap-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-xs ${
              isOwn ? 'text-green-100' : 'text-gray-500'
            }`}>
              {formatTime(message.createdAt)}
            </span>
            
            {isOwn && (
              <div className="flex items-center ml-1" title={message.read ? `Read at ${new Date(message.updatedAt || message.createdAt).toLocaleString()}` : message.delivered ? 'Delivered' : 'Sent'}>
                {message.read ? (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <svg className="w-4 h-4 text-blue-200 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : message.delivered ? (
                  <svg className="w-4 h-4 text-green-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-green-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
