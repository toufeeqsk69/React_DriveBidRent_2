import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import { getAuctionById, placeBid } from '../../services/buyer.services';
import useProfile from '../../hooks/useProfile';
import LoadingSpinner from '../components/LoadingSpinner';

export default function BidPage() {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [currentBid, setCurrentBid] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isCurrentBidder, setIsCurrentBidder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { profile, loading: profileLoading } = useProfile();

  useEffect(() => {
    // Initial fetch with loading state
    fetchAuctionData(true);
    
    // Setup Socket.io for real-time bid updates
    const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'https://drivebidrent.onrender.com';
    const socket = io(backendUrl, { withCredentials: true });

    socket.on('connect', () => {
      socket.emit('join_auction', id);
    });

    socket.on('new_bid', () => {
      fetchAuctionData(false);
    });

    return () => {
      socket.emit('leave_auction', id);
      socket.disconnect();
    };
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAuctionData = async (isInitial = false) => {
    try {
      const data = await getAuctionById(id);
      setAuction(data.auction);
      setCurrentBid(data.currentBid);
      setIsCurrentBidder(data.isCurrentBidder);
    } catch (error) {
      console.error('Error fetching auction data:', error);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    if (profile === undefined) return; // still loading maybe
    setIsLoggedIn(!!profile);
  }, [profile, profileLoading]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const bidValue = parseFloat(bidAmount);
    const minBid = currentBid ? currentBid.bidAmount + 2000 : auction.startingBid;

    if (bidValue < minBid) {
      setError(`Your bid must be at least ₹${minBid.toLocaleString()}`);
      return;
    }

    try {
      const result = await placeBid(id, bidValue);
      if (result.success) {
        setSuccess('Your bid has been placed successfully!');
        setBidAmount('');
        setCurrentBid({ ...currentBid, bidAmount: bidValue });
        setIsCurrentBidder(true);
      } else {
        setError(result.message || 'Failed to place bid');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Bid placement error:', error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!auction) return <div className="text-center py-10">Auction not found</div>;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Auction Details Section */}
      <div className="auction-details bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 shadow-md mb-6 sm:mb-8">
        <img src={auction.vehicleImage} alt={auction.vehicleName} className="w-full h-48 sm:h-64 object-cover rounded-lg mb-4" />
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-600 mb-4">{auction.vehicleName}</h1>
        <p><strong>Seller:</strong> {auction.sellerId?.firstName} {auction.sellerId?.lastName}</p>
        <p><strong>Year:</strong> {auction.year}</p>
        <p><strong>Condition:</strong> {auction.condition?.charAt(0)?.toUpperCase() + auction.condition?.slice(1)}</p>
        <p><strong>Starting Bid:</strong> ₹{auction.startingBid?.toLocaleString()}</p>
        <p><strong>Auction Date:</strong> {new Date(auction.auctionDate).toLocaleDateString('en-IN', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        })}</p>
        <p className="current-bid">
          <strong>Current Bid:</strong>
          {currentBid ? ` ₹${currentBid.bidAmount.toLocaleString()}` : ' No bids yet'}
        </p>
      </div>

      {/* Bid Form Section */}
      <div className="bid-form">
        <h2>Place Your Bid</h2>
        
        {isCurrentBidder ? (
          <p className="error-message" style={{ display: 'block' }}>
            You already have the current bid for this auction.
          </p>
        ) : auction.auction_stopped ? (
          <p className="error-message" style={{ display: 'block' }}>
            This auction has been stopped. Please check the auction details page.
          </p>
        ) : (
          <>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleBidSubmit}>
              <input type="hidden" name="auctionId" value={auction._id} />
              <div className="form-group">
                <label htmlFor="bidAmount">Your Bid Amount (₹)</label>
                <input 
                  type="number" 
                  id="bidAmount" 
                  name="bidAmount" 
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  required 
                  min="0" 
                  step="1"
                />
              </div>
              <button type="submit" className="bid-btn">Place Bid</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}