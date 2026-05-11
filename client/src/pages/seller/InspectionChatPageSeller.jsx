import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InspectionChatRoomSeller from './InspectionChatRoomSeller';

export default function InspectionChatPageSeller() {
  const { chatId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] font-montserrat">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Inspection Negotiation</h1>
            <p className="text-gray-500 mt-1 font-medium">Communicate directly with the mechanic to schedule the inspection.</p>
          </div>
          <button onClick={() => navigate(-1)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 bg-white transition-colors">
             &larr; Back
          </button>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex h-[calc(100vh-200px)] min-h-[600px] max-h-[800px]">
            <main className="flex-1 bg-white flex flex-col relative overflow-hidden">
              <InspectionChatRoomSeller chatIdProp={chatId} />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
