// client/src/pages/seller/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axiosInstance from '../../../utils/axiosInstance.util';
import { logoutUser } from '../../../redux/slices/authSlice';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // Get current user from cookie or fallback
  const user = { name: 'Seller' }; // You can decode JWT if needed

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err);
      navigate('/', { replace: true });
    }
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  useEffect(() => {
    let mounted = true;
    const loadChats = async () => {
      try {
        const r = await axiosInstance.get('/chat/my-chats');
        if (!mounted) return;
        const chats = r.data?.data || [];
        const sum = chats.reduce((acc, c) => acc + (c.unreadCount || c.unread || 0), 0);
        setChatUnreadCount(sum);
      } catch (err) {
        // ignore
      }
    };
    loadChats();
    const id = setInterval(loadChats, 5000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  // update unread badge when a chat is read elsewhere
  useEffect(() => {
    const handler = (e) => {
      try {
        const { updated } = e.detail || {};
        setChatUnreadCount(prev => Math.max(0, prev - (updated || 0)));
      } catch (err) {}
    };
    window.addEventListener('chatRead', handler);
    return () => window.removeEventListener('chatRead', handler);
  }, []);

  // update chat unread badge when a chat is deleted
  useEffect(() => {
    const onDeleted = async () => {
      try {
        const r = await axiosInstance.get('/chat/my-chats');
        const chats = r.data?.data || [];
        const sum = chats.reduce((acc, c) => acc + (c.unreadCount || c.unread || 0), 0);
        setChatUnreadCount(sum);
      } catch (err) {
        console.error('Failed to refresh chat count after deletion:', err);
      }
    };
    window.addEventListener('chatDeleted', onDeleted);
    return () => window.removeEventListener('chatDeleted', onDeleted);
  }, []);

  const navLinks = [
    { to: '/seller/dashboard', label: 'Dashboard' },
    { to: '/seller/add-auction', label: 'Add Auction' },
    { to: '/seller/view-auctions', label: 'View Auctions' },
    { to: '/seller/add-rental', label: 'Add Rental' },
    { to: '/seller/view-rentals', label: 'View Rentals' },
    { to: '/seller/chats', label: 'Chat' },
    { to: '/seller/view-earnings', label: 'Earnings' },
    { to: '/seller/profile', label: 'Profile' },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/seller/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-orange-600">DriveBidRent</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`font-medium transition-colors duration-200 py-2 border-b-2 ${
                  isActive(to)
                    ? 'text-orange-600 border-orange-600'
                    : 'text-gray-700 border-transparent hover:text-orange-600'
                }`}
              >
                {label}
                {to === '/seller/chats' && chatUnreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center bg-red-500 text-white text-xs rounded-full h-5 w-5">{chatUnreadCount}</span>
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-orange-600 focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setIsOpen(false)}
                  className={`font-medium px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive(to)
                      ? 'bg-orange-100 text-orange-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {label}
                  {to === '/seller/chats' && chatUnreadCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center bg-red-500 text-white text-xs rounded-full h-5 w-5">{chatUnreadCount}</span>
                  )}
                </Link>
              ))}

              <div className="border-t border-gray-200 pt-4 px-4">
                <div className="flex flex-col space-y-3">
                  <span className="text-gray-700 font-medium text-center">
                    Welcome, {user.name}
                  </span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="bg-orange-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;