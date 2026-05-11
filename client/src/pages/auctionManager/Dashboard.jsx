// client/src/pages/auctionManager/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const [data, setData] = useState({ pending: [], assigned: [], approved: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await auctionManagerServices.getDashboard();
        const responseData = res.data || res;

        if (responseData.success) {
          setData(responseData.data || { pending: [], assigned: [], approved: [] });
        } else {
          setError(responseData.message || 'Failed to load dashboard');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 font-montserrat">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md border border-red-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 mb-3">Connection Error</p>
          <p className="text-gray-600 mb-8 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-900 hover:bg-amber-500 text-white font-bold py-4 px-8 rounded-xl transition duration-300 shadow-sm hover:shadow-md"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-montserrat" style={{ background: '#f8fafc' }}>

      {/* ── HERO — full-width dark banner matching Wishlist style ── */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0c1220 0%, #111827 50%, #0c1628 100%)',
        paddingTop: 80,
        paddingBottom: 60,
        overflow: 'hidden',
      }}>
        {/* Floating orbs */}
        {[
          { top: '20%', left: '5%', size: 200, color: 'rgba(249,115,22,0.08)', delay: '0s' },
          { top: '55%', left: '65%', size: 260, color: 'rgba(99,102,241,0.07)', delay: '1.2s' },
          { top: '10%', left: '80%', size: 130, color: 'rgba(249,115,22,0.05)', delay: '0.6s' },
        ].map((orb, i) => (
          <div key={i} style={{
            position: 'absolute', top: orb.top, left: orb.left,
            width: orb.size, height: orb.size, borderRadius: '50%',
            background: orb.color, filter: 'blur(40px)',
            animationDelay: orb.delay, pointerEvents: 'none',
          }} />
        ))}
        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', position: 'relative' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32 }}>

            {/* Left: title */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)',
                padding: '6px 14px', borderRadius: 100, marginBottom: 16,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', display: 'inline-block' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Management Portal</span>
              </div>
              <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.05, marginBottom: 12 }}>
                Auction{' '}
                <span style={{ color: '#f97316', fontStyle: 'italic' }}>Manager</span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 420, lineHeight: 1.7 }}>
                Oversee requests, inspections &amp; live auctions — all in one place.
              </p>
            </div>

            {/* Right: stat pills */}
            <div style={{ display: 'flex', gap: 12 }}>
              {/* Requests */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{data.pending.length}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Requests</div>
                </div>
                <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)' }} />
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 18, height: 18, color: '#60a5fa' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              {/* Inspections */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{data.assigned.length}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Inspections</div>
                </div>
                <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)' }} />
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 18, height: 18, color: '#fbbf24' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              {/* Live */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderRadius: 16, background: 'rgba(249,115,22,0.14)', border: '1px solid rgba(249,115,22,0.3)' }}>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#f97316', lineHeight: 1 }}>{data.approved.length}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(249,115,22,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Live</div>
                </div>
                <div style={{ width: 1, height: 36, background: 'rgba(249,115,22,0.2)' }} />
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 18, height: 18, color: '#34d399' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto pb-24 px-4 pt-12">



        {/* ==================== REQUESTS ==================== */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 px-2 lg:px-4">Pending Requests</h2>
            {data.pending.length > 0 && (
              <Link to="/auctionmanager/requests" className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-bold rounded-xl transition duration-300 shadow-sm">
                View All
              </Link>
            )}
          </div>

          {data.pending.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-500">No pending vehicle requests at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.pending.slice(0, 3).map((req) => (
                <div key={req._id} className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col h-full group">
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <img
                      src={req.mainImage || req.vehicleImage || '/images/placeholder.jpg'}
                      alt={req.vehicleName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-amber-500/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                        PENDING
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-extrabold text-gray-900 mb-4 truncate group-hover:text-amber-600 transition-colors">{req.vehicleName}</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Seller</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {req.sellerId?.firstName} {req.sellerId?.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Location</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{req.sellerId?.city || 'Not specified'}</p>
                      </div>
                    </div>

                    {/* Documentation Quick View */}
                    {req.vehicleDocumentation && (
                      <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                          {req.vehicleDocumentation.registrationNumber && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 text-[10px] uppercase font-bold tracking-wider rounded-md">
                              RC Available
                            </span>
                          )}
                          {req.vehicleDocumentation.insuranceStatus === 'Valid' && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 text-[10px] uppercase font-bold tracking-wider rounded-md">
                              Insured
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <Link
                        to={`/auctionmanager/assign-mechanic/${req._id}`}
                        className="w-full inline-flex justify-center items-center py-3 bg-gray-900 hover:bg-amber-500 text-white font-bold rounded-xl transition duration-300"
                      >
                        Assign Mechanic
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ==================== PENDING INSPECTIONS ==================== */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 px-2 lg:px-4">Pending Inspections</h2>
            {data.assigned.length > 0 && (
              <Link to="/auctionmanager/pending" className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-bold rounded-xl transition duration-300 shadow-sm">
                View All
              </Link>
            )}
          </div>

          {data.assigned.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No active inspections</h3>
              <p className="text-gray-500">There are no vehicles currently awaiting a mechanic's report.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.assigned.slice(0, 3).map((car) => {
                const hasReview = !!car.multipointInspection || !!(car.mechanicReview && (car.mechanicReview.mechanicalCondition || car.mechanicReview.bodyCondition));
                return (
                  <div key={car._id} className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col h-full group">
                    <div className="relative h-56 overflow-hidden bg-gray-100">
                      <img
                        src={car.mainImage || car.vehicleImage}
                        alt={car.vehicleName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm ${hasReview ? 'bg-green-500/90' : 'bg-amber-500/90'}`}>
                          {hasReview ? 'REVIEW COMPLETE' : 'AWAITING REPORT'}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-extrabold text-gray-900 mb-4 truncate group-hover:text-amber-600 transition-colors">{car.vehicleName}</h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Seller</p>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {car.sellerId?.firstName} {car.sellerId?.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Location</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{car.sellerId?.city || 'Not specified'}</p>
                        </div>
                      </div>
                      {hasReview && (
                        <div className="mt-2 mb-6 p-3 bg-green-50 rounded-xl border border-green-100">
                          <p className="text-[10px] text-green-800 uppercase tracking-wider font-bold mb-1">Mechanic's Review</p>
                          <p className="text-xs text-green-700 line-clamp-2 font-medium">
                            {car.multipointInspection?.mechanicSummary || car.mechanicReview?.mechanicalCondition || car.mechanicReview?.bodyCondition || 'Review submitted successfully'}
                          </p>
                        </div>
                      )}

                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <Link
                          to={`/auctionmanager/pending-car-details/${car._id}`}
                          className={`w-full inline-flex justify-center items-center py-3 font-bold rounded-xl transition duration-300 ${hasReview ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-900 hover:bg-amber-500 text-white'}`}
                        >
                          {hasReview ? 'Review & Approve' : 'View Details'}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ==================== LIVE AUCTIONS ==================== */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 px-2 lg:px-4">Live Auctions</h2>
            {data.approved.length > 0 && (
              <Link to="/auctionmanager/approved" className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-bold rounded-xl transition duration-300 shadow-sm">
                View All
              </Link>
            )}
          </div>

          {data.approved.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No active auctions</h3>
              <p className="text-gray-500">Approved vehicles will appear here when auctions go live.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.approved.slice(0, 3).map((car) => (
                <div key={car._id} className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-amber-200 overflow-hidden flex flex-col h-full group">
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <img
                      src={car.mainImage || car.vehicleImage}
                      alt={car.vehicleName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-green-500/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        LIVE NOW
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-extrabold text-gray-900 mb-4 truncate group-hover:text-green-600 transition-colors">{car.vehicleName}</h3>

                    <div className="mb-6">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Make Year</p>
                          <p className="text-lg font-black text-gray-900">{car.year}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Mileage</p>
                          <p className="text-lg font-black text-gray-900">{(car.mileage || 0).toLocaleString()} <span className="text-xs text-gray-500 font-medium">km</span></p>
                        </div>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                        <p className="text-[10px] text-amber-800 uppercase tracking-wider font-bold mb-1">Auction Starting Bid</p>
                        <p className="text-2xl font-black text-amber-600">₹{car.startingBid ? car.startingBid.toLocaleString() : '—'}</p>
                      </div>
                    </div>

                    <div className="mt-auto border-t border-gray-100 pt-4">
                      <Link
                        to={`/auctionmanager/view-bids/${car._id}`}
                        className="w-full inline-flex justify-center items-center py-3 bg-gray-900 hover:bg-amber-500 text-white font-bold rounded-xl transition duration-300"
                      >
                        View Live Bids
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}