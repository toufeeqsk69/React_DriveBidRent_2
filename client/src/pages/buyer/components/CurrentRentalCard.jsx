import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, IndianRupee } from 'lucide-react';

export default function CurrentRentalCard({ rental, rentalId }) {
  return (
    <>
      <style>{`
        .crc-card {
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
        .crc-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
        }
        .crc-img-wrap {
          position: relative;
          padding: 12px 12px 0;
          background: #eef4ff;
        }
        .crc-img-inner {
          position: relative;
          height: 180px;
          overflow: hidden;
          border-radius: 14px;
          background: #dbeafe;
        }
        .crc-img-inner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
          display: block;
        }
        .crc-card:hover .crc-img-inner img { transform: scale(1.05); }
        .crc-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: #2563eb;
          color: #fff;
        }
        .crc-body {
          padding: 20px 20px 0;
          flex: 1;
        }
        .crc-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: #0f1a2e;
          margin-bottom: 14px;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .crc-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }
        .crc-meta-row {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }
        .crc-meta-row strong { color: #0f1a2e; font-weight: 600; }
        .crc-footer { border-top: 1px solid #eef2ff; margin-top: auto; }
        .crc-view-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          text-decoration: none;
          transition: color 0.2s;
          position: relative;
        }
        .crc-view-btn:hover { color: #2563eb; }
        .crc-view-btn .arrow-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #eff6ff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, transform 0.2s;
          color: #2563eb;
        }
        .crc-view-btn:hover .arrow-icon {
          background: #2563eb;
          color: #fff;
          transform: translate(2px, -2px);
        }
        .crc-tooltip {
          position: absolute;
          bottom: calc(100% + 6px);
          right: 16px;
          background: #0f1a2e;
          color: #fff;
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 6px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
        }
        .crc-view-btn:hover .crc-tooltip { opacity: 1; }
      `}</style>

      <article className="crc-card">
        <div className="crc-img-wrap">
          <div className="crc-img-inner">
            <span className="crc-badge">Active Rental</span>
            <img src={rental.vehicleImage} alt={rental.vehicleName} />
          </div>
        </div>

        <div className="crc-body">
          <h3 className="crc-title">{rental.vehicleName}</h3>
          <div className="crc-meta">
            <div className="crc-meta-row">
              <CalendarDays size={13} />
              <span>Pickup <strong>{new Date(rental.pickupDate).toLocaleDateString()}</strong></span>
            </div>
            <div className="crc-meta-row">
              <IndianRupee size={13} />
              <span>Cost <strong>₹{rental.totalCost?.toLocaleString?.() || rental.totalCost}</strong></span>
            </div>
          </div>
        </div>

        <div className="crc-footer">
          <Link to={`/buyer/rentals/${rentalId}`} state={{ from: '/buyer/purchases' }} className="crc-view-btn">
            <span>View Details</span>
            <div className="arrow-icon">
              <ArrowUpRight size={15} />
            </div>
            <span className="crc-tooltip">View full details ↗</span>
          </Link>
        </div>
      </article>
    </>
  );
}