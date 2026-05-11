import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, IndianRupee, CreditCard } from 'lucide-react';

export default function AuctionPurchaseCard({ purchase, onPayNow }) {
  const hasStatus = purchase.paymentStatus === 'pending' || purchase.paymentStatus === 'paid';

  const statusConfig = {
    pending: { label: 'Pending Payment', bg: '#f59e0b', text: '#fff' },
    paid:    { label: 'Paid',            bg: '#10b981', text: '#fff' },
  };
  const status = statusConfig[purchase.paymentStatus];

  return (
    <>
      <style>{`
        .apc-card {
          font-family: 'Montserrat', sans-serif;
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #e8e4dd;
          box-shadow: 0 2px 16px rgba(0,0,0,0.06);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        .apc-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
        }
        .apc-img-wrap {
          position: relative;
          padding: 12px 12px 0;
          background: #f5f1ec;
        }
        .apc-img-inner {
          position: relative;
          height: 180px;
          overflow: hidden;
          border-radius: 14px;
          background: #e8e2da;
        }
        .apc-img-inner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
          display: block;
        }
        .apc-card:hover .apc-img-inner img { transform: scale(1.05); }
        .apc-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .apc-body {
          padding: 20px 20px 0;
          flex: 1;
        }
        .apc-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: #1a1612;
          margin-bottom: 14px;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .apc-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }
        .apc-meta-row {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          color: #6b6560;
          font-weight: 500;
        }
        .apc-meta-row strong { color: #1a1612; font-weight: 600; }
        .apc-footer {
          border-top: 1px solid #f0ece6;
          margin-top: auto;
        }
        .apc-action-row {
          display: flex;
          align-items: center;
        }
        .apc-view-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          font-size: 13px;
          font-weight: 600;
          color: #6b6560;
          text-decoration: none;
          transition: color 0.2s;
          position: relative;
        }
        .apc-view-btn:hover { color: #c17f3a; }
        .apc-view-btn .arrow-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f5f1ec;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, transform 0.2s;
        }
        .apc-view-btn:hover .arrow-icon {
          background: #c17f3a;
          color: #fff;
          transform: translate(2px, -2px);
        }
        .apc-tooltip {
          position: absolute;
          bottom: calc(100% + 6px);
          right: 16px;
          background: #1a1612;
          color: #fff;
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 6px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
        }
        .apc-view-btn:hover .apc-tooltip { opacity: 1; }
        .apc-pay-btn {
          margin: 0 16px 16px;
          width: calc(100% - 32px);
          padding: 12px;
          border-radius: 12px;
          background: linear-gradient(135deg, #c17f3a, #e09b52);
          color: #fff;
          font-weight: 700;
          font-size: 13px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s, transform 0.2s;
        }
        .apc-pay-btn:hover { opacity: 0.9; transform: translateY(-1px); }
      `}</style>

      <article className="apc-card">
        <div className="apc-img-wrap">
          <div className="apc-img-inner">
            {hasStatus && status && (
              <span className="apc-badge" style={{ background: status.bg, color: status.text }}>
                {status.label}
              </span>
            )}
            <img src={purchase.vehicleImage} alt={purchase.vehicleName} />
          </div>
        </div>

        <div className="apc-body">
          <h3 className="apc-title">{purchase.vehicleName}</h3>
          <div className="apc-meta">
            <div className="apc-meta-row">
              <CalendarDays size={13} />
              <span>Purchased <strong>{new Date(purchase.purchaseDate).toLocaleDateString()}</strong></span>
            </div>
            <div className="apc-meta-row">
              <IndianRupee size={13} />
              <span>Cost <strong>₹{purchase.purchasePrice?.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        <div className="apc-footer">
          <div className="apc-action-row">
            <Link to={`/buyer/purchases/${purchase._id}`} className="apc-view-btn">
              <span>View Details</span>
              <div className="arrow-icon">
                <ArrowUpRight size={15} />
              </div>
              <span className="apc-tooltip">View full details ↗</span>
            </Link>
          </div>

          {purchase.paymentStatus === 'pending' && (
            <button className="apc-pay-btn" onClick={() => onPayNow(purchase)}>
              <CreditCard size={15} />
              Pay Now
            </button>
          )}
        </div>
      </article>
    </>
  );
}