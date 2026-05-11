// client/src/pages/mechanic/components/PastTaskCard.jsx
import { useState } from 'react';
import { Calendar, Gauge, Star, CheckCircle, Car } from 'lucide-react';

export default function PastTaskCard({ vehicle }) {
  const [imgError, setImgError] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'https://drivebidrent.onrender.com';
  const imgSrc = vehicle.vehicleImage?.startsWith('http')
    ? vehicle.vehicleImage
    : `${backendUrl}${vehicle.vehicleImage}`;

  const rating = vehicle.multipointInspection?.overallRating
    ? `${vehicle.multipointInspection.overallRating}/10`
    : vehicle.mechanicReview?.conditionRating || 'N/A';

  const hasRating = vehicle.multipointInspection?.overallRating || vehicle.mechanicReview?.conditionRating;

  const s = {
    card: {
      background: '#fff', borderRadius: 20,
      border: '1px solid #e5e7eb', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', height: '100%',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      transition: 'all 0.25s ease',
    },
    imageWrap: {
      position: 'relative', height: 200, overflow: 'hidden', background: '#f3f4f6',
    },
    image: {
      width: '100%', height: '100%', objectFit: 'cover',
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
      background: 'rgba(16,185,129,0.9)', backdropFilter: 'blur(8px)',
      color: '#fff', fontSize: 10, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.08em',
    },
    body: { padding: 24, flex: 1, display: 'flex', flexDirection: 'column' },
    title: {
      fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 16,
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 },
    infoCell: {
      background: '#f9fafb', borderRadius: 12,
      padding: '12px 14px', border: '1px solid #f3f4f6',
      display: 'flex', alignItems: 'center', gap: 10,
    },
    infoIcon: {
      width: 32, height: 32, borderRadius: 9,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    infoLabel: { fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' },
    infoValue: { fontSize: 14, fontWeight: 800, color: '#111827' },
    ratingBox: {
      background: '#ecfdf5', borderRadius: 12,
      padding: '14px', border: '1px solid #d1fae5',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      marginBottom: 20,
    },
    footer: {
      marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #f3f4f6',
    },
    btn: {
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      width: '100%', padding: '12px 0',
      background: '#f3f4f6', color: '#6b7280',
      borderRadius: 12, fontSize: 13, fontWeight: 700,
    },
  };

  return (
    <div style={s.card}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
    >
      {/* Image */}
      <div style={s.imageWrap}>
        <div style={s.badge}>
          <CheckCircle size={12} />
          COMPLETED
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
        </div>

        {/* Rating */}
        <div style={s.ratingBox}>
          {hasRating && <Star size={20} fill="#eab308" color="#eab308" />}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rating Given</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#059669' }}>{rating}</div>
          </div>
        </div>

        <div style={s.footer}>
          <div style={s.btn}>
            <CheckCircle size={14} />
            Review Submitted
          </div>
        </div>
      </div>
    </div>
  );
}