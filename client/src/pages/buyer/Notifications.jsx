// client/src/pages/buyer/dashboard/Notifications.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.util';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get('/buyer/notifications');
      if (res.data.success) {
        // backend returns { success, message, data: { notifications, unreadCount } }
        const notifications = res.data.data?.notifications || [];
        // Map all fetched notifications to read status so UI reflects it immediately
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        
        // mark the notification-flag as seen for the current user (so badge disappears)
        try {
          await axiosInstance.put('/buyer/notifications/seen');
          // notify other components (Navbar) to refresh profile/badge
          window.dispatchEvent(new Event('notificationsSeen'));
        } catch (err) {
          console.error('Failed to clear notification flag:', err);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const _navigate = useNavigate();

  const markAsRead = async (id) => {
    try {
      // backend expects PUT
      await axiosInstance.put(`/buyer/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    if (notifications.length === 0) return;
    if (!window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) return;

    try {
      await axiosInstance.post('/buyer/notifications/mark-all-read');
      // remove from UI immediately
      setNotifications([]);
      // inform other components (Navbar) to refresh and remove the dot
      window.dispatchEvent(new Event('notificationsSeen'));
      showMessage('All notifications have been cleared successfully!', 'success');
    } catch (err) {
      showMessage('Failed to clear notifications', 'error');
    }
  };

  const Icon = ({ type }) => {
    const common = 'w-6 h-6';
    switch (type) {
      case 'outbid':
        return (
          <svg className={common} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 2v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 9l7-7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 22H5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'auction_ended':
        return (
          <svg className={common} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'auction_won':
        return (
          <svg className={common} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 2l2.6 5.3L20 8.2l-4 3.9L17 18l-5-2.5L7 18l1-5.9L4 8.2l5.4-.9L12 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return (
          <svg className={common} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M15 17H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 3v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 8a6 6 0 10-12 0v4l-2 2h16l-2-2V8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
    }
  };

  const getIconStyles = (type) => {
    switch (type) {
      case 'outbid': return 'bg-red-50 text-red-600 ring-1 ring-red-100';
      case 'auction_ended': return 'bg-gray-100 text-gray-700 ring-1 ring-gray-100';
      case 'auction_won': return 'bg-green-50 text-green-600 ring-1 ring-green-100';
      default: return 'bg-yellow-50 text-yellow-600 ring-1 ring-yellow-100';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b-2 border-orange-600">
        <h1 className="text-4xl md:text-5xl font-bold text-orange-600 mb-4 sm:mb-0">Notifications</h1>
        <button
          onClick={markAllAsRead}
          disabled={notifications.length === 0}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${notifications.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
        >
          Clear All Notifications
        </button>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border transition-all duration-300 ${messageType === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-red-50 text-red-800 border-red-200'
          }`}>
          {message}
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => !notification.isRead && markAsRead(notification._id)}
              className={`bg-white rounded-xl p-6 shadow-sm border-l-4 border-orange-600 flex gap-4 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${!notification.isRead ? 'bg-orange-50' : ''
                }`}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconStyles(notification.type)}`}>
                <Icon type={notification.type} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">{notification.title}</h3>
                <p className="text-gray-600 mt-2 leading-relaxed">{notification.message}</p>
                <p className="text-sm text-gray-500 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>

                {/* Actions */}
                {notification.auctionId && notification.type === 'outbid' && (
                  <div className="flex gap-3 mt-4 flex-wrap">
                    <Link
                      to={`/buyer/auctions/${notification.auctionId._id || notification.auctionId}`}
                      className="px-5 py-2 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 transition"
                    >
                      View Auction & Place Bid
                    </Link>
                    <Link
                      to="/buyer/my-bids"
                      className="px-5 py-2 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition"
                      title="View all your bids"
                    >
                      View My Bids
                    </Link>
                  </div>
                )}

                {notification.auctionId && notification.type === 'auction_won' && (
                  <div className="mt-4">
                    <Link
                      to="/buyer/purchases"
                      className="px-6 py-2 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 transition inline-block"
                    >
                      Go to My Purchases
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <h3 className="text-2xl font-bold text-orange-600 mb-3">No Notifications</h3>
            <p className="text-gray-600">You don't have any notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}