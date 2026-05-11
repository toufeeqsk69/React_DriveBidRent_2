// client/src/pages/mechanic/components/CurrentTaskCard.jsx
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Calendar, Gauge, Car, ShieldCheck, ArrowRight } from 'lucide-react';

export default function CurrentTaskCard({ vehicle }) {
  const [imgError, setImgError] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'https://drivebidrent.onrender.com';
  const imgSrc = vehicle.vehicleImage?.startsWith('http')
    ? vehicle.vehicleImage
    : `${backendUrl}${vehicle.vehicleImage}`;

  const s = {
    card: {
      background: '#fff',
      borderRadius: 20,
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      transition: 'all 0.25s ease',
    },
    imageWrap: {
      position: 'relative',
      height: 200,
      overflow: 'hidden',
      background: '#f3f4f6',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.5s ease',
    },
    placeholder: {
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
      color: '#94a3b8',
    },
    badge: {
      position: 'absolute', top: 14, left: 14, zIndex: 2,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 8,
      background: 'rgba(59,130,246,0.9)',
      backdropFilter: 'blur(8px)',
      color: '#fff', fontSize: 10, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.08em',
    },
    pulseDot: {
      width: 6, height: 6, borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 0 0 2px rgba(255,255,255,0.3)',
      animation: 'pulse 2s ease-in-out infinite',
    },
    body: {
      padding: 24, flex: 1,
      display: 'flex', flexDirection: 'column',
    },
    title: {
      fontSize: 18, fontWeight: 800, color: '#111827',
      marginBottom: 16,
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    },
    grid: {
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: 10, marginBottom: 20,
    },
    infoCell: {
      background: '#f9fafb', borderRadius: 12,
      padding: '12px 14px', border: '1px solid #f3f4f6',
      display: 'flex', alignItems: 'center', gap: 10,
    },
    infoIcon: {
      width: 32, height: 32, borderRadius: 9,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    },
    infoLabel: {
      fontSize: 10, fontWeight: 700, color: '#9ca3af',
      textTransform: 'uppercase', letterSpacing: '0.05em',
    },
    infoValue: {
      fontSize: 14, fontWeight: 800, color: '#111827',
    },
    cta: {
      marginTop: 'auto', paddingTop: 16,
      borderTop: '1px solid #f3f4f6',
    },
    btn: {
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      width: '100%', padding: '12px 0',
      background: '#111827', color: '#fff',
      borderRadius: 12, fontSize: 13, fontWeight: 700,
      textDecoration: 'none',
      transition: 'background 0.2s ease',
    },
  };

  return (
    <div style={s.card}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
    >
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Image */}
      <div style={s.imageWrap}>
        <div style={s.badge}>
          <span style={s.pulseDot} />
          ASSIGNED
        </div>
        {imgError || !vehicle.vehicleImage ? (
          <div style={s.placeholder}>
            <Car size={40} strokeWidth={1.2} />
            <span style={{ fontSize: 12, fontWeight: 600, marginTop: 8 }}>{vehicle.vehicleName}</span>
          </div>
        ) : (
          <img
            src={imgSrc}
            alt={vehicle.vehicleName}
            style={s.image}
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* Body */}
      <div style={s.body}>
        <h3 style={s.title}>{vehicle.vehicleName}</h3>

        <div style={s.grid}>
          <div style={s.infoCell}>
            <div style={{ ...s.infoIcon, background: '#eff6ff', color: '#3b82f6' }}>
              <Calendar size={15} />
            </div>
            <div>
              <div style={s.infoLabel}>Year</div>
              <div style={s.infoValue}>{vehicle.year}</div>
            </div>
          </div>
          <div style={s.infoCell}>
            <div style={{ ...s.infoIcon, background: '#f0fdf4', color: '#22c55e' }}>
              <Gauge size={15} />
            </div>
            <div>
              <div style={s.infoLabel}>Mileage</div>
              <div style={s.infoValue}>{(vehicle.mileage || 0).toLocaleString()} km</div>
            </div>
          </div>
          <div style={s.infoCell}>
            <div style={{ ...s.infoIcon, background: '#fefce8', color: '#eab308' }}>
              <ShieldCheck size={15} />
            </div>
            <div>
              <div style={s.infoLabel}>Condition</div>
              <div style={{ ...s.infoValue, textTransform: 'capitalize' }}>{vehicle.condition}</div>
            </div>
          </div>
          <div style={s.infoCell}>
            <div style={{ ...s.infoIcon, background: '#fdf2f8', color: '#ec4899' }}>
              <Calendar size={15} />
            </div>
            <div>
              <div style={s.infoLabel}>Auction</div>
              <div style={s.infoValue}>
                {vehicle.auctionDate ? new Date(vehicle.auctionDate).toLocaleDateString() : 'TBD'}
              </div>
            </div>
          </div>
        </div>

        <div style={s.cta}>
          <Link
            to={`/mechanic/car-details/${vehicle._id}`}
            style={s.btn}
            onMouseEnter={e => e.currentTarget.style.background = '#3b82f6'}
            onMouseLeave={e => e.currentTarget.style.background = '#111827'}
          >
            Inspect Vehicle <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}