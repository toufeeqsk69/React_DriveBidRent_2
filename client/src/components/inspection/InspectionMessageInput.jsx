import React, { useState } from 'react';

const InspectionMessageInput = ({ onSend, disabled, placeholder = "Type a message..." }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="border-t bg-white p-4">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={disabled ? 'Chat expired' : placeholder}
          disabled={disabled}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-full font-medium transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default InspectionMessageInput;