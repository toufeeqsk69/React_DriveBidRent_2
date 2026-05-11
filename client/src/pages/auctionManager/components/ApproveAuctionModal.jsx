// client/src/pages/auctionManager/components/ApproveAuctionModal.jsx
import { useState } from 'react';

/**
 * ApproveAuctionModal
 * Shows only when the auction manager clicks "Approve for Auction".
 * Asks for a minimum starting bid before confirming.
 *
 * Props:
 *   isOpen         – boolean
 *   onClose        – () => void
 *   onConfirm      – (startingBid: number) => void
 *   suggestedBid   – number | null  (seller's expected amount)
 *   vehicleName    – string
 */
export default function ApproveAuctionModal({ isOpen, onClose, onConfirm, suggestedBid, vehicleName }) {
  const [bidInput, setBidInput] = useState(suggestedBid ? String(suggestedBid) : '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const val = Number(bidInput.toString().replace(/,/g, ''));
    if (!val || val <= 0) {
      setError('Please enter a valid starting bid.');
      return;
    }
    setError('');
    onConfirm(val);
  };

  return (
    // Backdrop
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal card */}
      <div style={{
        background: '#fff', borderRadius: 24, width: '100%', maxWidth: 460,
        boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
        overflow: 'hidden',
        animation: 'modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Green top accent + header */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '28px 28px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 20, height: 20, color: '#4ade80' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Confirm Approval</p>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>Set Auction Starting Price</h2>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, marginTop: 16 }}>
            You are approving <strong style={{ color: '#e2e8f0' }}>{vehicleName}</strong> for live auction.
            Set the minimum opening bid buyers must start from.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px 28px' }}>
          {/* Seller's expected amount hint */}
          {suggestedBid && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Seller's expected amount</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>₹{Number(suggestedBid).toLocaleString('en-IN')}</span>
            </div>
          )}

          {/* Bid input */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Minimum Starting Bid (₹)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, fontWeight: 700, color: '#94a3b8' }}>₹</span>
              <input
                type="number"
                min="1"
                step="1000"
                value={bidInput}
                onChange={e => { setBidInput(e.target.value); setError(''); }}
                placeholder={suggestedBid ? suggestedBid.toString() : 'Enter amount'}
                style={{
                  width: '100%', padding: '13px 16px 13px 32px', borderRadius: 12,
                  border: error ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                  fontSize: 15, fontWeight: 700, color: '#0f172a',
                  background: '#f8fafc', outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#22c55e'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = error ? '#ef4444' : '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                autoFocus
              />
            </div>
            {error && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 6, fontWeight: 600 }}>{error}</p>}
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8, lineHeight: 1.6 }}>
              This becomes the floor price for the auction. Buyers must bid at or above this amount.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid #e2e8f0',
                background: '#fff', fontSize: 14, fontWeight: 700, color: '#64748b',
                cursor: 'pointer', transition: 'all 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              style={{
                flex: 2, padding: '13px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                fontSize: 14, fontWeight: 700, color: '#fff',
                cursor: 'pointer', transition: 'all 0.18s',
                boxShadow: '0 4px 16px -4px rgba(22,163,74,0.5)',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px -6px rgba(22,163,74,0.6)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px -4px rgba(22,163,74,0.5)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Confirm &amp; Approve
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
