import React from 'react';

const InspectionChatBubble = ({ message, isOwn }) => {
  // Debug message alignment
  console.log('InspectionChatBubble - message:', message._id, 'isOwn:', isOwn, 'sender:', message.sender?._id);
  
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 px-4`}>
      <div className={`max-w-[70%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl shadow-sm break-words ${
          isOwn 
            ? 'bg-orange-500 text-white rounded-br-md' 
            : 'bg-gray-200 text-gray-800 rounded-bl-md'
        }`}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          
          <div className={`flex items-center mt-2 gap-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-xs ${isOwn ? 'text-orange-100' : 'text-gray-500'}`}>
              {new Date(message.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
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
                  <svg className="w-4 h-4 text-orange-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-orange-200" fill="currentColor" viewBox="0 0 20 20">
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

export default InspectionChatBubble;