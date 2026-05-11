// client/src/pages/auctionManager/AssignMechanic.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';
import LoadingSpinner from '../components/LoadingSpinner';

/* ─── Mini "field row" for docs ─────────────────────────────── */
function DocRow({ label, value, badge }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</span>
      {badge ? (
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
          background: badge === 'valid' ? '#dcfce7' : badge === 'invalid' ? '#fee2e2' : '#f1f5f9',
          color: badge === 'valid' ? '#15803d' : badge === 'invalid' ? '#b91c1c' : '#475569',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>{value}</span>
      ) : (
        <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{value || 'N/A'}</span>
      )}
    </div>
  );
}

/* ─── Section card ────────────────────────────────────────────── */
function DocCard({ title, accentColor = '#3b82f6', children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 24px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 10, background: '#fafafa' }}>
        <div style={{ width: 4, height: 18, borderRadius: 4, background: accentColor }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</span>
      </div>
      <div style={{ padding: '4px 24px 16px' }}>
        {children}
      </div>
    </div>
  );
}

export default function AssignMechanic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [mechanics, setMechanics] = useState([]);
  const [selected, setSelected] = useState('');
  const [assigned, setAssigned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Reject Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectError, setRejectError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await auctionManagerServices.getAssignMechanic(id);
        const responseData = res.data || res;
        if (responseData.success) {
          setRequest(responseData.data.request);
          setMechanics(responseData.data.mechanics || []);
        } else {
          setError(responseData.message || 'Failed to load data');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAssign = async () => {
    if (!selected) { alert('Please select a mechanic'); return; }
    const mechanic = mechanics.find(m => m._id === selected);
    if (!mechanic) { alert('Invalid mechanic selected'); return; }
    try {
      setAssigning(true);
      const res = await auctionManagerServices.assignMechanic(id, {
        mechanicId: selected,
        mechanicName: `${mechanic.firstName} ${mechanic.lastName}`,
      });
      const responseData = res.data || res;
      if (responseData.success) {
        setAssigned(true);
        const chat = responseData.data?.chat;
        if (chat?._id) navigate(`/auctionmanager/chats/${chat._id}`);
      } else {
        alert(responseData.message || 'Failed to assign mechanic');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign mechanic');
    } finally {
      setAssigning(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setRejectError('A rejection reason is required.');
      return;
    }
    setIsRejecting(true);
    setRejectError('');
    try {
      const res = await auctionManagerServices.rejectRequest(id, rejectReason);
      const responseData = res.data || res;
      if (responseData.success) {
        setShowRejectModal(false);
        navigate('/auctionmanager/requests');
      } else {
        setRejectError(responseData.message || 'Failed to reject request');
      }
    } catch (err) {
      setRejectError(err.response?.data?.message || 'Failed to reject request. Please try again.');
    } finally {
      setIsRejecting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '40px 48px', border: '1px solid #fee2e2', textAlign: 'center', maxWidth: 420 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 22, height: 22, color: '#dc2626' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Could not load request</p>
          <p style={{ fontSize: 14, color: '#64748b' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!request) return null;

  const allImages = (() => {
    const imgs = [];
    if (request.mainImage) imgs.push(request.mainImage);
    else if (request.vehicleImage) imgs.push(request.vehicleImage);
    if (request.additionalImages?.length > 0) imgs.push(...request.additionalImages);
    else if (request.vehicleImages?.length > 0) {
      imgs.push(...request.vehicleImages.filter(i => i !== request.vehicleImage && i !== request.mainImage));
    }
    return imgs.length > 0 ? imgs : ['https://via.placeholder.com/800x500?text=Vehicle+Image'];
  })();

  const doc = request.vehicleDocumentation || {};
  const insuranceBadge = doc.insuranceStatus === 'Valid' ? 'valid' : doc.insuranceStatus ? 'invalid' : null;
  const accidentBadge = doc.accidentHistory === 'no' ? 'valid' : doc.accidentHistory ? 'invalid' : null;
  const pucBadge = doc.pollutionCertificate === 'Valid' ? 'valid' : doc.pollutionCertificate ? 'invalid' : null;

  // Collect all downloadable document links (same pattern as AuctionDetails)
  const getDocuments = () => {
    const list = [];
    if (doc.registrationCertificate) list.push({ label: 'Registration Certificate (RC)', url: doc.registrationCertificate });
    if (doc.insuranceCertificate) list.push({ label: 'Insurance Certificate', url: doc.insuranceCertificate });
    if (doc.insuranceDocument) list.push({ label: 'Insurance Document', url: doc.insuranceDocument });
    if (doc.fitnessCertificate) list.push({ label: 'Fitness Certificate', url: doc.fitnessCertificate });
    if (doc.rcTransferForm29) list.push({ label: 'RC Transfer Form 29', url: doc.rcTransferForm29 });
    if (doc.roadTaxReceipt) list.push({ label: 'Road Tax Receipt', url: doc.roadTaxReceipt });
    if (doc.addressProof) list.push({ label: 'Address Proof', url: doc.addressProof });
    return list;
  };
  const documents = getDocuments();

  return (
    <div className="font-montserrat" style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* ── BODY ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 48px 80px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>

        {/* ═══ LEFT COLUMN ═══════════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Vehicle Image Gallery */}
          <div style={{ background: '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
            {/* Main image */}
            <div style={{ position: 'relative', height: 420, background: '#0f172a', overflow: 'hidden' }}>
              <img
                src={allImages[activeImageIndex]}
                alt={request.vehicleName}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s' }}
                onError={e => { e.target.src = 'https://via.placeholder.com/800x500?text=Vehicle+Image'; }}
              />
              {/* Gradient overlay at bottom */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(transparent, rgba(0,0,0,0.55))' }} />
              {/* Vehicle name overlay */}
              <div style={{ position: 'absolute', bottom: 24, left: 28, right: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Vehicle</p>
                  <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{request.vehicleName}</h2>
                </div>
                <span style={{ background: 'rgba(249,115,22,0.85)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '6px 14px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {request.condition || 'Pending'}
                </span>
              </div>
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: 10, padding: '14px 20px', overflowX: 'auto', background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: 72, height: 52, flexShrink: 0, borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                      outline: activeImageIndex === idx ? '2px solid #f97316' : '2px solid transparent',
                      outlineOffset: 2, opacity: activeImageIndex === idx ? 1 : 0.55,
                      transition: 'all 0.2s',
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Specs row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
              {[
                { label: 'Year', value: request.year || 'N/A' },
                { label: 'Mileage', value: request.mileage ? `${Number(request.mileage).toLocaleString()} km` : 'N/A' },
                { label: 'Fuel', value: request.fuelType || 'N/A' },
                { label: 'Transmission', value: request.transmission || 'N/A' },
              ].map((spec, i) => (
                <div key={i} style={{ padding: '18px 20px', textAlign: 'center', borderRight: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                  <p style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 4 }}>{spec.label}</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Documentation ── */}
          {request.vehicleDocumentation && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.12em', paddingBottom: 10, borderBottom: '1px solid #e2e8f0' }}>
                Documentation Overview
              </h3>

              {/* ── Vehicle Documents (file links) ── */}
              {documents.length > 0 && (
                <DocCard title="Vehicle Documents" accentColor="#0ea5e9">
                  <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, marginTop: 4 }}>Click any document to open in a new tab</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                    {documents.map((d, i) => (
                      <a
                        key={i}
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          gap: 10, padding: '10px 14px', borderRadius: 10,
                          background: '#f8fafc', border: '1px solid #e2e8f0',
                          textDecoration: 'none', color: '#0f172a',
                          fontSize: 13, fontWeight: 600,
                          transition: 'all 0.18s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.color = '#1d4ed8'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: '#64748b', flexShrink: 0 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {d.label}
                        </span>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ flexShrink: 0, opacity: 0.45 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </DocCard>
              )}

              {/* Registration card */}
              <DocCard title="Registration &amp; Ownership" accentColor="#3b82f6">
                <DocRow label="Reg. Number" value={doc.registrationNumber} />
                <DocRow label="State" value={doc.registrationState} />
                <DocRow label="VIN Number" value={doc.vinNumber} />
                <DocRow label="Chassis No." value={doc.chassisNumber} />
                <DocRow label="Engine No." value={doc.engineNumber} />
                <DocRow label="Ownership Type" value={doc.ownershipType} />
                {doc.registrationCertificate && (
                  <div style={{ paddingTop: 12 }}>
                    <a
                      href={doc.registrationCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#3b82f6', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '8px 16px', borderRadius: 10, textDecoration: 'none', transition: 'all 0.2s' }}
                    >
                      View RC Document
                    </a>
                  </div>
                )}
              </DocCard>

              {/* Insurance + Service/Damage side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <DocCard title="Insurance" accentColor="#6366f1">
                  <DocRow label="Status" value={doc.insuranceStatus} badge={insuranceBadge} />
                  <DocRow label="Provider" value={doc.insuranceProvider} />
                  <DocRow label="Expiry Date" value={doc.insuranceExpiryDate ? new Date(doc.insuranceExpiryDate).toLocaleDateString() : null} />
                  {doc.insuranceCertificate && (
                    <div style={{ paddingTop: 12 }}>
                      <a
                        href={doc.insuranceCertificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#6366f1', background: '#eef2ff', border: '1px solid #c7d2fe', padding: '8px 16px', borderRadius: 10, textDecoration: 'none' }}
                      >
                        View Insurance
                      </a>
                    </div>
                  )}
                </DocCard>

                <DocCard title="Service &amp; History" accentColor="#f97316">
                  <DocRow label="Last Service" value={doc.lastServiceDate ? new Date(doc.lastServiceDate).toLocaleDateString() : null} />
                  <DocRow label="Accident History" value={doc.accidentHistory === 'no' ? 'No History' : 'Has Accidents'} badge={accidentBadge} />
                  {doc.accidentHistory !== 'no' && doc.accidentDetails && (
                    <div style={{ marginTop: 8, padding: '10px 12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10 }}>
                      <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>{doc.accidentDetails}</p>
                    </div>
                  )}
                </DocCard>
              </div>

              {/* Legal card */}
              <DocCard title="Legal &amp; Transfer Status" accentColor="#14b8a6">
                <DocRow label="Hypothecation" value={doc.hypothecationStatus} />
                <DocRow label="NOC Status" value={doc.nocStatus} />
                <DocRow label="RC Transfer Ready" value={doc.rcTransferReady === 'yes' ? 'Yes' : 'No'} badge={doc.rcTransferReady === 'yes' ? 'valid' : 'invalid'} />
                <DocRow label="PUC / Pollution" value={doc.pollutionCertificate} badge={pucBadge} />
              </DocCard>
            </div>
          )}
        </div>

        {/* ═══ RIGHT COLUMN ══════════════════════════════════════════ */}
        <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Starting Bid dark card */}
          <div style={{ background: 'linear-gradient(140deg, #0f172a 0%, #1e293b 100%)', borderRadius: 20, padding: '28px 28px 24px', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.22)' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(249,115,22,0.15)', filter: 'blur(30px)', pointerEvents: 'none' }} />
            <p style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>Seller's Expected Amount</p>
            <p style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.8px', lineHeight: 1 }}>
              {request.expectedBid ? `₹${Number(request.expectedBid).toLocaleString()}` : 'Not specified'}
            </p>
            {request.startingBid && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#475569' }}>Auction starting bid (set by manager)</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#34d399' }}>₹{Number(request.startingBid).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Assign mechanic card */}
          <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            {/* top accent bar */}
            <div style={{ height: 3, background: 'linear-gradient(90deg, #f97316, #ea580c)' }} />
            <div style={{ padding: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.3px' }}>Assign Mechanic</h3>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, marginBottom: 10 }}>
                Mechanics from {' '}
                <strong style={{ color: '#374151' }}>{request.sellerId?.city || 'the area'}</strong>
              </p>

              {assigned ? (
                <div style={{ padding: '24px 20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, textAlign: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 22, height: 22, color: '#16a34a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#15803d', marginBottom: 6 }}>Mechanic Assigned!</p>
                  <p style={{ fontSize: 13, color: '#4ade80' }}>Head to Chats to begin the inspection.</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                      Select Technician
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={selected}
                        onChange={e => setSelected(e.target.value)}
                        disabled={mechanics.length === 0}
                        style={{
                          width: '100%', appearance: 'none', padding: '13px 44px 13px 16px',
                          background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12,
                          fontSize: 14, fontWeight: 600, color: selected ? '#0f172a' : '#94a3b8',
                          cursor: mechanics.length === 0 ? 'not-allowed' : 'pointer',
                          outline: 'none', transition: 'border-color 0.2s',
                        }}
                        onFocus={e => { e.target.style.borderColor = '#f97316'; }}
                        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
                      >
                        <option value="" disabled>Choose a mechanic…</option>
                        {mechanics.map(m => (
                          <option key={m._id} value={m._id}>
                            {m.firstName} {m.lastName}{m.city ? ` · ${m.city}` : ''}
                          </option>
                        ))}
                      </select>
                      <svg xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8', pointerEvents: 'none' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {mechanics.length === 0 && (
                    <div style={{ display: 'flex', gap: 10, padding: '12px 14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, marginBottom: 16 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16, color: '#f97316', flexShrink: 0, marginTop: 1 }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
                        No mechanics currently available in <strong>{request.sellerId?.city || 'this area'}</strong>.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleAssign}
                    disabled={assigning || !selected || mechanics.length === 0}
                    style={{
                      width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                      background: !selected || mechanics.length === 0 ? '#e2e8f0' : 'linear-gradient(135deg, #f97316, #ea580c)',
                      color: !selected || mechanics.length === 0 ? '#94a3b8' : '#fff',
                      fontSize: 14, fontWeight: 700, cursor: !selected || mechanics.length === 0 ? 'not-allowed' : 'pointer',
                      boxShadow: selected && mechanics.length > 0 ? '0 6px 20px -4px rgba(249,115,22,0.5)' : 'none',
                      transition: 'all 0.2s', letterSpacing: '0.02em',
                    }}
                  >
                    {assigning ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <svg style={{ animation: 'spin 0.8s linear infinite', width: 16, height: 16 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Assigning…
                      </span>
                    ) : 'Confirm Assignment'}
                  </button>

                  <div style={{ marginTop: 12, textAlign: 'center' }}>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      style={{
                        width: '100%', padding: '14px', borderRadius: 12, border: '1px solid #fee2e2',
                        background: '#fff', color: '#dc2626', fontSize: 14, fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.02em',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                    >
                      Reject Request
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Seller info card */}
          {request.sellerId && (
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', padding: 24 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>Seller Profile</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                  {request.sellerId.firstName?.charAt(0) || 'S'}
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
                    {request.sellerId.firstName} {request.sellerId.lastName}
                  </p>
                  <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Verified Owner</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0 }} viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 500, wordBreak: 'break-all' }}>{request.sellerId.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0 }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{request.sellerId.city || 'Location not specified'}</span>
                </div>
              </div>

              {request.sellerId.phone ? (
                <a
                  href={`tel:${request.sellerId.phone}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px', borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 15, height: 15 }} viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                  Call Seller
                </a>
              ) : (
                <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No phone number on file</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      
      {/* Rejection Modal */}
      {showRejectModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: 450, overflow: 'hidden', transform: 'scale(1)', transition: 'all 0.3s' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #fee2e2', background: '#fef2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Reject Request
              </h3>
              <button 
                onClick={() => { setShowRejectModal(false); setRejectError(''); setRejectReason(''); }}
                style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 4 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 24, height: 24 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div style={{ padding: 24 }}>
              <p style={{ fontSize: 13, color: '#475569', marginBottom: 16, lineHeight: 1.5 }}>
                Please provide a clear reason for rejecting <strong style={{ color: '#0f172a' }}>{request.vehicleName}</strong>. This will be visible to the seller.
              </p>
              
              <textarea
                value={rejectReason}
                onChange={(e) => { setRejectReason(e.target.value); setRejectError(''); }}
                placeholder="Examples: Blurred documentation images, missing RC details, car doesn't meet age criteria..."
                style={{ width: '100%', height: 120, padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 14, color: '#334155', resize: 'none', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#ef4444'; e.target.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.2)'; }}
                onBlur={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
              
              {rejectError && (
                <p style={{ marginTop: 8, fontSize: 13, color: '#dc2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 14, height: 14 }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {rejectError}
                </p>
              )}
            </div>
            
            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => { setShowRejectModal(false); setRejectError(''); setRejectReason(''); }}
                disabled={isRejecting}
                style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'transparent', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: isRejecting ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { if (!isRejecting) e.currentTarget.style.background = '#e2e8f0'; }}
                onMouseLeave={e => { if (!isRejecting) e.currentTarget.style.background = 'transparent'; }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isRejecting}
                style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#dc2626', color: '#fff', fontSize: 14, fontWeight: 700, cursor: isRejecting ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', minWidth: 120, justifyContent: 'center' }}
                onMouseEnter={e => { if (!isRejecting) e.currentTarget.style.background = '#b91c1c'; }}
                onMouseLeave={e => { if (!isRejecting) e.currentTarget.style.background = '#dc2626'; }}
              >
                {isRejecting ? (
                  <svg style={{ animation: 'spin 0.8s linear infinite', width: 18, height: 18 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
