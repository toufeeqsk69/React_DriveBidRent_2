// client/src/pages/buyer/LiveAuctionRoom.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { getAuctionById, placeBid } from '../../services/buyer.services';
import './LiveAuctionRoom.css';
import LoadingSpinner from '../components/LoadingSpinner';

// Synthesize a beep sound for new bids
const playBeep = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) { console.error('Audio play failed', e); }
};

export default function LiveAuctionRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [auction, setAuction] = useState(null);
  const [currentBid, setCurrentBid] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCurrentBidder, setIsCurrentBidder] = useState(false);
  const [outbidAlert, setOutbidAlert] = useState(false);
  const [bidFlash, setBidFlash] = useState(false);
  const [timeLeft, setTimeLeft] = useState({});
  const [bidsHistory, setBidsHistory] = useState([]);

  useEffect(() => {
    // 1. Fetch initial data
    const fetchInit = async () => {
      try {
        const data = await getAuctionById(id);
        setAuction(data.auction);
        setCurrentBid(data.currentBid);
        setIsCurrentBidder(data.isCurrentBidder || false);
        
        if (data.currentBid) {
          setBidsHistory([{
            amount: data.currentBid.bidAmount,
            time: new Date().toLocaleTimeString(),
            name: 'Current Leader'
          }]);
        }
      } catch(e) {
        console.error("Failed to load auction", e);
      } finally {
        setLoading(false);
      }
    };
    fetchInit();

    // 2. Setup Socket.io
    const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'https://drivebidrent.onrender.com';
    socketRef.current = io(backendUrl, { withCredentials: true });

    socketRef.current.on('connect', () => {
      console.log('Connected to Live Auction Socket');
      socketRef.current.emit('join_auction', id);
    });

    socketRef.current.on('new_bid', (data) => {
      playBeep();
      setBidFlash(true);
      setTimeout(() => setBidFlash(false), 300);

      setCurrentBid({ bidAmount: data.bidAmount });
      setBidsHistory(prev => [{
        amount: data.bidAmount,
        name: data.bidderName,
        time: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 5));

      // Retrieve current user ID assuming localStorage contains user info
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && data.buyerId !== user._id) {
        // Someone else bid
        setIsCurrentBidder(false);
        setOutbidAlert(true);
        setTimeout(() => setOutbidAlert(false), 1500);
      } else if (user && data.buyerId === user._id) {
        setIsCurrentBidder(true);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_auction', id);
        socketRef.current.disconnect();
      }
    };
  }, [id]);

  // 3. Countdown Timer Logic
  useEffect(() => {
    if (!auction) return;
    
    // Set duration to 30 days (1 month) to help with development testing
    const endTime = new Date(auction.auctionDate).getTime() + (30 * 24 * 60 * 60 * 1000);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        // Use total distance for hours so it can exceed 24 (e.g., 720 hours)
        hours: Math.floor(distance / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [auction]);

  if (loading) return <div style={{ background: '#0f172a', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingSpinner /></div>;
  if (!auction) return <div className="live-auction-container"><div className="live-header"><h1 className="vehicle-title">Auction Not Found</h1></div></div>;

  const minBid = currentBid ? currentBid.bidAmount + 2000 : auction.startingBid;
  const imageUrl = auction.mainImage || auction.vehicleImage || 'https://via.placeholder.com/800x400';

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (isCurrentBidder) return;
    
    const val = parseFloat(bidAmount);
    if (!val || val < minBid) {
      alert(`Minimum bid is ₹${minBid.toLocaleString()}`);
      return;
    }

    try {
      const res = await placeBid({ auctionId: id, bidAmount: val });
      if (res.success) {
        setBidAmount('');
      } else {
        alert(res.message);
      }
    } catch(err) {
      alert('Error placing bid');
    }
  };

  return (
    <div className="live-auction-container">
      {outbidAlert && <div className="outbid-alert">OUTBID!</div>}

      <div className="live-auction-content">
        <header className="live-header">
          <div>
            <div className="live-badge"><span className="dot"></span> LIVE</div>
          </div>
          <button className="action-btn" onClick={() => navigate(`/buyer/auctions/${id}`)} style={{ padding: '0.5rem 1rem', fontSize: '1rem', background: 'transparent', border: '1px solid #ff6b00' }}>
            Exit Room
          </button>
        </header>

        <h1 className="vehicle-title" style={{ marginBottom: '2rem' }}>{auction.vehicleName}</h1>

        <div className="grid-layout">
          {/* Left Side: Vehicle Info & Timer */}
          <div className="card">
            <img src={imageUrl} alt={auction.vehicleName} className="vehicle-image" />
            
            <div className="timer-box">
              <div className="time-unit">
                <div className="time-val">{String(timeLeft.hours || 0).padStart(2, '0')}</div>
                <div className="time-label">Hrs</div>
              </div>
              <div className="time-unit">
                <div className="time-val">{String(timeLeft.minutes || 0).padStart(2, '0')}</div>
                <div className="time-label">Min</div>
              </div>
              <div className="time-unit">
                <div className="time-val">{String(timeLeft.seconds || 0).padStart(2, '0')}</div>
                <div className="time-label">Sec</div>
              </div>
            </div>
          </div>

          {/* Right Side: Bidding Console */}
          <div className="card">
            <div className="current-bid-box">
              <div className="current-bid-label">Current Highest Bid</div>
              <div className={`current-bid-value ${bidFlash ? 'flash' : ''}`}>
                ₹{currentBid ? currentBid.bidAmount.toLocaleString() : auction.startingBid.toLocaleString()}
              </div>
            </div>

            <form className="bid-form" onSubmit={handlePlaceBid}>
              <input 
                type="number" 
                className="bid-input" 
                placeholder={`Min: ₹${minBid.toLocaleString()}`}
                value={bidAmount}
                onChange={e => setBidAmount(e.target.value)}
                min={minBid}
                step="500"
              />
              <button 
                type="submit" 
                className="action-btn"
                disabled={isCurrentBidder || auction.auction_stopped}
              >
                {isCurrentBidder ? 'You Lead The Auction' : 'BID NOW'}
              </button>
              {isCurrentBidder && <div className="winning-text">✓ You are currently winning!</div>}
            </form>

            <div style={{ marginTop: '2rem' }}>
              <div className="current-bid-label">Recent Bids</div>
              <ul className="bid-history">
                {bidsHistory.map((b, i) => (
                  <li key={i} className="bid-item">
                    <span>{b.name}</span>
                    <span>₹{b.amount.toLocaleString()} ({b.time})</span>
                  </li>
                ))}
                {bidsHistory.length === 0 && <li className="bid-item" style={{color: '#94a3b8'}}>No bids yet</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
