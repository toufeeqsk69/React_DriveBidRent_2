import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { clearSuccess, clearError } from '../../redux/slices/authSlice';
import axiosInstance from '../../utils/axiosInstance.util';
import Footer from '../components/Footer';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════
   SPLASH SCREEN — shown only on the FIRST visit per
   browser session while the Render backend cold-starts.
   Disappears as soon as the backend responds.
   ═══════════════════════════════════════════════════════ */
const SplashScreen = ({ onReady }) => {
  const [dots, setDots] = useState('');
  const [fadingOut, setFadingOut] = useState(false);

  /* Animated dots */
  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(id);
  }, []);

  /* When parent signals ready, fade out then unmount */
  useEffect(() => {
    if (onReady === true && !fadingOut) {
      setFadingOut(true);
    }
  }, [onReady, fadingOut]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={fadingOut ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Montserrat", sans-serif',
      }}
    >
      <style>{`
        @keyframes splashPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.06); opacity: 0.85; }
        }
        @keyframes splashBar {
          0%   { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes splashDot {
          0%, 80%, 100% { transform: scale(0); opacity: 0; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Logo Mark */}
      <div style={{
        width: 72, height: 72, borderRadius: 18,
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 30px rgba(245, 158, 11, 0.35)',
        animation: 'splashPulse 2s ease-in-out infinite',
        marginBottom: 28,
      }}>
        <span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>D</span>
      </div>

      {/* Brand name */}
      <h1 style={{
        fontSize: '2rem', fontWeight: 900,
        color: '#fff', letterSpacing: '-0.02em',
        margin: 0,
      }}>
        Drive<span style={{ color: '#f59e0b' }}>Bid</span>Rent
      </h1>

      {/* Progress bar */}
      <div style={{
        width: 200, height: 3, borderRadius: 2,
        background: 'rgba(255,255,255,0.08)',
        marginTop: 28, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: 'linear-gradient(90deg, #f59e0b, #d97706)',
          animation: 'splashBar 2.5s ease-in-out infinite',
        }} />
      </div>

      {/* Status text */}
      <p style={{
        marginTop: 18, fontSize: '0.8125rem',
        color: 'rgba(255,255,255,0.4)', fontWeight: 600,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        minWidth: 200, textAlign: 'center',
      }}>
        Connecting to server{dots}
      </p>

      {/* Three bouncing dots */}
      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#f59e0b',
            animation: `splashDot 1.4s ease-in-out ${i * 0.16}s infinite`,
          }} />
        ))}
      </div>
    </motion.div>
  );
};


const HomePage = () => {
  const [topRentals, setTopRentals] = useState([]);
  const [topAuctions, setTopAuctions] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { success, error } = useSelector((state) => state.auth);

  /* ── Splash state ─────────────────────────────────
     Only show splash on the FIRST visit of the session
     (cold-start scenario for Render backend).
     ────────────────────────────────────────────────── */
  const alreadyLoaded = sessionStorage.getItem('dbr_splash_done') === '1';
  const [showSplash, setShowSplash] = useState(!alreadyLoaded);
  const [backendReady, setBackendReady] = useState(false);
  const splashMinShown = useRef(false);

  // Show logout success or other auth messages
  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearSuccess());
    }
  }, [success, dispatch]);

  // Show auth errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // show loginMessage once using toast
  useEffect(() => {
    const message = localStorage.getItem('loginMessage');
    if (message) {
      toast.error(message);
      localStorage.removeItem('loginMessage');
    }
  }, []);

  // fetch home data on mount
  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        const response = await axiosInstance.get('/home/data');
        if (response?.data?.success) {
          setTopRentals(response.data.data.topRentals || []);
          setTopAuctions(response.data.data.topAuctions || []);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      }
    };

    /* Show splash for at least 1.2s so it doesn't just flash */
    const minTime = new Promise(resolve => setTimeout(() => {
      splashMinShown.current = true;
      resolve();
    }, 1200));

    Promise.all([fetchHomeData(), minTime]).then(() => {
      if (!isMounted) return;
      setBackendReady(true);
      /* Mark session so splash won't show again on navigation back */
      sessionStorage.setItem('dbr_splash_done', '1');
      /* Give the fade-out animation 500ms then unmount */
      setTimeout(() => {
        if (isMounted) setShowSplash(false);
      }, 550);
    });

    return () => { isMounted = false; };
  }, []);

  const handleAuth = (path) => {
    navigate(path);
  };

  // eslint-disable-next-line no-unused-vars
  const isLoggedIn = () => {
    // Simple check - in full app, use a protected route or store
    return document.cookie.includes('jwt=');
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Montserrat", sans-serif;
        }
        body {
          background-color: #ffffff;
          color: #333333;
        }
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 15px 50px;
          box-shadow: 0px 2px 20px rgba(255, 107, 0, 0.2);
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 1000;
        }
        .logo {
          font-size: 2rem;
          font-weight: 800; /* Increased from bold to 800 */
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #ff6b00;
        }
        .navbar ul {
          list-style: none;
          display: flex;
          gap: 35px;
        }
        .navbar ul li {
          display: inline;
        }
        .navbar ul li a {
          text-decoration: none;
          color: #333333;
          font-size: 1.3rem;
          font-weight: 600; /* Increased from 500 to 600 */
          transition: color 0.3s ease, transform 0.3s ease;
          cursor: pointer;
        }
        .navbar ul li a:not(.settings-btn):hover {
          color: #ff6b00;
          transform: scale(1.1);
        }
        .auth-buttons {
          display: flex;
          gap: 10px;
          position: relative;
        }
        .auth-buttons button {
          padding: 8px 15px;
          border: 1px solid #ff6b00;
          cursor: pointer;
          font-size: 16px;
          font-weight: 700; /* Increased from bold to 700 */
          transition: all 0.3s ease;
          border-radius: 5px;
        }
        .login {
          background: white;
          color: #ff6b00;
        }
        .signup {
          background: #ff6b00;
          color: white;
        }
        .login:hover {
          background: #ff6b00;
          color: white;
        }
        .signup:hover {
          background: white;
          color: #ff6b00;
        }
        .hero {
          position: relative;
          height: 500px;
          text-align: left;
          margin-top: 60px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding-left: 50px;
        }
        .hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 0;
        }
        .hero-content {
          position: relative;
          z-index: 10;
          color: #333333;
          max-width: 600px;
        }
        .hero-content h1 {
          font-size: 3rem;
          font-weight: 800; /* Increased from bold to 800 */
          color: #ff6b00;
        }
        .hero-content p {
          font-size: 1.5rem;
          margin-top: 10px;
          color: #333333;
          font-weight: 500; /* Added font-weight */
        }
        .cta-btn {
          padding: 12px 24px;
          font-size: 1.2rem;
          font-weight: 700; /* Increased from bold to 700 */
          background: #ff6b00;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.3s ease;
          margin-top: 20px;
        }
        .cta-btn:hover {
          background: #e65c00;
          transform: scale(1.05);
        }
        .about {
          text-align: center;
          padding: 50px;
        }
        .about h2 {
          font-size: 28px;
          margin-bottom: 15px;
          color: #ff6b00;
          font-weight: 700; /* Added font-weight */
        }
        .about p {
          font-size: 18px;
          color: #666666;
          max-width: 800px;
          margin: auto;
          font-weight: 500; /* Added font-weight */
        }
        .join-us {
          text-align: center;
          padding: 50px;
          background: #f8f8f8;
        }
        .join-us h2 {
          font-size: 2rem;
          margin-bottom: 20px;
          font-weight: 700; /* Increased from bold to 700 */
          color: #ff6b00;
        }
        .join-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          max-width: 900px;
          margin: auto;
          justify-items: center;
        }
        .join-box {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-align: center;
          width: 100%;
          max-width: 300px;
        }
        .join-box:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 15px rgba(255, 107, 0, 0.2);
        }
        .join-box h3 {
          font-size: 1.4rem;
          margin: 10px 0;
          color: #ff6b00;
          font-weight: 600; /* Added font-weight */
        }
        .join-box p {
          font-size: 1rem;
          color: #666666;
          margin: 10px 0;
          font-weight: 500; /* Added font-weight */
        }
        .join-btn {
          padding: 10px 20px;
          font-size: 1rem;
          font-weight: 700; /* Increased from bold to 700 */
          color: white;
          background: #ff6b00;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s ease;
          margin-top: 10px;
        }
        .join-btn:hover {
          background: #e65c00;
        }
        .top-rentals {
          text-align: center;
          padding: 50px;
          background: #f8f8f8;
        }
        .top-rentals h2 {
          font-size: 2rem;
          margin-bottom: 20px;
          font-weight: 700; /* Increased from bold to 700 */
          color: #ff6b00;
        }
        .rental-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          max-width: 1200px;
          margin: auto;
        }
        .rental-box {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-align: center;
        }
        .rental-box:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 15px rgba(255, 107, 0, 0.2);
        }
        .rental-box img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 5px;
        }
        .rental-box h3 {
          font-size: 1.4rem;
          margin: 10px 0;
          color: #ff6b00;
          font-weight: 600; /* Added font-weight */
        }
        .rental-box p {
          font-size: 1.2rem;
          color: #333333;
          font-weight: 600; /* Increased from bold to 600 */
        }
        .rent-btn {
          display: inline-block;
          margin-top: 10px;
          padding: 10px 20px;
          font-size: 1rem;
          font-weight: 700; /* Increased from bold to 700 */
          color: white;
          background: #ff6b00;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .rent-btn:hover {
          background: #e65c00;
        }
        .top-auctions {
          text-align: center;
          padding: 50px;
          background: #f8f8f8;
        }
        .top-auctions h2 {
          font-size: 2rem;
          margin-bottom: 20px;
          font-weight: 700; /* Increased from bold to 700 */
          color: #ff6b00;
        }
        .auction-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          max-width: 1200px;
          margin: auto;
        }
        .auction-box {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-align: center;
        }
        .auction-box:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 15px rgba(255, 107, 0, 0.2);
        }
        .auction-box img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 5px;
        }
        .auction-box h3 {
          font-size: 1.4rem;
          margin: 10px 0;
          color: #ff6b00;
          font-weight: 600; /* Added font-weight */
        }
        .auction-box p {
          font-size: 1.2rem;
          color: #333333;
          font-weight: 600; /* Increased from bold to 600 */
        }
        .bid-btn {
          display: inline-block;
          margin-top: 10px;
          padding: 10px 20px;
          font-size: 1rem;
          font-weight: 700; /* Increased from bold to 700 */
          color: white;
          background: #ff6b00;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .bid-btn:hover {
          background: #e65c00;
        }
        .see-more-container {
          text-align: center;
          margin-top: 20px;
        }
        .see-more-btn {
          display: inline-block;
          padding: 10px 20px;
          font-size: 1rem;
          font-weight: 700; /* Increased from bold to 700 */
          color: white;
          background: #ff6b00;
          border: none;
          border-radius: 5px;
          text-decoration: none;
          transition: background 0.3s ease;
          cursor: pointer;
        }
        .see-more-btn:hover {
          background: #e65c00;
        }
        .vehicle-types {
          text-align: center;
          padding: 50px;
          background: #f8f8f8;
        }
        .vehicle-types h2 {
          font-size: 2rem;
          margin-bottom: 20px;
          font-weight: 700; /* Increased from bold to 700 */
          color: #ff6b00;
        }
        .vehicle-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          max-width: 1200px;
          margin: auto;
        }
        .vehicle-box {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-align: center;
          width: 100%;
          max-width: 300px;
        }
        .vehicle-box:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 15px rgba(255, 107, 0, 0.2);
        }
        .vehicle-box img {
          width: 100%;
          height: 120px;
          object-fit: contain;
          object-position: center;
          border-radius: 5px;
          background-color: white;
        }
        .vehicle-box h3 {
          font-size: 1.4rem;
          margin: 10px 0;
          color: #ff6b00;
          font-weight: 600; /* Added font-weight */
        }
        footer {
          margin-top: 80px;
          color: white;
          padding: 30px 10px;
          text-align: center;
          border-top: 3px solid #ff6b00;
          background-color: #333333;
        }
        .footerbox {
          display: flex;
          justify-content: space-evenly;
          flex-wrap: wrap;
          padding: 20px;
        }
        .footercontainer {
          width: 30%;
          min-width: 250px;
          text-align: left;
          padding: 10px;
        }
        .footercontainer h3 {
          border-bottom: 3px solid #ff6b00;
          display: inline-block;
          padding-bottom: 5px;
          margin-bottom: 15px;
          font-weight: 600; /* Added font-weight */
        }
        .footercontainer ul {
          list-style: none;
          padding: 0;
        }
        .footercontainer ul li {
          margin: 8px 0;
          font-weight: 500; /* Added font-weight */
        }
        .footercontainer ul li a {
          color: white;
          text-decoration: none;
          transition: 0.3s;
          font-weight: 500; /* Added font-weight */
        }
        .footercontainer ul li a:hover {
          color: #ff6b00;
          text-decoration: underline;
        }
        .footercontainer p {
          margin: 8px 0;
          font-weight: 500; /* Added font-weight */
        }
        .footercontainer a {
          color: white;
          text-decoration: none;
          font-weight: 500; /* Added font-weight */
        }
        .footercontainer a:hover {
          color: #ff6b00;
        }
        .soc-med-img {
          width: 35px;
          height: auto;
          margin: 0 8px;
          transition: transform 0.3s ease-in-out;
        }
        .soc-med-img:hover {
          transform: scale(1.2);
        }
        .social-icons {
          display: flex;
          gap: 15px;
          justify-content: left;
          margin-top: 10px;
        }
        .footer-copy {
          margin-top: 20px;
          font-size: 14px;
          opacity: 0.8;
          font-weight: 500; /* Added font-weight */
        }
      `}</style>

      {showSplash && <SplashScreen onReady={backendReady} />}

          <header className="navbar">
            <div className="logo">DriveBidRent</div>
            <nav>
              <ul>
                <li><a onClick={() => navigate('#auctions')}>Buy</a></li>
                <li><a onClick={() => navigate('#join-us')}>Sell</a></li>
                <li><a onClick={() => navigate('#rentals')}>Rent</a></li>
                <li><a onClick={() => navigate('#auctions')}>Auction</a></li>
              </ul>
            </nav>
            <div className="auth-buttons">
              <button className="login" onClick={() => handleAuth('/login')}>Login</button>
              <button className="signup" onClick={() => handleAuth('/signup')}>
                Sign Up
              </button>
            </div>
          </header>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <section className="hero">
              <img
                src="/css/photos/mainPhoto.png"
                alt="Car Banner"
                className="hero-img"
              />
              <div className="hero-content">
                <h1>Find the Perfect Car for You</h1>
                <p>Buy, Sell, Rent, and Auction vehicles with ease.</p>
              </div>
            </section>

      <section className="about">
        <h2>Welcome to DriveBidRent</h2>
        <p>
          This online platform is designed for the automotive market, enabling
          users to buy, sell, and auction vehicles with ease. It offers instant
          purchase options, live auctions, and a comprehensive car rental
          service—with the option for a professional driver.
        </p>
        <button className="cta-btn" onClick={() => handleAuth('/login')}>
          Explore Now
        </button>
      </section>

      <section className="vehicle-types">
        <h2>Vehicle Types</h2>
        <div className="vehicle-container">
          <div className="vehicle-box">
            <img src="/css/photos/images (1).jpeg" alt="Cars" />
            <h3>Cars</h3>
          </div>
          <div className="vehicle-box">
            <img src="/css/photos/images (2).jpeg" alt="Bikes" />
            <h3>Bikes</h3>
          </div>
          <div className="vehicle-box">
            <img
              src="https://www.bluebirdtravels.in/wp-content/uploads/2017/01/Tempo_Traveller_PI-1200x900-cropped.png"
              alt="Tempos"
            />
            <h3>Tempos</h3>
          </div>
        </div>
      </section>

      <section className="top-auctions" id="auctions">
        <h2>Top Auctions</h2>
        {topAuctions && topAuctions.length > 0 ? (
          <div className="auction-container">
            {topAuctions.map((auction) => (
              <div key={auction._id} className="auction-box">
                <img src={auction.vehicleImage} alt={auction.vehicleName} />
                <h3>{auction.vehicleName} ({auction.year})</h3>
                <p>Starting Bid: ₹{auction.startingBid.toLocaleString('en-IN')}</p>
                <button className="bid-btn" onClick={() => handleAuth('/login')}>
                  Place Bid
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No active auctions available at the moment.</p>
        )}
        <div className="see-more-container">
          <a className="see-more-btn" onClick={() => handleAuth('/login')}>
            See More Auctions
          </a>
        </div>
      </section>

      <section className="top-rentals" id="rentals">
        <h2>Top Rentals</h2>
        {topRentals && topRentals.length > 0 ? (
          <div className="rental-container">
            {topRentals.map((rental) => (
              <div key={rental._id} className="rental-box">
                <img src={rental.vehicleImage} alt={rental.vehicleName} />
                <h3>{rental.vehicleName} ({rental.year})</h3>
                <p>₹{rental.costPerDay.toLocaleString('en-IN')}/day</p>
                <button className="rent-btn" onClick={() => handleAuth('/login')}>
                  Rent Now
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No rentals available at the moment.</p>
        )}
        <div className="see-more-container">
          <a className="see-more-btn" onClick={() => handleAuth('/login')}>
            See More Rentals
          </a>
        </div>
      </section>

      <section className="join-us" id="join-us">
        <h2>Join Us Today</h2>
        <div className="join-container">
          <div className="join-box">
            <h3>Buyers</h3>
            <p>Find best deals on vehicles tailored to your needs.</p>
            <button className="join-btn" onClick={() => handleAuth('/signup')}>
              Join as Buyer
            </button>
          </div>
          <div className="join-box">
            <h3>Sellers</h3>
            <p>Sell your vehicles to a wide audience effortlessly.</p>
            <button className="join-btn" onClick={() => handleAuth('/signup')}>
              Join as Seller
            </button>
          </div>
          <div className="join-box">
            <h3>Mechanics</h3>
            <p>Offer your expertise to ensure vehicles are in top condition.</p>
            <button className="join-btn" onClick={() => handleAuth('/signup')}>
              Join as Mechanic
            </button>
          </div>
        </div>
      </section>

        <Footer />
          </motion.div>
    </>
  );
};

export default HomePage;