// client/src/pages/auctionManager/ApprovedCars.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ApprovedCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCars = async () => {
      console.log('🔍 [Frontend - ApprovedCars] Fetching approved cars assigned to this auction manager...');
      try {
        setLoading(true);
        const res = await auctionManagerServices.getApproved();
        const responseData = res.data || res;
        
        console.log('📦 [Frontend - ApprovedCars] API response:', responseData);
        
        if (responseData.success) {
          console.log('✅ [Frontend - ApprovedCars] Loaded', responseData.data?.length || 0, 'approved cars assigned to me');
          setCars(responseData.data || []);
        } else {
          console.log('❌ [Frontend - ApprovedCars] Failed:', responseData.message);
          setError(responseData.message || 'Failed to load approved cars');
        }
      } catch (err) {
        console.error('❌ [Frontend - ApprovedCars] Error:', err);
        setError(err.response?.data?.message || 'Failed to load approved cars');
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const startAuction = async (id) => {
    console.log('🚀 [Frontend - ApprovedCars] Starting auction for car:', id);
    try {
      const res = await auctionManagerServices.startAuction(id);
      const responseData = res.data || res;
      
      console.log('📦 [Frontend - ApprovedCars] Start auction response:', responseData);
      
      if (responseData.success) {
        console.log('✅ [Frontend - ApprovedCars] Auction started successfully');
        setCars(cars.map(car => car._id === id ? { ...car, started_auction: 'yes' } : car));
        alert('Auction started successfully!');
      } else {
        console.log('❌ [Frontend - ApprovedCars] Failed to start auction:', responseData.message);
        alert(responseData.message || 'Failed to start auction');
      }
    } catch (err) {
      console.error('❌ [Frontend - ApprovedCars] Error starting auction:', err);
      alert(err.response?.data?.message || 'Failed to start auction');
    }
  };

  const reAuctionCar = async (id) => {
    if (!window.confirm('Are you sure you want to re-auction this car? The buyer will be reported to admin.')) return;
    
    console.log('🔄 [Frontend - ApprovedCars] Re-auctioning car:', id);
    try {
      const res = await auctionManagerServices.reAuction(id);
      const responseData = res.data || res;
      
      console.log('📦 [Frontend - ApprovedCars] Re-auction response:', responseData);
      
      if (responseData.success) {
        console.log('✅ [Frontend - ApprovedCars] Car re-auctioned successfully');
        // Refresh the car list
        setCars(cars.map(car => 
          car._id === id 
            ? { ...car, started_auction: 'yes', auction_stopped: false, paymentFailed: true, isReauctioned: true } 
            : car
        ));
        alert('Car re-auctioned successfully! Buyer has been reported to admin.');
      } else {
        console.log('❌ [Frontend - ApprovedCars] Failed to re-auction:', responseData.message);
        alert(responseData.message || 'Failed to re-auction');
      }
    } catch (err) {
      console.error('❌ [Frontend - ApprovedCars] Error re-auctioning:', err);
      alert(err.response?.data?.message || 'Failed to re-auction');
    }
  };

  const matchesSearch = (car) => {
    const q = (search || '').trim().toLowerCase();
    if (!q) return true;
    const sellerName = `${car.sellerId?.firstName || ''} ${car.sellerId?.lastName || ''}`.toLowerCase();
    return (
      (car.vehicleName || '').toLowerCase().includes(q) ||
      sellerName.includes(q) ||
      (car.sellerId?.city || '').toLowerCase().includes(q)
    );
  };

  // Check if car is eligible for re-auction (payment deadline passed and payment not completed)
  const isReauctionEligible = (car) => {
    if (!car.paymentDeadline || !car.auction_stopped) return false;
    const now = new Date();
    const deadline = new Date(car.paymentDeadline);
    return now > deadline && !car.paymentFailed; // eligible if deadline passed and not yet re-auctioned
  };

  const notStartedCars = cars.filter(c => (c.started_auction === 'no') && matchesSearch(c));
  const ongoingCars = cars.filter(c => (c.started_auction === 'yes' && !c.auction_stopped) && matchesSearch(c));
  const endedCars = cars.filter(c => ((c.auction_stopped === true) || c.started_auction === 'ended') && !isReauctionEligible(c) && matchesSearch(c));
  const reauctionCars = cars.filter(c => isReauctionEligible(c) && matchesSearch(c));

  // helper to determine status string for a car
  const getCarStatus = (c) => {
    if (isReauctionEligible(c)) return 'reauction';
    if (c.started_auction === 'no' || !c.started_auction) return 'not-started';
    if (c.started_auction === 'yes' && !c.auction_stopped) return 'ongoing';
    return 'ended';
  };

  // helper to determine display tag for a car
  const getCarTag = (c) => {
    // If car has been re-auctioned and auction ended, show "Auction completed"
    if (c.isReauctioned && c.auction_stopped) {
      return { text: 'Auction completed', color: 'bg-gray-100 text-gray-800' };
    }
    // If car is currently being re-auctioned (ongoing or waiting), show "Re-auction"
    if (c.isReauctioned) {
      return { text: 'Re-auction', color: 'bg-purple-100 text-purple-800' };
    }
    // Regular auction ended
    if (c.auction_stopped || c.started_auction === 'ended') {
      return { text: 'Auction completed', color: 'bg-gray-100 text-gray-800' };
    }
    // Regular auction ongoing (first time)
    if (c.started_auction === 'yes') {
      return { text: 'Approved', color: 'bg-green-100 text-green-800' };
    }
    // Not started yet
    return { text: 'Pending Start', color: 'bg-yellow-100 text-yellow-800' };
  };

  // combined filtered list used when statusFilter is 'all'
  const filteredCars = cars
    .filter(matchesSearch)
    .filter(c => (statusFilter === 'all' ? true : getCarStatus(c) === statusFilter))
    .sort((a, b) => {
      // desired order: reauction, not-started, ongoing, ended
      const order = { 'reauction': 0, 'not-started': 1, 'ongoing': 2, 'ended': 3 };
      return order[getCarStatus(a)] - order[getCarStatus(b)];
    });

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Approved Cars</h2>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
          {error}
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
        paddingTop: 80,
        paddingBottom: 60,
        overflow: 'hidden',
      }}>
        {[
          { top: '20%', left: '5%', size: 200, color: 'rgba(249,115,22,0.08)' },
          { top: '55%', left: '68%', size: 260, color: 'rgba(99,102,241,0.07)' },
          { top: '10%', left: '82%', size: 130, color: 'rgba(34,197,94,0.05)' },
        ].map((orb, i) => (
          <div key={i} style={{ position: 'absolute', top: orb.top, left: orb.left, width: orb.size, height: orb.size, borderRadius: '50%', background: orb.color, filter: 'blur(40px)', pointerEvents: 'none' }} />
        ))}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', position: 'relative' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)', padding: '6px 14px', borderRadius: 100, marginBottom: 16 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', display: 'inline-block' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Live &amp; Pending</span>
              </div>
              <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.05, marginBottom: 12 }}>
                Approved{' '}
                <span style={{ color: '#f97316', fontStyle: 'italic' }}>Cars</span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 380, lineHeight: 1.7 }}>
                Manage auctions, track live bids and completed sales.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderRadius: 16, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#4ade80', lineHeight: 1 }}>{filteredCars.length}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(74,222,128,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Vehicles</div>
              </div>
              <div style={{ width: 1, height: 36, background: 'rgba(34,197,94,0.2)' }} />
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 18, height: 18, color: '#34d399' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto pb-24 px-4 pt-12">
        
        {/* Search and Filter Controls */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by car, seller or location..."
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
              <button
                onClick={() => setSearch('')}
                className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition duration-200 whitespace-nowrap"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-gray-700 font-bold whitespace-nowrap">Filter Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="reauction">Re-auction Required ({reauctionCars.length})</option>
                <option value="not-started">Yet to Start ({notStartedCars.length})</option>
                <option value="ongoing">Live Auctions ({ongoingCars.length})</option>
                <option value="ended">Completed ({endedCars.length})</option>
              </select>
            </div>
          </div>
        </div>

      {statusFilter === 'all' ? (
        <section>
          <h3 className="text-2xl font-black text-gray-800 mb-6 px-2">All Approved Cars ({filteredCars.length})</h3>
          {filteredCars.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm">
              <p className="text-lg font-bold text-gray-500">No cars found matching your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredCars.map(car => (
                <div key={car._id} className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col h-full group cursor-pointer" onClick={() => navigate(`/auctionmanager/view-bids/${car._id}`)}>
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <img src={car.mainImage || car.vehicleImage} alt={car.vehicleName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm ${getCarTag(car).color.replace('text-', 'text-white bg-').split(' ')[0]}-500/90`}>
                        {getCarTag(car).text}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-4 truncate">{car.vehicleName}</h3>
                    <div className="grid grid-cols-2 gap-y-4 mb-6">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Seller</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{car.sellerId?.firstName} {car.sellerId?.lastName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Location</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{car.sellerId?.city || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Condition</p>
                        <p className="text-sm font-medium text-gray-900 capitalize">{car.condition}</p>
                      </div>
                    </div>
                    <div className="mt-auto pt-4 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                      {getCarStatus(car) === 'reauction' ? (
                        <button onClick={() => reAuctionCar(car._id)} className="w-full py-3 bg-red-100 hover:bg-red-600 text-red-700 hover:text-white font-bold rounded-xl transition duration-300">Re-Auction</button>
                      ) : getCarStatus(car) === 'not-started' ? (
                        <button onClick={() => startAuction(car._id)} className="w-full py-3 bg-blue-100 hover:bg-blue-600 text-blue-700 hover:text-white font-bold rounded-xl transition duration-300">Start Auction</button>
                      ) : (
                        <Link to={`/auctionmanager/view-bids/${car._id}`} className="w-full inline-flex justify-center items-center py-3 bg-gray-900 hover:bg-amber-500 text-white font-bold rounded-xl transition duration-300">View Dashboard</Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section>
          <h3 className="text-2xl font-black text-gray-800 mb-6 px-2">
            {statusFilter === 'reauction' ? `Re-auction Required (${reauctionCars.length})` : statusFilter === 'not-started' ? `Yet to Start (${notStartedCars.length})` : statusFilter === 'ongoing' ? `Live Auctions (${ongoingCars.length})` : `Completed (${endedCars.length})`}
          </h3>
          
          {statusFilter === 'reauction' && (reauctionCars.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm"><p className="text-lg font-bold text-gray-500">No cars in this category.</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {reauctionCars.map(car => (
                <div key={car._id} className="bg-white rounded-3xl shadow-sm border-2 border-red-200 overflow-hidden flex flex-col h-full group">
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <img src={car.mainImage || car.vehicleImage} alt={car.vehicleName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-4 left-4"><span className="px-3 py-1 bg-red-500/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">PAYMENT EXPIRED</span></div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-extrabold text-gray-900 mb-4 truncate">{car.vehicleName}</h3>
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <button onClick={() => reAuctionCar(car._id)} className="w-full py-3 bg-red-100 hover:bg-red-600 text-red-700 hover:text-white font-bold rounded-xl transition duration-300">Initiate Re-Auction</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {statusFilter === 'not-started' && (notStartedCars.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm"><p className="text-lg font-bold text-gray-500">No cars in this category.</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {notStartedCars.map(car => (
                <div key={car._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full group">
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <img src={car.mainImage || car.vehicleImage} alt={car.vehicleName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-4 left-4"><span className="px-3 py-1 bg-blue-500/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">READY TO START</span></div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-extrabold text-gray-900 mb-4 truncate">{car.vehicleName}</h3>
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <button onClick={() => startAuction(car._id)} className="w-full py-3 bg-blue-100 hover:bg-blue-600 text-blue-700 hover:text-white font-bold rounded-xl transition duration-300">Launch Auction</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {statusFilter === 'ongoing' && (ongoingCars.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm"><p className="text-lg font-bold text-gray-500">No cars in this category.</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {ongoingCars.map(car => (
                <div key={car._id} className="bg-white rounded-3xl shadow-sm border border-amber-200 overflow-hidden flex flex-col h-full group">
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <img src={car.mainImage || car.vehicleImage} alt={car.vehicleName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-4 left-4"><span className="px-3 py-1 bg-green-500/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>LIVE NOW</span></div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-extrabold text-gray-900 mb-4 truncate">{car.vehicleName}</h3>
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <Link to={`/auctionmanager/view-bids/${car._id}`} className="w-full inline-flex justify-center items-center py-3 bg-gray-900 hover:bg-amber-500 text-white font-bold rounded-xl transition duration-300">Monitor Bids</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {statusFilter === 'ended' && (endedCars.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm"><p className="text-lg font-bold text-gray-500">No cars in this category.</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {endedCars.map(car => (
                <div key={car._id} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full group">
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <img src={car.mainImage || car.vehicleImage} alt={car.vehicleName} className="w-full h-full object-cover grayscale transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-4 left-4"><span className="px-3 py-1 bg-gray-800/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">COMPLETED</span></div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-extrabold text-gray-900 mb-4 truncate">{car.vehicleName}</h3>
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <Link to={`/auctionmanager/view-bids/${car._id}`} className="w-full inline-flex justify-center items-center py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition duration-300">View Results</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </section>
      )}
      </div>
    </div>
  );
}