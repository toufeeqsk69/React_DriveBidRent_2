import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatListMechanic from './ChatListMechanic';
import ChatRoomMechanic from './ChatRoomMechanic';

export default function ChatPageMechanic() {
  const { chatId: chatIdFromParam } = useParams();
  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useState(chatIdFromParam || null);

  useEffect(() => { 
    setSelectedChatId(chatIdFromParam || null); 
  }, [chatIdFromParam]);

  const handleSelect = (id) => { 
    setSelectedChatId(id); 
    navigate(`/mechanic/chats/${id}`); 
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-montserrat">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Chat Interface Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Inspection Messages</h1>
          <p className="text-gray-500 mt-1">Communicate directly with auction managers regarding your vehicle assignments.</p>
        </div>

        {/* Chat Application Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex h-[calc(100vh-200px)] min-h-[600px] max-h-[800px]">
            {/* Sidebar List */}
            <aside className="w-96 border-r border-gray-100 bg-gray-50/30 flex flex-col">
              <ChatListMechanic onSelect={handleSelect} selectedId={selectedChatId} />
            </aside>
            
            {/* Main Chat Panel */}
            <main className="flex-1 bg-white flex flex-col relative overflow-hidden">
              <ChatRoomMechanic chatIdProp={selectedChatId} />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}