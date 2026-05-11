// client/src/pages/auctionManager/PendingCarDetails.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';
import LoadingSpinner from '../components/LoadingSpinner';
import ApproveAuctionModal from './components/ApproveAuctionModal';

/* ─── Shared mini components ─────────────────────────────────── */
function DocRow({ label, value, badge }) {
  const badgeStyle = {
    valid: { background: '#dcfce7', color: '#15803d' },
    invalid: { background: '#fee2e2', color: '#b91c1c' },
    neutral: { background: '#f1f5f9', color: '#475569' },
  };
  const bs = badge ? (badgeStyle[badge] || badgeStyle.neutral) : null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</span>
      {bs ? (
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.06em', ...bs }}>{value}</span>
      ) : (
        <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{value || 'N/A'}</span>
      )}
    </div>
  );
}

function DocCard({ title, accentColor = '#3b82f6', children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 24px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 10, background: '#fafafa' }}>
        <div style={{ width: 4, height: 18, borderRadius: 4, background: accentColor }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</span>
      </div>
      <div style={{ padding: '4px 24px 16px' }}>{children}</div>
    </div>
  );
}

function DocLink({ href, label }) {
  if (!href) return null;
  return (
    <a
      href={href} target="_blank" rel="noopener noreferrer"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', textDecoration: 'none', color: '#0f172a', fontSize: 13, fontWeight: 600, transition: 'all 0.18s', marginBottom: 6 }}
      onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.color = '#1d4ed8'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: '#64748b', flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {label}
      </span>
      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ flexShrink: 0, opacity: 0.4 }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function PendingCarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const res = await auctionManagerServices.getPendingCarDetails(id);
        const data = res.data || res;
        if (data.success) {
          setCar(data.data);
          setStatus(data.data.status || 'pending');
        } else {
          setError(data.message || 'Failed to load details');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  /* Reject (no modal needed) */
  const handleReject = async () => {
    if (!confirm('Confirm: REJECT this vehicle request?')) return;
    try {
      setActionLoading(true);
      const res = await auctionManagerServices.updateStatus(id, 'rejected');
      if (res.data?.success || res.success) {
        setStatus('rejected');
      } else {
        alert(res.data?.message || res.message || 'Failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  /* Called when manager confirms approval with a starting bid */
  const handleApproveConfirm = async (startingBid) => {
    setShowApproveModal(false);
    try {
      setActionLoading(true);
      const res = await auctionManagerServices.updateStatus(id, 'approved', startingBid);
      if (res.data?.success || res.success) {
        setStatus('approved');
        navigate('/auctionmanager/approved');
      } else {
        alert(res.data?.message || res.message || 'Failed to approve');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error || !car) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '40px 48px', border: '1px solid #fee2e2', textAlign: 'center', maxWidth: 420 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Could not load vehicle</p>
          <p style={{ fontSize: 14, color: '#64748b' }}>{error || 'Vehicle not found'}</p>
        </div>
      </div>
    );
  }

  const hasMultipoint = !!car.multipointInspection;
  const hasOldReview = car.mechanicReview?.mechanicalCondition && car.mechanicReview?.bodyCondition;
  const hasFullReview = hasMultipoint || hasOldReview;

  const doc = car.vehicleDocumentation || {};

  const allImages = (() => {
    const imgs = [];
    if (car.mainImage) imgs.push(car.mainImage);
    else if (car.vehicleImage) imgs.push(car.vehicleImage);
    if (car.additionalImages?.length > 0) imgs.push(...car.additionalImages);
    else if (car.vehicleImages?.length > 0) {
      imgs.push(...car.vehicleImages.filter(i => i !== car.vehicleImage && i !== car.mainImage));
    }
    return imgs.length > 0 ? imgs : ['https://via.placeholder.com/800x500?text=Vehicle+Image'];
  })();

  /* All document links */
  const allDocs = [
    { label: 'Registration Certificate (RC)', url: doc.registrationCertificate },
    { label: 'Insurance Document', url: doc.insuranceDocument },
    { label: 'Fitness Certificate', url: doc.fitnessCertificate },
    { label: 'RC Transfer Form 29', url: doc.rcTransferForm29 },
    { label: 'Road Tax Receipt', url: doc.roadTaxReceipt },
    { label: 'Address Proof', url: doc.addressProof },
  ].filter(d => d.url);

  const statusBadge = {
    approved: { label: 'Approved', bg: '#dcfce7', color: '#15803d' },
    rejected: { label: 'Rejected', bg: '#fee2e2', color: '#b91c1c' },
    pending: { label: 'Pending Review', bg: '#fef9c3', color: '#92400e' },
    assignedMechanic: { label: 'Under Inspection', bg: '#e0f2fe', color: '#0369a1' },
  };
  const _badge = statusBadge[status] || statusBadge.pending;

  return (
    <div className="font-montserrat" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* ── BODY ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 48px 80px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>

        {/* ════ LEFT COLUMN ════════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Vehicle Image Gallery */}
          <div style={{ background: '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
            {/* Main image */}
            <div style={{ position: 'relative', height: 420, background: '#0f172a', overflow: 'hidden' }}>
              <img
                src={allImages[activeImageIndex]}
                alt={car.vehicleName}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s' }}
                onError={e => { e.target.src = 'https://via.placeholder.com/800x500?text=Vehicle+Image'; }}
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 130, background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }} />
              <div style={{ position: 'absolute', bottom: 24, left: 28, right: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Vehicle</p>
                  <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{car.vehicleName}</h2>
                </div>
                {car.carType && (
                  <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '6px 14px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.1em', border: '1px solid rgba(255,255,255,0.2)' }}>
                    {car.carType}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: 10, padding: '14px 20px', overflowX: 'auto', background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                {allImages.map((img, idx) => (
                  <div key={idx} onClick={() => setActiveImageIndex(idx)} style={{ width: 72, height: 52, flexShrink: 0, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', outline: activeImageIndex === idx ? '2px solid #f97316' : '2px solid transparent', outlineOffset: 2, opacity: activeImageIndex === idx ? 1 : 0.55, transition: 'all 0.2s' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Specs row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
              {[
                { label: 'Year', value: car.year || 'N/A' },
                { label: 'Mileage', value: car.mileage ? `${Number(car.mileage).toLocaleString()} km` : 'N/A' },
                { label: 'Fuel', value: car.fuelType || 'N/A' },
                { label: 'Transmission', value: car.transmission || 'N/A' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '18px 20px', textAlign: 'center', borderRight: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                  <p style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 4 }}>{s.label}</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Mechanic Inspection Report ── */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 24px', background: '#fafafa', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 4, height: 18, borderRadius: 4, background: '#f97316' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mechanic Inspection Report</span>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {hasMultipoint ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Rating & Verdict */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: car.multipointInspection.isApprovedForAuction ? '#dcfce7' : '#fee2e2', padding: 16, borderRadius: 14 }}>
                    <div>
                         <p style={{ fontSize: 13, fontWeight: 700, color: car.multipointInspection.isApprovedForAuction ? '#15803d' : '#b91c1c' }}>{car.multipointInspection.isApprovedForAuction ? 'APPROVED FOR AUCTION' : 'REJECTED'}</p>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                        {car.multipointInspection.overallRating} / 10
                    </div>
                  </div>
                  {/* Grid of Sections */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ padding: 12, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 10 }}>
                       <p style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Exterior</p>
                       <p style={{ fontSize: 12, color: '#374151' }}>Paint: {car.multipointInspection.exterior?.paintCondition}/10</p>
                       <p style={{ fontSize: 12, color: '#374151' }}>Tires: {car.multipointInspection.exterior?.tiresCondition}</p>
                    </div>
                    <div style={{ padding: 12, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 10 }}>
                       <p style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Interior</p>
                       <p style={{ fontSize: 12, color: '#374151' }}>Seats: {car.multipointInspection.interior?.seatsCondition}</p>
                       <p style={{ fontSize: 12, color: '#374151' }}>Dashboard: {car.multipointInspection.interior?.dashboardCondition}</p>
                    </div>
                    <div style={{ padding: 12, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 10 }}>
                       <p style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Engine</p>
                       <p style={{ fontSize: 12, color: '#374151' }}>Startup: {car.multipointInspection.engine?.startupSmoothness}</p>
                       <p style={{ fontSize: 12, color: '#374151' }}>Battery: {car.multipointInspection.engine?.batteryHealth}</p>
                    </div>
                    <div style={{ padding: 12, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 10 }}>
                       <p style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Test Drive</p>
                       <p style={{ fontSize: 12, color: '#374151' }}>Brakes: {car.multipointInspection.testDrive?.brakesCondition}</p>
                       <p style={{ fontSize: 12, color: '#374151' }}>Steering: {car.multipointInspection.testDrive?.steeringFeel}</p>
                    </div>
                  </div>
                  <div style={{ padding: 16, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Mechanic Summary</p>
                    <p style={{ fontSize: 13, color: '#7c2d12', lineHeight: 1.6 }}>{car.multipointInspection.mechanicSummary}</p>
                  </div>
                </div>
              ) : hasOldReview ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Mechanical Condition', value: car.mechanicReview.mechanicalCondition },
                    { label: 'Body & Exterior', value: car.mechanicReview.bodyCondition },
                    { label: 'Recommendations', value: car.mechanicReview.recommendations || 'No additional notes.' },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: 16, borderRadius: 14, background: i === 2 ? '#fff7ed' : '#f8fafc', border: `1px solid ${i === 2 ? '#fed7aa' : '#f1f5f9'}` }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: i === 2 ? '#92400e' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{item.label}</p>
                      <p style={{ fontSize: 14, color: i === 2 ? '#7c2d12' : '#374151', lineHeight: 1.7 }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '40px 24px', textAlign: 'center', background: '#f8fafc', borderRadius: 14, border: '1px dashed #e2e8f0' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Inspection Pending</p>
                  <p style={{ fontSize: 13, color: '#94a3b8' }}>Mechanic has not submitted the full report yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Documentation ── */}
          {car.vehicleDocumentation && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.12em', paddingBottom: 10, borderBottom: '1px solid #e2e8f0' }}>Documentation Overview</h3>

              {/* Document links */}
              {allDocs.length > 0 && (
                <DocCard title="Vehicle Documents" accentColor="#0ea5e9">
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, marginBottom: 12 }}>Click to open document in a new tab</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>
                    {allDocs.map((d, i) => <DocLink key={i} href={d.url} label={d.label} />)}
                  </div>
                </DocCard>
              )}

              {/* Registration */}
              <DocCard title="Registration & Ownership" accentColor="#3b82f6">
                <DocRow label="Reg. Number" value={doc.registrationNumber} />
                <DocRow label="State" value={doc.registrationState} />
                <DocRow label="VIN Number" value={doc.vinNumber} />
                <DocRow label="Chassis No." value={doc.chassisNumber} />
                <DocRow label="Engine No." value={doc.engineNumber} />
                <DocRow label="Ownership Type" value={doc.ownershipType} />
              </DocCard>

              {/* Insurance + Service side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <DocCard title="Insurance" accentColor="#6366f1">
                  <DocRow label="Status" value={doc.insuranceStatus} badge={doc.insuranceStatus === 'Valid' ? 'valid' : doc.insuranceStatus ? 'invalid' : null} />
                  <DocRow label="Expiry Date" value={doc.insuranceExpiryDate ? new Date(doc.insuranceExpiryDate).toLocaleDateString() : null} />
                  <DocRow label="Type" value={doc.insuranceType} />
                  {doc.previousInsuranceClaims && (
                    <div style={{ marginTop: 8, padding: '10px 12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10 }}>
                      <p style={{ fontSize: 12, color: '#92400e' }}>{doc.insuranceClaimDetails}</p>
                    </div>
                  )}
                </DocCard>

                <DocCard title="Service & History" accentColor="#f97316">
                  <DocRow label="Last Service" value={doc.lastServiceDate ? new Date(doc.lastServiceDate).toLocaleDateString() : null} />
                  <DocRow label="Service Book" value={doc.serviceBookAvailable ? 'Available' : 'No'} />
                  <DocRow label="Accident History" value={doc.accidentHistory ? `Yes (${doc.numberOfAccidents || ''} reported)` : 'No Accidents'} badge={doc.accidentHistory ? 'invalid' : 'valid'} />
                  <DocRow label="Major Repairs" value={doc.majorRepairs ? 'Yes' : 'No'} badge={doc.majorRepairs ? 'invalid' : 'valid'} />
                </DocCard>
              </div>

              {/* Legal & Transfer */}
              <DocCard title="Legal & Transfer Status" accentColor="#14b8a6">
                <DocRow label="Hypothecation" value={doc.hypothecationStatus} />
                <DocRow label="NOC Available" value={doc.nocAvailable ? 'Yes' : 'No'} badge={doc.nocAvailable ? 'valid' : 'invalid'} />
                <DocRow label="Stolen Check" value={doc.stolenVehicleCheck} />
                <DocRow label="Court Cases" value={doc.courtCases ? 'Pending' : 'None'} badge={doc.courtCases ? 'invalid' : 'valid'} />
                <DocRow label="PUC / Pollution" value={doc.pollutionCertificate} badge={doc.pollutionCertificate === 'Valid' ? 'valid' : doc.pollutionCertificate ? 'invalid' : null} />
                <DocRow label="RC Transfer Ready" value={doc.readyForTransfer ? 'Yes' : 'No'} badge={doc.readyForTransfer ? 'valid' : 'invalid'} />
              </DocCard>

              {/* Verification status */}
              <div style={{ padding: '18px 20px', borderRadius: 14, background: doc.documentsVerified ? '#f0fdf4' : '#fffbeb', border: `1.5px solid ${doc.documentsVerified ? '#bbf7d0' : '#fde68a'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: doc.documentsVerified ? '#dcfce7' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: 16, height: 16, color: doc.documentsVerified ? '#16a34a' : '#d97706' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      {doc.documentsVerified
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: doc.documentsVerified ? '#15803d' : '#92400e' }}>
                      {doc.documentsVerified ? 'Documents Verified' : 'Verification Pending'}
                    </p>
                    {doc.verificationDate && <p style={{ fontSize: 12, color: '#94a3b8' }}>On {new Date(doc.verificationDate).toLocaleDateString()}</p>}
                  </div>
                </div>
                {doc.verificationNotes && <p style={{ fontSize: 13, color: '#6b7280', marginTop: 10, lineHeight: 1.6 }}><strong>Notes:</strong> {doc.verificationNotes}</p>}
              </div>
            </div>
          )}
        </div>

        {/* ════ RIGHT COLUMN (sticky) ═══════════════════════════════ */}
        <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Seller's expected amount (dark card) */}
          <div style={{ background: 'linear-gradient(140deg, #0f172a 0%, #1e293b 100%)', borderRadius: 20, padding: '28px 28px 24px', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.22)' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(249,115,22,0.15)', filter: 'blur(30px)', pointerEvents: 'none' }} />
            <p style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>Seller's Expected Amount</p>
            <p style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.8px', lineHeight: 1 }}>
              {car.expectedBid ? `₹${Number(car.expectedBid).toLocaleString('en-IN')}` : 'Not specified'}
            </p>
            <p style={{ fontSize: 11, color: '#475569', marginTop: 12, lineHeight: 1.6 }}>
              Amount that seller expects.
            </p>
          </div>

          {/* Action card */}
          <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <div style={{ height: 3, background: 'linear-gradient(90deg, #f97316, #ea580c)' }} />
            <div style={{ padding: 24 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.3px' }}>Final Decision</h3>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, marginBottom: 20 }}>
                Review documents and review
              </p>

              {status === 'approved' ? (
                <div style={{ padding: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, textAlign: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#15803d', marginBottom: 4 }}>Approved for Auction</p>
                  <p style={{ fontSize: 13, color: '#16a34a' }}>This car has been queued for live auction.</p>
                </div>
              ) : status === 'rejected' ? (
                <div style={{ padding: '20px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 14, textAlign: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#be123c', marginBottom: 4 }}>Request Rejected</p>
                  <p style={{ fontSize: 13, color: '#e11d48' }}>This vehicle submission has been denied.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {!hasFullReview && (
                    <div style={{ display: 'flex', gap: 10, padding: '12px 14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16, color: '#f97316', flexShrink: 0, marginTop: 1 }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>Mechanic review pending to approve</p>
                    </div>
                  )}

                  {/* Approve button */}
                  <button
                    onClick={() => setShowApproveModal(true)}
                    disabled={!hasFullReview || actionLoading}
                    style={{
                      padding: '14px', borderRadius: 12, border: 'none',
                      background: !hasFullReview ? '#e2e8f0' : 'linear-gradient(135deg, #16a34a, #15803d)',
                      color: !hasFullReview ? '#94a3b8' : '#fff',
                      fontSize: 14, fontWeight: 700, cursor: !hasFullReview ? 'not-allowed' : 'pointer',
                      boxShadow: hasFullReview ? '0 6px 20px -4px rgba(22,163,74,0.45)' : 'none',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if (hasFullReview) { e.currentTarget.style.boxShadow = '0 10px 28px -6px rgba(22,163,74,0.55)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = hasFullReview ? '0 6px 20px -4px rgba(22,163,74,0.45)' : 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {actionLoading ? 'Processing…' : 'Approve for Auction'}
                  </button>

                  {/* Reject button */}
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    style={{ padding: '13px', borderRadius: 12, border: '1.5px solid #fecdd3', background: '#fff', color: '#be123c', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                  >
                    Reject Request
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Seller info */}
          {car.sellerId && (
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', padding: 22 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Seller Profile</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                  {car.sellerId.firstName?.charAt(0) || 'S'}
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{car.sellerId.firstName} {car.sellerId.lastName}</p>
                  <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Verified Owner</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 13, height: 13, color: '#94a3b8', flexShrink: 0 }} viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 500, wordBreak: 'break-all' }}>{car.sellerId.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 13, height: 13, color: '#94a3b8', flexShrink: 0 }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{car.sellerId.city || 'Location not specified'}</span>
                </div>
              </div>
              {car.sellerId.phone ? (
                <a href={`tel:${car.sellerId.phone}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 14, height: 14 }} viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                  Call Seller
                </a>
              ) : (
                <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No phone number on file</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Approve Modal ─ */}
      <ApproveAuctionModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApproveConfirm}
        suggestedBid={car.expectedBid}
        vehicleName={car.vehicleName}
      />
    </div>
  );
}