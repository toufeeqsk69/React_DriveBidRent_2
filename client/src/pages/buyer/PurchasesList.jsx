// client/src/pages/buyer/PurchasesList.jsx
import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { ShoppingBag, Car, History, CreditCard } from 'lucide-react';

import {
  getPurchases,
  getAuctionPaymentDetails,
  createCheckoutSession
} from '../../services/buyer.services';
import PaymentModal from './components/modals/PaymentModal';
import AuctionPurchaseCard from './components/AuctionPurchaseCard';
import CurrentRentalCard from './components/CurrentRentalCard';
import PastRentalCard from './components/PastRentalCard';

export default function PurchasesList() {
  const [auctionPurchases, setAuctionPurchases] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [pastRentals, setPastRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => { fetchPurchases(); }, []);

  const fetchPurchases = async () => {
    try {
      const data = await getPurchases();
      setAuctionPurchases(data.auctionPurchases || []);
      setRentals(data.rentals || []);
      setPastRentals(data.pastRentals || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (purchase) => {
    try {
      const details = await getAuctionPaymentDetails(purchase.auctionId);
      setPaymentDetails(details);
      setSelectedPurchase(purchase);
      setShowPaymentModal(true);
    } catch (error) {
      alert('Failed to load payment details');
    }
  };

  const handlePayment = async (_paymentMethod) => {
    try {
      setShowPaymentModal(false);
      const sessionData = await createCheckoutSession({
        amount: paymentDetails?.totalAmount || selectedPurchase.purchasePrice || 0,
        productName: `Purchase: ${selectedPurchase.vehicleName}`,
        metadata: {
          type: 'auction',
          purchaseId: selectedPurchase._id
        },
        successUrl: `${window.location.origin}/buyer/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/buyer/payment-cancel`
      });

      if (sessionData.success && sessionData.url) {
        window.location.href = sessionData.url;
      } else {
        alert(sessionData.message || 'Payment intialization failed');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      alert('Payment initialization failed. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <style>{`
        @keyframes heroReveal {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0) scale(1); }
          50%       { transform: translateY(-20px) scale(1.08); }
        }

        .pl-root { font-family: 'Montserrat', sans-serif; min-height: 100vh; background: #faf8f5; }

        /* ── HERO ── */
        .pl-hero {
          position: relative;
          background: linear-gradient(135deg, #0f1a2e 0%, #1a2d4a 55%, #0f1a2e 100%);
          padding: 80px 0 64px;
          overflow: hidden;
        }
        .pl-hero-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 48px;
          position: relative;
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          justify-content: space-between;
          gap: 32px;
        }
        .pl-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(193,127,58,0.15);
          border: 1px solid rgba(193,127,58,0.3);
          padding: 6px 14px;
          border-radius: 100px;
          margin-bottom: 16px;
        }
        .pl-hero-badge span {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #e8a855;
        }
        .pl-hero-title {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(36px, 5vw, 58px);
          font-weight: 800;
          color: #fff;
          letter-spacing: -1.5px;
          line-height: 1.05;
          margin-bottom: 12px;
        }
        .pl-hero-title em { color: #c17f3a; font-style: italic; }
        .pl-hero-sub { color: #94a3b8; font-size: 15px; max-width: 420px; line-height: 1.7; }

        /* stat pills */
        .pl-stats { display: flex; flex-wrap: wrap; gap: 12px; }
        .pl-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 16px 24px;
          border-radius: 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          backdrop-filter: blur(10px);
          min-width: 120px;
          transition: background 0.25s;
        }
        .pl-stat:hover { background: rgba(255,255,255,0.09); }
        .pl-stat-num {
          font-family: 'Montserrat', sans-serif;
          font-size: 30px;
          font-weight: 800;
          color: #fff;
          line-height: 1;
        }
        .pl-stat-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #64748b;
        }

        /* ── MAIN ── */
        .pl-main {
          max-width: 1440px;
          margin: 0 auto;
          padding: 56px 48px;
          display: flex;
          flex-direction: column;
          gap: 56px;
        }

        /* section header */
        .pl-sec-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1px solid #ede9e3;
        }
        .pl-sec-head-left { display: flex; align-items: center; gap: 14px; }
        .pl-sec-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pl-sec-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #0f1a2e;
          line-height: 1;
        }
        .pl-sec-title em { font-style: italic; }
        .pl-sec-count {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
          background: #f5f1ec;
          padding: 4px 12px;
          border-radius: 100px;
        }

        /* card grid */
        .pl-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 24px;
        }
        @media (min-width: 768px)  { .pl-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1280px) { .pl-grid { grid-template-columns: repeat(3, 1fr); } }

        /* section wrapper tint */
        .pl-sec-box {
          border-radius: 28px;
          padding: 28px;
        }
        .pl-sec-box-amber {
          background: linear-gradient(135deg, #fffbf5 0%, #fff 60%, #fdf6ec 100%);
          border: 1px solid #f0dfc0;
          box-shadow: 0 6px 28px rgba(193,127,58,0.07);
        }
        .pl-sec-box-blue {
          background: linear-gradient(135deg, #f0f7ff 0%, #fff 60%, #eef4ff 100%);
          border: 1px solid #bfdbfe;
          box-shadow: 0 6px 28px rgba(37,99,235,0.06);
        }
        .pl-sec-box-green {
          background: linear-gradient(135deg, #f0fdf4 0%, #fff 60%, #dcfce7 100%);
          border: 1px solid #bbf7d0;
          box-shadow: 0 6px 28px rgba(22,163,74,0.06);
        }

        /* empty state */
        .pl-empty {
          border-radius: 20px;
          padding: 48px 24px;
          text-align: center;
          background: #fff;
          border: 1px dashed #ddd8d0;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
        }
      `}</style>

      <div className="pl-root">

        {/* ── HERO ─────────────────────────────── */}
        <section className="pl-hero">
          {/* floating orbs */}
          {[
            { t: '18%', l: '4%',  s: 200, c: 'rgba(193,127,58,0.12)', d: '0s',   dur: 5 },
            { t: '65%', l: '70%', s: 240, c: 'rgba(37,99,235,0.10)',  d: '1.4s', dur: 6 },
            { t: '8%',  l: '82%', s: 130, c: 'rgba(193,127,58,0.07)', d: '0.7s', dur: 4 },
          ].map((o, i) => (
            <div key={i} style={{
              position: 'absolute', top: o.t, left: o.l,
              width: o.s, height: o.s, borderRadius: '50%',
              background: o.c, filter: 'blur(44px)',
              animation: `floatOrb ${o.dur}s ease-in-out infinite`,
              animationDelay: o.d, pointerEvents: 'none',
            }} />
          ))}
          {/* dot grid */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />

          <div className="pl-hero-inner">
            <div style={{ animation: 'heroReveal 0.6s ease forwards' }}>
              <div className="pl-hero-badge">
                <ShoppingBag size={12} color="#e8a855" />
                <span>Transaction Center</span>
              </div>
              <h1 className="pl-hero-title">
                My <em>Purchases</em>
              </h1>
              <p className="pl-hero-sub">
                View bought cars, active rentals, and completed rentals in one place.
              </p>
            </div>

            <div className="pl-stats">
              <div className="pl-stat">
                <div className="pl-stat-num">{auctionPurchases.length}</div>
                <div className="pl-stat-label">Bought</div>
              </div>
              <div className="pl-stat">
                <div className="pl-stat-num">{rentals.length}</div>
                <div className="pl-stat-label">Current Rentals</div>
              </div>
              <div className="pl-stat">
                <div className="pl-stat-num">{pastRentals.length}</div>
                <div className="pl-stat-label">Past Rentals</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MAIN ─────────────────────────────── */}
        <main className="pl-main">

          {/* AUCTION PURCHASES */}
          <section>
            <div className="pl-sec-head">
              <div className="pl-sec-head-left">
                <div className="pl-sec-icon" style={{ background: '#fef3c7', border: '1px solid #fde68a' }}>
                  <CreditCard size={18} color="#c17f3a" />
                </div>
                <h2 className="pl-sec-title">Auction <em style={{ color: '#c17f3a' }}>Purchases</em></h2>
              </div>
              <span className="pl-sec-count">{auctionPurchases.length} cars</span>
            </div>

            {auctionPurchases.length === 0 ? (
              <div className="pl-empty">You have not purchased any vehicles from auctions yet.</div>
            ) : (
              <div className="pl-sec-box pl-sec-box-amber">
                <div className="pl-grid">
                  {auctionPurchases.map(purchase => (
                    <AuctionPurchaseCard key={purchase._id} purchase={purchase} onPayNow={handlePayNow} />
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* CURRENT RENTALS */}
          <section>
            <div className="pl-sec-head">
              <div className="pl-sec-head-left">
                <div className="pl-sec-icon" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  <Car size={18} color="#2563eb" />
                </div>
                <h2 className="pl-sec-title">Current <em style={{ color: '#2563eb' }}>Rentals</em></h2>
              </div>
              <span className="pl-sec-count">{rentals.length} cars</span>
            </div>

            {rentals.length === 0 ? (
              <div className="pl-empty">You do not have any active rentals.</div>
            ) : (
              <div className="pl-sec-box pl-sec-box-blue">
                <div className="pl-grid">
                  {rentals.map((rental, index) => {
                    const rentalId = rental._id || rental.investor_id;
                    return (
                      <CurrentRentalCard
                        key={`active-${rentalId}-${index}`}
                        rental={rental}
                        rentalId={rentalId}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* PAST RENTALS */}
          <section>
            <div className="pl-sec-head">
              <div className="pl-sec-head-left">
                <div className="pl-sec-icon" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <History size={18} color="#16a34a" />
                </div>
                <h2 className="pl-sec-title">Past <em style={{ color: '#16a34a' }}>Rentals</em></h2>
              </div>
              <span className="pl-sec-count">{pastRentals.length} cars</span>
            </div>

            {pastRentals.length === 0 ? (
              <div className="pl-empty">You do not have any past rentals.</div>
            ) : (
              <div className="pl-sec-box pl-sec-box-green">
                <div className="pl-grid">
                  {pastRentals.map((rental, index) => {
                    const rentalId = rental._id || rental.investor_id;
                    return (
                      <PastRentalCard
                        key={`completed-${rentalId}-${index}`}
                        rental={rental}
                        rentalId={rentalId}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </main>

        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onProcessPayment={handlePayment}
          totalCost={paymentDetails?.totalAmount || 0}
          selectedPaymentMethod="upi"
          onPaymentMethodSelect={() => {}}
        />
      </div>
    </>
  );
}