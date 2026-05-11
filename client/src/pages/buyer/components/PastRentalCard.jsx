import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, IndianRupee, RefreshCw } from 'lucide-react';

export default function PastRentalCard({ rental, rentalId }) {
  return (
    <>
      <style>{`
        .prc-card {
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
        .prc-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
        }
        .prc-img-wrap {
          position: relative;
          padding: 12px 12px 0;
          background: #f0fdf4;
        }
        .prc-img-inner {
          position: relative;
          height: 180px;
          overflow: hidden;
          border-radius: 14px;
          background: #dcfce7;
        }
        .prc-img-inner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
          display: block;
        }
        .prc-card:hover .prc-img-inner img { transform: scale(1.05); }
        .prc-badge-completed {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: #475569;
          color: #fff;
        }
        .prc-badge-available {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: #16a34a;
          color: #fff;
        }
        .prc-body {
          padding: 20px 20px 0;
          flex: 1;
        }
        .prc-title {
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
        .prc-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }
        .prc-meta-row {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          color: #6b6560;
          font-weight: 500;
        }
        .prc-meta-row strong { color: #1a1612; font-weight: 600; }
        .prc-footer { border-top: 1px solid #f0ece6; margin-top: auto; }
        .prc-view-btn {
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
        .prc-view-btn:hover { color: #16a34a; }
        .prc-view-btn .arrow-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f0fdf4;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, transform 0.2s;
          color: #16a34a;
        }
        .prc-view-btn:hover .arrow-icon {
          background: #16a34a;
          color: #fff;
          transform: translate(2px, -2px);
        }
        .prc-tooltip {
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
        .prc-view-btn:hover .prc-tooltip { opacity: 1; }
        .prc-rent-again {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 0 16px 16px;
          padding: 12px;
          border-radius: 12px;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: #fff;
          font-weight: 700;
          font-size: 13px;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.2s;
        }
        .prc-rent-again:hover { opacity: 0.9; transform: translateY(-1px); }
      `}</style>

      <article className="prc-card">
        <div className="prc-img-wrap">
          <div className="prc-img-inner">
            <span className="prc-badge-completed">Completed</span>
            {rental.isAvailableForRentAgain && (
              <span className="prc-badge-available">Available Again</span>
            )}
            <img src={rental.vehicleImage} alt={rental.vehicleName} />
          </div>
        </div>

        <div className="prc-body">
          <h3 className="prc-title">{rental.vehicleName}</h3>
          <div className="prc-meta">
            <div className="prc-meta-row">
              <CalendarDays size={13} />
              <span>Pickup <strong>{new Date(rental.pickupDate).toLocaleDateString()}</strong></span>
            </div>
            <div className="prc-meta-row">
              <IndianRupee size={13} />
              <span>Cost <strong>₹{rental.totalCost?.toLocaleString?.() || rental.totalCost}</strong></span>
            </div>
          </div>
        </div>

        <div className="prc-footer">
          <Link to={`/buyer/rentals/${rentalId}`} state={{ from: '/buyer/purchases' }} className="prc-view-btn">
            <span>View Details</span>
            <div className="arrow-icon">
              <ArrowUpRight size={15} />
            </div>
            <span className="prc-tooltip">View full details ↗</span>
          </Link>

          {rental.isAvailableForRentAgain && (
            <Link
              to={`/buyer/rentals/${rentalId}`}
              state={{ from: '/buyer/purchases', openRentModal: true }}
              className="prc-rent-again"
            >
              <RefreshCw size={14} />
              Rent Again
            </Link>
          )}
        </div>
      </article>
    </>
  );
}