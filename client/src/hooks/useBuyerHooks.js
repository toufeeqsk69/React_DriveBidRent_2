// client/src/hooks/useBuyerHooks.js
import { useState, useEffect } from 'react';
import { 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  updateProfile,
  changePassword
} from '../services/buyer.services';
import useProfileHook from './useProfile';

// Wishlist Hook
export const useWishlist = () => {
  const [wishlist, setWishlist] = useState({ auctions: [], rentals: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const data = await getWishlist();
      setWishlist(data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (id, type) => {
    const key = type === 'auction' ? 'auctions' : 'rentals';
    const list = wishlist[key] || [];
    return list.some(item => item._id === id);
  };

  const toggleWishlist = async (id, type) => {
    try {
      if (isInWishlist(id, type)) {
        await removeFromWishlist(id, type);
      } else {
        await addToWishlist(id, type);
      }
      // Refresh wishlist after toggle
      await fetchWishlist();
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  return { 
    wishlist, 
    loading, 
    isInWishlist, 
    toggleWishlist, 
    refreshWishlist: fetchWishlist 
  };
};

// Notifications Hook
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(notification => !notification.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };
};

// Profile Hook (bridged to Redux)
export const useProfile = () => {
  const { profile, loading, error: _error, refresh } = useProfileHook();

  const updateProfileData = async (profileData) => {
    try {
      const result = await updateProfile(profileData);
      if (result?.success) {
        // refresh redux profile after successful update
        refresh();
      }
      return result;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const changeUserPassword = async (passwordData) => {
    try {
      const result = await changePassword(passwordData);
      return result;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

  return {
    profile,
    loading,
    updateProfile: updateProfileData,
    changePassword: changeUserPassword,
    refreshProfile: refresh
  };
};