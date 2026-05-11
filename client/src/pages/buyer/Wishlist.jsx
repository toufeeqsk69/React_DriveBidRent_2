import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Gavel, 
  Clock, 
  Users, 
  Zap,
  ArrowUpRight,
  Heart
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import CarCard from './components/CarCard';
import useWishlist from '../../hooks/useWishlist';
import './BuyerDashboard.css';

/* ─── Animated Counter ─────────────────────────────────────────────────── */
function AnimatedCounter({ value }) {
  const [display, setDisplay] = useState(value);
  const [animating, setAnimating] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value === prevRef.current) return;
    const from = prevRef.current;
    const to = value;
    prevRef.current = value;

    const duration = 600;
    const steps = Math.abs(from - to);
    if (steps === 0) return;

    const stepDuration = duration / steps;
    const direction = to > from ? 1 : -1;
    let current = from;
    setAnimating(true);

    const interval = setInterval(() => {
      current += direction;
      setDisplay(current);
      if (current === to) {
        clearInterval(interval);
        setTimeout(() => setAnimating(false), 150);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <span
      style={{
        display: 'inline-block',
        transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1), color 0.3s ease',
        transform: animating ? 'scale(1.25)' : 'scale(1)',
        color: animating ? '#f97316' : 'inherit',
      }}
    >
      {display}
    </span>
  );
}

/* ─── Empty State ───────────────────────────────────────────────────────── */
const EmptyState = ({ message, icon: _Icon, type }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 24px',
    borderRadius: '24px',
    background: type === 'auction'
      ? 'linear-gradient(135deg, #fff7ed 0%, #ffffff 60%, #fef3c7 100%)'
      : 'linear-gradient(135deg, #eef2ff 0%, #ffffff 60%, #e0e7ff 100%)',
    border: `1px solid ${type === 'auction' ? '#fed7aa' : '#c7d2fe'}`,
    animation: 'fadeSlideUp 0.5s ease forwards',
  }}>
    <div style={{
      width: 72,
      height: 72,
      borderRadius: '50%',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      marginBottom: 20,
      color: type === 'auction' ? '#fb923c' : '#818cf8',
    }}>
      <_Icon size={28} strokeWidth={1.5} />
    </div>
    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8, letterSpacing: '-0.3px' }}>
      Nothing here yet
    </h3>
    <p style={{ color: '#6b7280', textAlign: 'center', maxWidth: 300, lineHeight: 1.6, fontSize: 14 }}>
      {message}
    </p>
  </div>
);

/* ─── Animated Card Wrapper ─────────────────────────────────────────────── */
const AnimatedCard = ({ children, isRemoving }) => (
  <div style={{
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: isRemoving ? 0 : 1,
    transform: isRemoving ? 'scale(0.88) translateY(-12px)' : 'scale(1) translateY(0)',
    filter: isRemoving ? 'blur(4px)' : 'blur(0px)',
    pointerEvents: isRemoving ? 'none' : 'auto',
  }}>
    {children}
  </div>
);

/* ─── Section Header ────────────────────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, title, accent, accentColor, linkTo, linkLabel, _linkHoverColor }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottom: '1px solid #f1f5f9',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: Icon ? 16 : 0 }}>
      {Icon && (
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 16,
          background: accentColor === 'orange' ? '#fff7ed' : '#eef2ff',
          border: `1px solid ${accentColor === 'orange' ? '#fed7aa' : '#c7d2fe'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accentColor === 'orange' ? '#f97316' : '#6366f1',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <Icon size={20} />
        </div>
      )}
      <h2 style={{
        fontSize: 32,
        fontWeight: 800,
        color: '#0f172a',
        letterSpacing: '-0.8px',
        lineHeight: 1.1,
        fontFamily: "'Georgia', serif",
      }}>
        {title}{' '}
        <span style={{
          color: accentColor === 'orange' ? '#f97316' : '#6366f1',
          fontStyle: 'italic',
        }}>
          {accent}
        </span>
      </h2>
    </div>

    <Link
      to={linkTo}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: '#64748b',
        textDecoration: 'none',
        background: '#fff',
        border: '1px solid #e2e8f0',
        padding: '10px 20px',
        borderRadius: 12,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'all 0.25s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = accentColor === 'orange' ? '#f97316' : '#6366f1';
        e.currentTarget.style.borderColor = accentColor === 'orange' ? '#fed7aa' : '#c7d2fe';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = '#64748b';
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
      }}
    >
      {linkLabel}
      <ArrowUpRight size={14} />
    </Link>
  </div>
);

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function Wishlist() {
  const { auctions, rentals, loading, removeFromWishlist, loadWishlist } = useWishlist();
  const [removingIds, setRemovingIds] = useState(new Set());

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const removeFromWishlistHandler = useCallback((id, type) => {
    setRemovingIds(prev => new Set(prev).add(id));
    setTimeout(() => {
      removeFromWishlist(id, type);
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 480);
  }, [removeFromWishlist]);

  const visibleAuctionCount = (auctions?.length || 0) -
    [...removingIds].filter(id => auctions?.some(a => (a._id || a.id) === id)).length;
  const visibleRentalCount = (rentals?.length || 0) -
    [...removingIds].filter(id => rentals?.some(r => (r._id || r.id) === id)).length;

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroReveal {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatDot {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
          50%       { transform: translateY(-18px) scale(1.2); opacity: 0.9; }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes pillPop {
          0%   { transform: scale(0.9); opacity: 0; }
          60%  { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }

        .wl-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        
        .wl-card-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 24px;
        }
        @media (min-width: 768px) {
          .wl-card-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1280px) {
          .wl-card-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 640px) {
          .wl-discover-link { display: none !important; }
        }

        .wl-section-box {
          border-radius: 28px;
          padding: 28px;
          transition: box-shadow 0.3s ease;
        }
        .wl-section-box:hover {
          box-shadow: 0 20px 60px rgba(0,0,0,0.07);
        }

        .stat-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          border-radius: 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          animation: pillPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
          transition: background 0.25s ease;
        }
        .stat-pill:hover { background: rgba(255,255,255,0.12); }
      `}</style>

      <div className="wl-root" style={{ background: '#f8fafc', minHeight: '100vh' }}>

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #0c1220 0%, #111827 50%, #0c1628 100%)',
          paddingTop: 80,
          paddingBottom: 60,
          overflow: 'hidden',
        }}>
          {/* Decorative floating orbs */}
          {[
            { top: '20%', left: '5%', size: 180, color: 'rgba(249,115,22,0.08)', delay: '0s' },
            { top: '60%', left: '70%', size: 240, color: 'rgba(99,102,241,0.07)', delay: '1.2s' },
            { top: '10%', left: '85%', size: 120, color: 'rgba(249,115,22,0.05)', delay: '0.6s' },
          ].map((orb, i) => (
            <div key={i} style={{
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
            }} />
          ))}

          {/* Subtle dot grid */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />

          <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px', position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
              
              {/* Title block */}
              <div style={{ animation: 'heroReveal 0.6s ease forwards' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)',
                  padding: '6px 14px', borderRadius: 100, marginBottom: 16,
                }}>
                  <Heart size={12} style={{ color: '#fb923c' }} fill="#fb923c" />

                </div>

                <h1 style={{
                  fontSize: 'clamp(36px, 5vw, 56px)',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-1.5px',
                  lineHeight: 1.05,
                  marginBottom: 12,
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}>
                  Your{' '}
                  <span style={{
                    color: '#f97316',
                    fontStyle: 'italic',
                    position: 'relative',
                  }}>
                    Wishlist
                  </span>
                </h1>
                <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 420, lineHeight: 1.7, fontWeight: 400 }}>
                  Track your favorite auctions and rentals. Everything you've saved, all in one place.
                </p>
              </div>

              {/* Stat pills */}
              <div style={{ display: 'flex', gap: 12 }}>
                <div className="stat-pill" style={{ animationDelay: '0.15s' }}>
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                      <AnimatedCounter value={visibleAuctionCount} />
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
                      Auctions
                    </div>
                  </div>
                  <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)' }} />
                  <Gavel size={18} style={{ color: '#f97316', opacity: 0.8 }} />
                </div>

                <div className="stat-pill" style={{ animationDelay: '0.25s' }}>
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                      <AnimatedCounter value={visibleRentalCount} />
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
                      Rentals
                    </div>
                  </div>
                  <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)' }} />
                  <Users size={18} style={{ color: '#818cf8', opacity: 0.8 }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
        <main style={{ maxWidth: 1440, margin: '0 auto', padding: '56px 48px', }}>

          {/* AUCTIONS */}
          <section style={{ marginBottom: 56 }}>
            <SectionHeader
              title="Tracked"
              accent="Auctions"
              accentColor="orange"
              linkTo="/buyer/auctions"
              linkLabel="Discover more Cars"
            />

            {!auctions || auctions.length === 0 ? (
              <EmptyState
                message="No auctions saved yet."
                icon={Clock}
                type="auction"
              />
            ) : (
              <div
                className="wl-section-box"
                style={{
                  background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #fffbf5 100%)',
                  border: '1px solid #fed7aa',
                  boxShadow: '0 8px 32px rgba(249,115,22,0.08)',
                }}
              >
                <div className="wl-card-grid">
                  {auctions.map((auction, idx) => {
                    const id = auction?._id || auction?.id || `auction-${idx}`;
                    return (
                      <AnimatedCard key={id} isRemoving={removingIds.has(id)}>
                        <CarCard
                          item={auction}
                          type="auction"
                          isInWishlist={true}
                          onToggleWishlist={() => removeFromWishlistHandler(id, 'auction')}
                        />
                      </AnimatedCard>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* RENTALS */}
          <section style={{ paddingBottom: 40 }}>
            <SectionHeader
              title="Rental"
              accent="Selection"  
              accentColor="indigo"
              linkTo="/buyer/rentals"
              linkLabel="Discover Rentals"
            />

            {!rentals || rentals.length === 0 ? (
              <EmptyState
                message="No rentals Saved Yet. "
                icon={Clock}
                type="rental"
              />
            ) : (
              <div
                className="wl-section-box"
                style={{
                  background: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 50%, #f5f3ff 100%)',
                  border: '1px solid #c7d2fe',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.08)',
                }}
              >
                <div className="wl-card-grid">
                  {rentals.map((rental, idx) => {
                    const id = rental?._id || rental?.id || `rental-${idx}`;
                    return (
                      <AnimatedCard key={id} isRemoving={removingIds.has(id)}>
                        <CarCard
                          item={rental}
                          type="rental"
                          returnPath="/buyer/wishlist"
                          isInWishlist={true}
                          onToggleWishlist={() => removeFromWishlistHandler(id, 'rental')}
                        />
                      </AnimatedCard>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}