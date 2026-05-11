import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import { getMyBids } from '../../services/buyer.services';
import LoadingSpinner from '../components/LoadingSpinner';
import { Gavel, Clock3, CheckCircle2 } from 'lucide-react';
import './BuyerDashboard.css';

export default function MyBids() {
  const [auctionsWithBids, setAuctionsWithBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyBids(true);

    // Setup Socket.io for real-time bid updates
    const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'https://drivebidrent.onrender.com';
    const socket = io(backendUrl, { withCredentials: true });

    socket.on('global_new_bid', () => {
      fetchMyBids(false);
    });

    return () => socket.disconnect();
  }, []);

  const fetchMyBids = async (isInitial = false) => {
    try {
      const data = await getMyBids();
      setAuctionsWithBids(data);
      setError('');
    } catch {
      setError('Failed to load your bids.');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const ongoingBids = useMemo(
    () => auctionsWithBids.filter((item) => item.bidStatus === 'active' || item.bidStatus === 'pending'),
    [auctionsWithBids]
  );

  const completedBids = useMemo(
    () => auctionsWithBids.filter((item) => item.bidStatus === 'ended'),
    [auctionsWithBids]
  );

  const getStatusStyle = (status) => {
    if (status === 'active') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (status === 'pending') return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-slate-100 text-slate-700 border border-slate-200';
  };

  const getStatusText = (status) => {
    if (status === 'active') return 'Ongoing';
    if (status === 'pending') return 'Not Started';
    return 'Completed';
  };

  const getCompletionOutcome = (auctionBid) => {
    if (auctionBid.bidStatus !== 'ended') return null;
    if (auctionBid.highestBid == null || auctionBid.myHighestBid == null) return null;
    return Number(auctionBid.myHighestBid) >= Number(auctionBid.highestBid) ? 'Won' : 'Outbid';
  };

  if (loading) return <LoadingSpinner />;

  const renderBidCard = (auctionBid, completed = false) => {
    const outcome = getCompletionOutcome(auctionBid);

    return (
      <div
        key={auctionBid.auction?._id}
        className="animate-fade-in-up rounded-[2rem] border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-80 w-full p-4 pb-0 lg:pb-4">
            <div className="h-56 overflow-hidden rounded-2xl bg-slate-100">
              <img
                src={auctionBid.auction?.vehicleImage}
                alt={auctionBid.auction?.vehicleName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/400x300/f3f4f6/6b7280?text=No+Image';
                }}
              />
            </div>
          </div>

          <div className="flex-1 p-6 lg:p-7 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {auctionBid.auction?.vehicleName}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Seller: {auctionBid.seller?.firstName} {auctionBid.seller?.lastName}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyle(auctionBid.bidStatus)}`}>
                    {getStatusText(auctionBid.bidStatus)}
                  </span>
                  {outcome && (
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${outcome === 'Won' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {outcome}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1">Your Highest Bid</p>
                  <p className="text-2xl font-black text-slate-900">₹{auctionBid.myHighestBid?.toLocaleString()}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                    {completed ? 'Final Highest Bid' : 'Current Highest Bid'}
                  </p>
                  <p className="text-2xl font-black text-slate-900">
                    ₹{auctionBid.highestBid != null ? auctionBid.highestBid.toLocaleString() : '0'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1">Total Bids</p>
                  <p className="text-2xl font-black text-slate-900">{auctionBid.totalBids}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={`/buyer/auctions/${auctionBid.auction?._id}`}
                className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
              >
                View Auction
              </Link>

              {!completed && auctionBid.bidStatus === 'active' && (
                <Link
                  to={`/buyer/auctions/${auctionBid.auction?._id}`}
                  className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg shadow-orange-100 transition-colors"
                >
                  Place New Bid
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes heroReveal {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatDot {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
          50% { transform: translateY(-18px) scale(1.2); opacity: 0.9; }
        }
      `}</style>

      <div className="min-h-screen bg-slate-50">
        <section
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #0c1220 0%, #111827 50%, #0c1628 100%)',
            paddingTop: 80,
            paddingBottom: 60,
            overflow: 'hidden',
          }}
        >
          {[
            { top: '20%', left: '5%', size: 180, color: 'rgba(249,115,22,0.08)', delay: '0s' },
            { top: '60%', left: '70%', size: 240, color: 'rgba(56,189,248,0.08)', delay: '1.2s' },
            { top: '10%', left: '85%', size: 120, color: 'rgba(249,115,22,0.05)', delay: '0.6s' },
          ].map((orb, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: orb.top,
                left: orb.left,
                width: orb.size,
                height: orb.size,
                borderRadius: '50%',
                background: orb.color,
                filter: 'blur(40px)',
                animation: `floatDot ${4 + i}s ease-in-out infinite`,
                animationDelay: orb.delay,
                pointerEvents: 'none',
              }}
            />
          ))}

          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div style={{ animation: 'heroReveal 0.6s ease forwards' }}>
                <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-400/30 px-4 py-1.5 rounded-full mb-4">
                  <Gavel size={13} className="text-orange-400" />
                  <span className="text-[11px] uppercase tracking-[0.12em] text-orange-300 font-bold">Bid Activity</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">
                  My <span className="text-orange-500 italic">Bids</span>
                </h1>
                <p className="mt-3 text-slate-300 max-w-xl text-sm md:text-base leading-relaxed">
                  Watch ongoing auctions and review completed cars where you participated.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md px-5 py-4 min-w-[150px]">
                  <div className="text-3xl font-black text-white leading-none">{ongoingBids.length}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-wider text-slate-400 font-bold">Ongoing</div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md px-5 py-4 min-w-[150px]">
                  <div className="text-3xl font-black text-white leading-none">{completedBids.length}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-wider text-slate-400 font-bold">Completed</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <main className="max-w-[1440px] mx-auto px-6 lg:px-12 py-14">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 mb-8">
              <p className="text-rose-700 text-sm font-semibold">{error}</p>
            </div>
          )}

          {!auctionsWithBids.length ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white py-20 px-8 text-center">
              <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-6">
                <Gavel className="w-9 h-9 text-slate-300" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-2">No Bids Yet</h3>
              <p className="text-slate-500 mb-8">You have not participated in any auctions yet.</p>
              <Link
                to="/buyer/auctions"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
              >
                Explore Available Auctions
              </Link>
            </div>
          ) : (
            <div className="space-y-14">
              <section>
                <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                      <Clock3 size={20} />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">Ongoing Participations</h2>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{ongoingBids.length} auctions</span>
                </div>

                {ongoingBids.length ? (
                  <div className="space-y-6">{ongoingBids.map((auctionBid) => renderBidCard(auctionBid, false))}</div>
                ) : (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 px-5 py-4 text-emerald-700 font-medium">
                    No ongoing auctions right now.
                  </div>
                )}
              </section>

              <section>
                <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                      <CheckCircle2 size={20} />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">Completed Participations</h2>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{completedBids.length} auctions</span>
                </div>

                {completedBids.length ? (
                  <div className="space-y-6">{completedBids.map((auctionBid) => renderBidCard(auctionBid, true))}</div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-100/60 px-5 py-4 text-slate-700 font-medium">
                    No completed participations yet.
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
