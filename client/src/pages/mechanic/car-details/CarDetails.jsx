// client/src/pages/mechanic/car-details/CarDetails.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getVehicleDetails } from '../../../services/mechanic.services';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import ChecklistForm from './ChecklistForm';

export default function CarDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [_loading, _setLoading] = useState(false);

  useEffect(() => {
    getVehicleDetails(id)
      .then(res => setData(res.data.data))
      .catch(() => {
        toast.error('Failed to load vehicle details');
      });
  }, [id]);

  const handleInspectionSuccess = () => {
    setTimeout(() => {
      window.location.href = '/mechanic/current-tasks';
    }, 1500);
  };

  if (!data) return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center"><LoadingSpinner /></div>;

  const { vehicle, seller } = data;

  return (
    <div className="min-h-screen font-montserrat" style={{ background: '#f8fafc' }}>
      
      {/* ── HERO — Full width image banner ── */}
      <section style={{
        position: 'relative',
        height: '400px',
        overflow: 'hidden',
        background: '#0c1220'
      }}>
        <img
          src={vehicle.vehicleImage || '/placeholder-car.jpg'}
          alt={vehicle.vehicleName}
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(12,18,32,1) 0%, rgba(12,18,32,0.4) 60%, transparent 100%)'
        }} />
        
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', position: 'absolute', bottom: 48, left: 0, right: 0 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            padding: '6px 14px', borderRadius: 100, marginBottom: 16, backdropFilter: 'blur(4px)'
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Inspection Target</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1.05, marginBottom: 8 }}>
            {vehicle.vehicleName}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 18, fontWeight: 500 }}>
            {vehicle.year} • {vehicle.mileage.toLocaleString()} km • {vehicle.fuelType}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto pb-24 px-4 pt-10">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12">
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Vehicle Specs */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">🏎️</span>
                  Vehicle Specifications
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Year</span>
                    <span className="font-bold text-gray-900">{vehicle.year}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Mileage</span>
                    <span className="font-bold text-gray-900">{vehicle.mileage.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Condition</span>
                    <span className="font-bold text-gray-900">{vehicle.condition}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Fuel Type</span>
                    <span className="font-bold text-gray-900">{vehicle.fuelType}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Transmission</span>
                    <span className="font-bold text-gray-900">{vehicle.transmission}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Auction Date</span>
                    <span className="font-bold text-gray-900">{new Date(vehicle.auctionDate).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">👤</span>
                  Seller Information
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Name</span>
                    <span className="font-bold text-gray-900">{seller.firstName} {seller.lastName}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Phone</span>
                    <span className="font-bold text-gray-900">{seller.phone}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Location</span>
                    <span className="font-bold text-gray-900">{seller.city}, {seller.state}</span>
                  </div>
                </div>

                {vehicle.inspectionStatus === 'scheduled' && vehicle.inspectionDate && (
                  <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
                    <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Inspection Scheduled
                    </h4>
                    <p className="text-sm text-blue-800 mb-4">
                      {new Date(vehicle.inspectionDate).toLocaleDateString()} at {vehicle.inspectionTime || 'TBD'}
                    </p>
                    <a 
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Vehicle Inspection: ${vehicle.vehicleName}`)}&details=${encodeURIComponent(`Inspection for ${vehicle.year} ${vehicle.vehicleName}.\nSeller Phone: ${seller.phone}\nLocation: ${seller.doorNo}, ${seller.street}, ${seller.city}`)}&location=${encodeURIComponent(`${seller.city}, ${seller.state}`)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg text-sm hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google Calendar" className="w-4 h-4" />
                      Add to Google Calendar
                    </a>
                  </div>
                )}
                
                {data.chatId && vehicle.reviewStatus !== 'completed' && (
                  <div className="mt-8">
                    <button 
                      onClick={() => window.location.href = `/mechanic/chats/${data.chatId}`}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      CHAT WITH SELLER TO SCHEDULE
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Review Section */}
            {vehicle.reviewStatus === 'completed' ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center mt-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-2xl font-black text-green-800">Inspection Completed</p>
                <p className="text-green-700 mt-2 font-medium">
                  All inspection details have been recorded and submitted successfully.
                </p>
              </div>
            ) : (
              <ChecklistForm vehicleId={id} onSuccess={handleInspectionSuccess} />
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}