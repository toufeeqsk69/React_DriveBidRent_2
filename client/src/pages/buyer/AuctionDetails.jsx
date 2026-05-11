// client/src/pages/buyer/AuctionDetails.jsx
import { useState, useEffect, useCallback } from 'react';
import './AuctionDetails.css';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { getAuctionById, placeBid, createOrGetChatForAuction } from '../../services/buyer.services';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AuctionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [currentBid, setCurrentBid] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCurrentBidder, setIsCurrentBidder] = useState(false);

  // Image gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchAuctionDetails = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        const data = await getAuctionById(id);
        setAuction(data.auction);
        setCurrentBid(data.currentBid);
        setIsCurrentBidder(data.isCurrentBidder || false);
      } catch (error) {
        console.error('Error fetching auction details:', error);
        setError('Failed to load auction details');
      } finally {
        if (isInitial) setLoading(false);
      }
    };
    
    fetchAuctionDetails(true);
    
    // Setup Socket.io for real-time bid updates
    const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'https://drivebidrent.onrender.com';
    const socket = io(backendUrl, { withCredentials: true });

    socket.on('connect', () => {
      socket.emit('join_auction', id);
    });

    socket.on('new_bid', () => {
      if (!error) fetchAuctionDetails(false);
    });

    return () => {
      socket.emit('leave_auction', id);
      socket.disconnect();
    };
  }, [id, error]);

  const fetchAuctionDetails = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const data = await getAuctionById(id);
      setAuction(data.auction);
      setCurrentBid(data.currentBid);
      setIsCurrentBidder(data.isCurrentBidder || false);
    } catch (error) {
      console.error('Error fetching auction details:', error);
      setError('Failed to load auction details');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  // Build images array - support both old (vehicleImage) and new (mainImage) schemas
  const getImages = useCallback(() => {
    if (!auction) return [];
    
    const imagesList = [];
    
    // 1. Add the main primary image
    if (auction.mainImage) {
      imagesList.push(auction.mainImage);
    } else if (auction.vehicleImage) {
      imagesList.push(auction.vehicleImage);
    }
    
    // 2. Add the secondary/additional images (avoiding duplicates)
    if (auction.additionalImages && auction.additionalImages.length > 0) {
      imagesList.push(...auction.additionalImages);
    } else if (auction.vehicleImages && auction.vehicleImages.length > 0) {
      const additional = auction.vehicleImages.filter(img => img !== auction.vehicleImage && img !== auction.mainImage);
      imagesList.push(...additional);
    }
    
    return imagesList;
  }, [auction]);

  const images = getImages();

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    
    if (isCurrentBidder) {
      setError('You already have the current bid for this auction');
      return;
    }

    if (auction?.auction_stopped) {
      setError('This auction has been stopped. Please check the auction details page.');
      return;
    }

    const bidValue = parseFloat(bidAmount);
    const minBid = calculateMinBid();

    if (isNaN(bidValue) || bidValue <= 0) {
      setError('Please enter a valid bid amount.');
      return;
    }

    if (bidValue < minBid) {
      setError(`Your bid must be at least ₹${minBid.toLocaleString()}.`);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const result = await placeBid({
        auctionId: id,
        bidAmount: bidValue
      });

      if (result.success) {
        setSuccess('Your bid has been placed successfully!');
        setBidAmount('');
        setCurrentBid({ bidAmount: bidValue });
        setIsCurrentBidder(true);
        fetchAuctionDetails();
      } else {
        setError(result.message || 'Failed to place bid. Please try again.');
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateMinBid = () => {
    if (!auction) return 0;
    return currentBid?.bidAmount ? currentBid.bidAmount + 2000 : (auction.startingBid || 0);
  };

  const handleBidAmountChange = (value) => {
    setBidAmount(value);
    setError('');
  };

  const handleContactSeller = async () => {
    try {
      setChatLoading(true);
      setError('');
      const chat = await createOrGetChatForAuction(id);
      if (chat) {
        navigate(`/buyer/chats/${chat._id}`);
      } else {
        setError('Unable to create chat. You may need to be logged in.');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create chat';
      setError(`Error: ${errorMessage}`);
    } finally {
      setChatLoading(false);
    }
  };

  // Build documents list from vehicleDocumentation
  const getDocuments = () => {
    if (!auction?.vehicleDocumentation) return [];
    const docs = auction.vehicleDocumentation;
    const list = [];

    if (docs.registrationCertificate) {
      list.push({ label: 'Registration Certificate (RC)', url: docs.registrationCertificate });
    }
    if (docs.insuranceDocument) {
      list.push({ label: 'Insurance Document', url: docs.insuranceDocument });
    }
    if (docs.fitnessCertificate) {
      list.push({ label: 'Fitness Certificate', url: docs.fitnessCertificate });
    }
    if (docs.rcTransferForm29) {
      list.push({ label: 'RC Transfer Form 29', url: docs.rcTransferForm29 });
    }

    if (docs.roadTaxReceipt) {
      list.push({ label: 'Road Tax Receipt', url: docs.roadTaxReceipt });
    }
    if (docs.addressProof) {
      list.push({ label: 'Address Proof', url: docs.addressProof });
    }

    return list;
  };

  if (loading) return <LoadingSpinner />;

  if (!auction) {
    return (
      <div className="ad-not-found">
        <svg className="ad-not-found__icon" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h2>Auction not found</h2>
        <p>This auction may have ended or been removed.</p>
      </div>
    );
  }

  const minBid = calculateMinBid();
  const documents = getDocuments();

  console.log("=== AUCTION DETAILS RENDER ===", {
    auctionId: auction?._id,
    vehicleName: auction?.vehicleName,
    hasContent: !!auction,
    loadingState: loading
  });

  return (
    <div className="ad-page">
      {/* ────────── IMAGE GALLERY ────────── */}
      <section className="ad-gallery">
        <div className="ad-gallery__main">
          {/* Main Image */}
          <div className="ad-gallery__hero">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${auction.vehicleName} - View ${index + 1}`}
                className={`ad-gallery__hero-img ${index === currentImageIndex ? 'active' : ''}`}
              />
            ))}

            {/* Gradient overlay for name */}
            <div className="ad-gallery__overlay">
              <div className="ad-gallery__badge">
                <span className="ad-gallery__live-dot" />
                LIVE AUCTION
              </div>
              <h1 className="ad-gallery__title">{auction.vehicleName}</h1>
              {auction.carType && (
                <span className="ad-gallery__type">{auction.carType} · {auction.year}</span>
              )}
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button className="ad-gallery__arrow ad-gallery__arrow--left" onClick={handlePrevImage}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="ad-gallery__arrow ad-gallery__arrow--right" onClick={handleNextImage}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="ad-gallery__counter">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="ad-gallery__thumbs">
              {images.map((img, index) => (
                <button
                  key={index}
                  className={`ad-gallery__thumb ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img src={img} alt={`Thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="ad-content" style={{ display: 'grid', gridTemplateColumns: '1fr', border: '5px solid purple', minHeight: '300px', backgroundColor: '#fff', margin: '2rem 1rem' }}>
        <ErrorBoundary>
          {/* Left Column */}
          <div className="ad-content__left">

          {/* Quick Stats Bar */}
          <div className="ad-stats">
            <div className="ad-stat">
              <span className="ad-stat__label">Current Bid</span>
              <span className="ad-stat__value ad-stat__value--highlight">
                ₹{currentBid?.bidAmount ? currentBid.bidAmount.toLocaleString() : (auction.startingBid || 0).toLocaleString()}
              </span>
            </div>
            <div className="ad-stat__divider" />
            <div className="ad-stat">
              <span className="ad-stat__label">Starting Bid</span>
              <span className="ad-stat__value">₹{(auction.startingBid || 0).toLocaleString()}</span>
            </div>
            <div className="ad-stat__divider" />
            <div className="ad-stat">
              <span className="ad-stat__label">Condition</span>
              <span className="ad-stat__value ad-stat__value--green">{auction.condition || 'N/A'}</span>
            </div>
            <div className="ad-stat__divider" />
            <div className="ad-stat">
              <span className="ad-stat__label">Auction Date</span>
              <span className="ad-stat__value">
                {auction.auctionDate
                  ? new Date(auction.auctionDate).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })
                  : 'TBD'}
              </span>
            </div>
          </div>

          {/* Vehicle Specifications */}
          <div className="ad-card">
            <h2 className="ad-card__title">Vehicle Specifications</h2>
            <div className="ad-specs">
              <div className="ad-spec">
                <span className="ad-spec__label">Year</span>
                <span className="ad-spec__value">{auction.year}</span>
              </div>
              {auction.carType && (
                <div className="ad-spec">
                  <span className="ad-spec__label">Car Type</span>
                  <span className="ad-spec__value">{auction.carType}</span>
                </div>
              )}
              <div className="ad-spec">
                <span className="ad-spec__label">Fuel Type</span>
                <span className="ad-spec__value ad-spec__value--capitalize">{auction.fuelType}</span>
              </div>
              <div className="ad-spec">
                <span className="ad-spec__label">Transmission</span>
                <span className="ad-spec__value ad-spec__value--capitalize">{auction.transmission}</span>
              </div>
              <div className="ad-spec">
                <span className="ad-spec__label">Mileage</span>
                <span className="ad-spec__value">{(auction.mileage || 0).toLocaleString()} km</span>
              </div>
              <div className="ad-spec">
                <span className="ad-spec__label">Seller</span>
                <span className="ad-spec__value">
                  {auction.seller?.firstName || auction.sellerId?.firstName}{' '}
                  {auction.seller?.lastName || auction.sellerId?.lastName}
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle Documents */}
          {documents.length > 0 && (
            <div className="ad-card">
              <h2 className="ad-card__title">Vehicle Documents</h2>
              <p className="ad-card__subtitle">Click to view document in a new tab</p>
              <div className="ad-documents">
                {documents.map((doc, index) => (
                  <a
                    key={index}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ad-doc-link"
                  >
                    <svg className="ad-doc-link__icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="ad-doc-link__label">{doc.label}</span>
                    <svg className="ad-doc-link__arrow" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Vehicle Verification Report */}
          {auction.vehicleDocumentation && (
            <div className="ad-card ad-card--verification">
              <h2 className="ad-card__title">Vehicle Verification Report</h2>

              {/* Key Highlights Grid */}
              <div className="ad-highlights">
                <div className="ad-highlight">
                  <span className="ad-highlight__label">Ownership</span>
                  <span className="ad-highlight__value ad-highlight__value--blue">
                    {auction.vehicleDocumentation.ownershipType}
                  </span>
                </div>

                <div className="ad-highlight">
                  <span className="ad-highlight__label">Insurance</span>
                  <span className={`ad-highlight__value ${auction.vehicleDocumentation.insuranceStatus === 'Valid' ? 'ad-highlight__value--green' : 'ad-highlight__value--red'}`}>
                    {auction.vehicleDocumentation.insuranceStatus}
                  </span>
                </div>

                <div className="ad-highlight">
                  <span className="ad-highlight__label">Accidents</span>
                  <span className={`ad-highlight__value ${auction.vehicleDocumentation.accidentHistory ? 'ad-highlight__value--red' : 'ad-highlight__value--green'}`}>
                    {auction.vehicleDocumentation.accidentHistory
                      ? `${auction.vehicleDocumentation.numberOfAccidents} Reported`
                      : 'No Accidents'}
                  </span>
                </div>



                <div className="ad-highlight">
                  <span className="ad-highlight__label">Loan Status</span>
                  <span className={`ad-highlight__value ${auction.vehicleDocumentation.hypothecationStatus?.includes('Clear') ? 'ad-highlight__value--green' : 'ad-highlight__value--orange'}`}>
                    {auction.vehicleDocumentation.hypothecationStatus}
                  </span>
                </div>

                <div className="ad-highlight">
                  <span className="ad-highlight__label">PUC</span>
                  <span className={`ad-highlight__value ${auction.vehicleDocumentation.pollutionCertificate === 'Valid' ? 'ad-highlight__value--green' : 'ad-highlight__value--red'}`}>
                    {auction.vehicleDocumentation.pollutionCertificate}
                  </span>
                </div>
              </div>

              {/* Important Notices */}
              <div className="ad-notices">
                {auction.vehicleDocumentation.previousInsuranceClaims && (
                  <div className="ad-notice ad-notice--warning">
                    This vehicle has previous insurance claims
                  </div>
                )}
                {auction.vehicleDocumentation.majorRepairs && (
                  <div className="ad-notice ad-notice--warning">
                    Vehicle has undergone major repairs
                  </div>
                )}
                {!auction.vehicleDocumentation.readyForTransfer && (
                  <div className="ad-notice ad-notice--danger">
                    Transfer documentation pending — verify before bidding
                  </div>
                )}
                {auction.vehicleDocumentation.stolenVehicleCheck === 'Verified Clean' && (
                  <div className="ad-notice ad-notice--success">
                    Vehicle verified — Not reported stolen
                  </div>
                )}
              </div>
              {/* Mechanic Section */}
              {auction.assignedMechanic && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#f9fafb', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#6b7280', fontWeight: 500, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 16, height: 16, color: '#ea580c' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.492-3.053c.227-.277.467-.567.725-.841m-3.217 3.894l-2.852 2.853m-1.5-1.5l2.852-2.853m-1.5-1.5l2.852-2.853M8.25 12l2.852-2.853M15 11.25L12.75 9l-3-3m0 0l-1.5 1.5m1.5-1.5L7.5 4.5M3 12h.008v.008H3V12zm0 3h.008v.008H3V15zm0 3h.008v.008H3V18zm0 3h.008v.008H3V21zm3-9h.008v.008H6V12zm0 3h.008v.008H6V15zm0 3h.008v.008H6V18zm0 3h.008v.008H6V21z" />
                    </svg>
                    Verified By
                  </span>
                  <p style={{ color: '#111827', fontWeight: 600, margin: 0 }}>
                    {auction.assignedMechanic.firstName} {auction.assignedMechanic.lastName}
                  </p>
                </div>
              )}

              {/* Registration Info */}
              <div className="ad-registration">
                <h4 className="ad-registration__title">Registration Details</h4>
                <div className="ad-registration__grid">
                  <div>
                    <span className="ad-registration__label">Registration No</span>
                    <span className="ad-registration__value ad-registration__value--mono">
                      {auction.vehicleDocumentation.registrationNumber}
                    </span>
                  </div>
                  <div>
                    <span className="ad-registration__label">State</span>
                    <span className="ad-registration__value">{auction.vehicleDocumentation.registrationState}</span>
                  </div>
                  <div>
                    <span className="ad-registration__label">VIN</span>
                    <span className="ad-registration__value ad-registration__value--mono ad-registration__value--small">
                      {auction.vehicleDocumentation.vinNumber}
                    </span>
                  </div>
                  <div>
                    <span className="ad-registration__label">Service Records</span>
                    <span className="ad-registration__value">{auction.vehicleDocumentation.serviceHistory}</span>
                  </div>
                </div>
              </div>

              {/* Verification Badge */}
              {auction.vehicleDocumentation.documentsVerified && (
                <div className="ad-verified-badge">
                  ✓ DOCUMENTS VERIFIED BY AUCTION MANAGER
                </div>
              )}
            </div>
          )}
        </div>

        {/* ────────── Right Column - Bid Form ────────── */}
        <div className="ad-content__right">
          <div className="ad-bid-card">
            <h2 className="ad-bid-card__title">Place Your Bid</h2>

            {isCurrentBidder ? (
              <div className="ad-bid-card__status ad-bid-card__status--winning">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                You have the current highest bid!
              </div>
            ) : auction.auction_stopped ? (
              <div className="ad-bid-card__status ad-bid-card__status--stopped">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                This auction has been stopped.
              </div>
            ) : (
              <>
                {error && <div className="ad-bid-card__alert ad-bid-card__alert--error">{error}</div>}
                {success && <div className="ad-bid-card__alert ad-bid-card__alert--success">{success}</div>}

                <button 
                  type="button" 
                  onClick={() => navigate(`/buyer/live-auction/${id}`)}
                  className="ad-bid-card__submit" 
                  style={{ background: 'linear-gradient(135deg, #ff8a3d 0%, #ff4500 100%)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 0 15px rgba(255, 107, 0, 0.4)' }}
                >
                  <span style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%', boxShadow: '0 0 5px white' }}></span>
                  ENTER LIVE AUCTION ROOM
                </button>

                <div className="ad-bid-card__current">
                  <span className="ad-bid-card__current-label">Current Highest Bid</span>
                  <span className="ad-bid-card__current-value">
                    {currentBid?.bidAmount ? `₹${currentBid.bidAmount.toLocaleString()}` : 'No bids yet'}
                  </span>
                </div>

                <form onSubmit={handleBidSubmit} className="ad-bid-card__form">
                  <div className="ad-bid-card__input-group">
                    <label className="ad-bid-card__label">Your Bid Amount (₹)</label>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => handleBidAmountChange(e.target.value)}
                      required
                      min="0"
                      step="1000"
                      placeholder={`Minimum: ₹${minBid.toLocaleString()}`}
                      className="ad-bid-card__input"
                    />
                    <p className="ad-bid-card__min-hint">
                      Minimum bid: <strong>₹{minBid.toLocaleString()}</strong>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="ad-bid-card__submit"
                  >
                    {submitting ? (
                      <>
                        <span className="ad-bid-card__spinner" />
                        Placing Bid...
                      </>
                    ) : (
                      'Place Bid Now'
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Contact Seller */}
            <div className="ad-bid-card__contact">
              <button
                onClick={handleContactSeller}
                disabled={chatLoading}
                className="ad-bid-card__contact-btn"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {chatLoading ? 'Loading...' : 'Book an Appointment'}
              </button>
              <p className="ad-bid-card__contact-hint">Schedule a viewing or chat with the seller</p>
            </div>
            </div>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}