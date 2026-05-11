import React, { useState } from 'react';

const MessageInput = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const txt = value.trim();
    if (!txt) return;
    onSend(txt);
    setValue('');
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-3 p-3 border-t bg-white">
      <input
        className="flex-1 px-4 py-3 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
        placeholder={disabled ? 'Chat expired' : 'Type a message...'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
      />
      <button type="submit" disabled={disabled} className="px-4 py-2 bg-orange-500 text-white rounded-full shadow">Send</button>
    </form>
  );
};

export default MessageInput;
