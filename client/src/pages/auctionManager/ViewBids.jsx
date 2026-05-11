// client/src/pages/auctionManager/ViewBids.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { auctionManagerServices } from '../../services/auctionManager.services';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ViewBids() {
  const { id } = useParams();
  const [currentBid, setCurrentBid] = useState(null);
  const [pastBids, setPastBids] = useState([]);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ending, setEnding] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [poking, setPoking] = useState(false);
  const [pokeResult, setPokeResult] = useState(null); // { success, message }
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBids = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        const res = await auctionManagerServices.viewBids(id);
        const responseData = res.data || res;
        
        if (responseData.success) {
          const { auction, currentBid: cBid, pastBids: pBids } = responseData.data || {};
          // set the car/auction info
          setCar(auction || null);

          // set current and past bids separately
          setCurrentBid(cBid || null);
          setPastBids(Array.isArray(pBids) ? pBids : []);
        } else {
          setError(responseData.message || 'Failed to load bids');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load bids');
      } finally {
        if (isInitial) setLoading(false);
      }
    };
    
    // Initial fetch with loading state
    fetchBids(true);
    
    // Setup Socket.io for real-time bid updates
    const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'https://drivebidrent.onrender.com';
    const socket = io(backendUrl, { withCredentials: true });
    
    socket.on('connect', () => {
      socket.emit('join_auction', id);
    });

    socket.on('new_bid', () => {
      if (!error) fetchBids(false);
    });
    
    return () => {
      socket.emit('leave_auction', id);
      socket.disconnect();
    };
  }, [id, error]);

  const endAuction = async () => {
    if (!window.confirm('Are you sure you want to end this auction?')) return;
    
    try {
      setEnding(true);
  const res = await auctionManagerServices.stopAuction(id);
      const responseData = res.data || res;
      
      if (responseData.success) {
        alert('Auction ended successfully!');
        window.location.reload();
      } else {
        alert(responseData.message || 'Failed to end auction');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to end auction');
    } finally {
      setEnding(false);
    }
  };

  const pokeBuyer = async () => {
    try {
      setPoking(true);
      setPokeResult(null);
      const res = await auctionManagerServices.pokeBuyer(id);
      const data = res.data || res;
      setPokeResult({ success: data.success, message: data.message });
    } catch (err) {
      setPokeResult({ success: false, message: err.response?.data?.message || 'Failed to send reminder' });
    } finally {
      setPoking(false);
    }
  };

  // Check if poke button should be visible:
  // auction ended + winner exists + 30h passed + not already re-auctioned
  const canPoke = () => {
    if (!car?.auction_stopped || !car?.winnerId || car?.paymentFailed) return false;
    const updatedAt = new Date(car.updatedAt);
    const hoursSinceEnd = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceEnd >= 0; // TEST: set to 0 for testing, change back to: 30
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">View Bids</h2>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">View Bids</h2>
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg text-center">
          Car not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-montserrat" style={{ background: '#f8fafc' }}>

      {/* ── HERO — full-width dark banner ── */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0c1220 0%, #111827 50%, #0c1628 100%)',
        paddingTop: 60,
        paddingBottom: 48,
        overflow: 'hidden',
      }}>
        {[
          { top: '15%', left: '4%', size: 160, color: 'rgba(249,115,22,0.08)' },
          { top: '50%', left: '70%', size: 220, color: 'rgba(99,102,241,0.07)' },
          { top: '5%', left: '84%', size: 110, color: 'rgba(34,197,94,0.06)' },
        ].map((orb, i) => (
          <div key={i} style={{ position: 'absolute', top: orb.top, left: orb.left, width: orb.size, height: orb.size, borderRadius: '50%', background: orb.color, filter: 'blur(40px)', pointerEvents: 'none' }} />
        ))}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', position: 'relative' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', padding: '6px 14px', borderRadius: 100, marginBottom: 14 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 0 3px rgba(34,197,94,0.3)' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Live Auction</span>
              </div>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#fff', letterSpacing: '-1.2px', lineHeight: 1.08, marginBottom: 8 }}>
                Live Auction{' '}
                <span style={{ color: '#f97316', fontStyle: 'italic' }}>Dashboard</span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: 14, maxWidth: 400, lineHeight: 1.7 }}>
                Monitor live bids and manage auction status for <strong style={{ color: '#e2e8f0' }}>{car.vehicleName}</strong>.
              </p>
            </div>
            <button
              onClick={() => navigate('/auctionmanager/approved')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#94a3b8', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', padding: '12px 20px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
              Back to Cars
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto pb-20 px-4 pt-8">

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: Vehicle Info & Image Gallery & Past Bids */}
          <div className="lg:w-2/3 space-y-8">
            
            {/* Image Gallery & Main Specs */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="w-full h-80 md:h-[450px] bg-gray-100 relative">
                {(() => {
                  const imgs = [];
                  if (car.mainImage) imgs.push(car.mainImage);
                  else if (car.vehicleImage) imgs.push(car.vehicleImage);
                  if (car.additionalImages?.length > 0) imgs.push(...car.additionalImages);
                  else if (car.vehicleImages?.length > 0) {
                    const additional = car.vehicleImages.filter(i => i !== car.vehicleImage && i !== car.mainImage);
                    imgs.push(...additional);
                  }
                  const safeImages = imgs.length > 0 ? imgs : ['/images/placeholder-car.jpg'];
                  
                  return (
                    <img
                      src={safeImages[activeImageIndex] || safeImages[0]}
                      alt={car.vehicleName}
                      className="w-full h-full object-cover transition-opacity duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400?text=Vehicle+Image';
                      }}
                    />
                  );
                })()}

                <div className="absolute top-4 left-4">
                  <span className="px-5 py-2 backdrop-blur-md text-white border border-white/20 text-sm font-bold uppercase tracking-wider rounded-full shadow-lg bg-green-600/90 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-sm"></span>
                    LIVE BIDS
                  </span>
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                   <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{car.vehicleName}</h2>
                   {car.carType && (
                     <span className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-bold uppercase tracking-wider self-start shadow-md">{car.carType}</span>
                   )}
                </div>
                
                {(() => {
                  const imgs = [];
                  if (car.mainImage) imgs.push(car.mainImage);
                  else if (car.vehicleImage) imgs.push(car.vehicleImage);
                  if (car.additionalImages?.length > 0) imgs.push(...car.additionalImages);
                  else if (car.vehicleImages?.length > 0) {
                    const additional = car.vehicleImages.filter(i => i !== car.vehicleImage && i !== car.mainImage);
                    imgs.push(...additional);
                  }
                  
                  if (imgs.length <= 1) return null;
                  
                  return (
                    <div className="flex gap-4 overflow-x-auto pb-4 mb-6 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {imgs.map((img, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative w-24 h-16 md:w-32 md:h-20 flex-shrink-0 cursor-pointer rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${
                            activeImageIndex === idx ? 'ring-4 ring-amber-500 scale-105 opacity-100 z-10' : 'opacity-60 hover:opacity-100 ring-1 ring-gray-200'
                          }`}
                        >
                          <img src={img} alt={`${car.vehicleName} preview ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100 flex flex-col items-center justify-center">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Starting Bid</p>
                    <p className="font-bold text-xl text-gray-900">₹{car.startingBid?.toLocaleString() || '—'}</p>
                    {car.expectedBid && <p className="text-xs text-gray-400 mt-1">Seller asked: ₹{car.expectedBid.toLocaleString()}</p>}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100 flex flex-col items-center justify-center">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Condition</p>
                    <p className="font-bold text-xl text-gray-900 capitalize">{car.condition || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100 flex flex-col items-center justify-center">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Year</p>
                    <p className="font-bold text-xl text-gray-900">{car.year || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Past Bids History */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 mt-8">
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                 <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center inline-flex">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </span>
                 Bid History
                 <span className="ml-auto text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{pastBids.length} total bids</span>
              </h3>

              {pastBids && pastBids.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pastBids.map((bid, index) => (
                    <div key={bid._id} className="relative bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:shadow-md transition duration-200">
                      {index === 0 && (
                        <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full shadow-sm">
                          Previous Highest
                        </div>
                      )}
                      <div className="text-2xl font-black text-blue-600 mb-1">₹{bid.bidAmount?.toLocaleString()}</div>
                      <div className="text-sm font-bold text-gray-800 tracking-tight">{bid.buyerId?.firstName || 'Unknown'} {bid.buyerId?.lastName || ''}</div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate">{bid.buyerId?.email || 'N/A'}</div>
                      <div className="text-xs text-gray-400 mt-3 font-medium border-t border-gray-200 pt-3">
                        {new Date(bid.bidTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   <p className="text-lg font-bold text-gray-600 mb-1">No past bids to show</p>
                   <p className="text-sm text-gray-400">Past bid history will appear here once bids are placed.</p>
                </div>
              )}
            </div>
            
          </div>

          {/* RIGHT COLUMN: Action Sticky Panel */}
          <div className="lg:w-1/3 mt-8 lg:mt-0 relative">
            <div className="sticky top-6 space-y-6 lg:pb-12">
              
              {/* CURRENT BID HIGHLIGHT BOX */}
              <div className="bg-[#0f172a] rounded-3xl p-8 relative overflow-hidden shadow-2xl border border-gray-800">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Highest Current Bid
                </p>
                
                {currentBid ? (
                  <div className="relative z-10 mt-4">
                    <p className="text-5xl md:text-6xl font-black text-white mb-6 drop-shadow-md">₹{currentBid.bidAmount?.toLocaleString()}</p>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Leading Bidder</p>
                      <div className="text-white font-bold text-lg truncate flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-amber-500 text-amber-950 flex items-center justify-center text-xs font-black">
                           {currentBid.buyerId?.firstName?.charAt(0) || 'U'}
                         </div>
                         {currentBid.buyerId?.firstName || 'Unknown'} {currentBid.buyerId?.lastName || ''}
                      </div>
                      <p className="text-gray-300 text-sm mt-1 truncate">{currentBid.buyerId?.email || 'N/A'}</p>
                      <div className="w-full h-px bg-white/10 my-3"></div>
                      <p className="text-gray-400 text-xs flex justify-between items-center">
                         <span>Placed on:</span>
                         <span className="text-white font-medium">{new Date(currentBid.bidTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 py-8">
                     <p className="text-4xl font-black text-gray-500">₹0</p>
                     <p className="text-gray-400 mt-4">No bids placed yet.</p>
                     <p className="text-sm text-gray-500 mt-1">Waiting for the first bidder.</p>
                  </div>
                )}
              </div>

              {/* Action Box */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <div className="text-xl font-black text-gray-900 mb-6">Auction Controls</div>
                
                {car.auction_stopped ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 text-gray-700 p-6 rounded-2xl border border-gray-200 text-center shadow-inner">
                      <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <span className="font-extrabold text-xl block text-gray-800 mb-1">Auction Ended</span>
                      <span className="text-sm text-gray-500 block">This auction is closed and no longer accepting bids.</span>
                    </div>

                    {/* POKE BUTTON — only when 30h passed, winner exists, not re-auctioned */}
                    {canPoke() && (
                      <div className="pt-2">
                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-3 text-center">
                          <p className="text-xs text-orange-700 font-semibold">
                            💤 Winner hasn't paid yet. Send them a payment reminder!
                          </p>
                        </div>
                        <button
                          onClick={pokeBuyer}
                          disabled={poking}
                          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-base transition-all duration-300 flex justify-center items-center gap-2 shadow-md"
                        >
                          {poking ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <span className="text-lg">👉</span>
                              Poke Buyer
                            </>
                          )}
                        </button>

                        {/* Result feedback */}
                        {pokeResult && (
                          <div className={`mt-3 p-3 rounded-xl text-sm font-semibold text-center ${
                            pokeResult.success
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {pokeResult.success ? '✅ ' : '❌ '}{pokeResult.message}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                   <div className="space-y-4">
                     <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                       You can manually stop this live auction at any time. The highest current bid will be considered final upon stopping.
                     </p>
                     <button
                       onClick={endAuction}
                       disabled={ending}
                       className="w-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 py-4 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group flex justify-center items-center gap-2 shadow-sm"
                     >
                       {ending ? (
                         <span className="flex items-center gap-2">
                           <div className="w-5 h-5 border-2 border-red-600 border-t-transparent group-hover:border-white group-hover:border-t-transparent rounded-full animate-spin"></div>
                           Ending...
                         </span>
                       ) : (
                         <>
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
                           Stop Live Auction
                         </>
                       )}
                     </button>
                   </div>
                )}
              </div>
              
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}