import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatListBuyer from './ChatListBuyer';
import ChatRoomBuyer from './ChatRoomBuyer';

export default function ChatPageBuyer() {
  const { chatId: chatIdFromParam } = useParams();
  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useState(chatIdFromParam || null);

  useEffect(() => {
    setSelectedChatId(chatIdFromParam || null);
  }, [chatIdFromParam]);

  const handleSelect = (id) => {
    setSelectedChatId(id);
    navigate(`/buyer/chats/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="flex flex-col sm:flex-row h-[calc(100vh-120px)] sm:h-[calc(100vh-100px)] min-h-[500px] sm:min-h-[700px]">
            <aside className={`${selectedChatId ? 'hidden sm:block' : 'block'} w-full sm:w-80 lg:w-96 border-b sm:border-b-0 sm:border-r border-gray-200`}>
              <ChatListBuyer onSelect={handleSelect} selectedId={selectedChatId} />
            </aside>
            <main className={`${selectedChatId ? 'block' : 'hidden sm:block'} flex-1`}>
              <ChatRoomBuyer chatIdProp={selectedChatId} />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}