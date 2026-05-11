// client/src/services/buyer.services.js
import axios from '../utils/axiosInstance.util';

// === DASHBOARD & MAIN PAGES ===
export const getDashboardData = async () => {
  try {
    const response = await axios.get('/buyer/dashboard');
    return response.data.data || {};
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {};
  }
};

export const getAuctions = async (filters = {}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await axios.get(`/buyer/auctions?${queryParams.toString()}`);
    const { cacheStatus, responseTime } = response.data;

    // Log Redis cache status in browser console
    if (cacheStatus === 'HIT') {
      console.log(
        `%c⚡ REDIS HIT %c Auctions fetched from cache in ${responseTime}ms`,
        'background: #22c55e; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold;',
        'color: #22c55e; font-weight: bold;'
      );
    } else if (cacheStatus === 'MISS') {
      console.log(
        `%c🔍 REDIS MISS %c Auctions fetched from MongoDB Atlas in ${responseTime}ms`,
        'background: #f59e0b; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold;',
        'color: #f59e0b; font-weight: bold;'
      );
    }

    return {
      auctions: response.data.data?.auctions || [],
      cacheStatus: cacheStatus || null,
      responseTime: responseTime || null
    };
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return { auctions: [], cacheStatus: null, responseTime: null };
  }
};

export const getRentals = async (filters = {}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await axios.get(`/buyer/rentals?${queryParams.toString()}`);
    const { cacheStatus, responseTime } = response.data;

    // Log Redis cache status in browser console
    if (cacheStatus === 'HIT') {
      console.log(
        `%c⚡ REDIS HIT %c Rentals fetched from cache in ${responseTime}ms`,
        'background: #22c55e; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold;',
        'color: #22c55e; font-weight: bold;'
      );
    } else if (cacheStatus === 'MISS') {
      console.log(
        `%c🔍 REDIS MISS %c Rentals fetched from MongoDB Atlas in ${responseTime}ms`,
        'background: #f59e0b; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold;',
        'color: #f59e0b; font-weight: bold;'
      );
    }

    const data = response.data.data || { rentals: [], uniqueCities: [] };
    return {
      ...data,
      cacheStatus: cacheStatus || null,
      responseTime: responseTime || null
    };
  } catch (error) {
    console.error('Error fetching rentals:', error);
    return { rentals: [], uniqueCities: [], cacheStatus: null, responseTime: null };
  }
};

// === SINGLE ITEM DETAILS ===
export const getAuctionById = async (id) => {
  try {
    const response = await axios.get(`/buyer/auctions/${id}`);
    console.log('Auction API Response:', response.data);
    return response.data.data || null;
  } catch (error) {
    console.error('Error fetching auction:', error);
    return null;
  }
};

export const getRentalById = async (id) => {
  try {
    const response = await axios.get(`/buyer/rentals/${id}`);
    console.log('Rental API Response:', response.data);
    return response.data.data || null;
  } catch (error) {
    console.error('Error fetching rental:', error);
    return null;
  }
};

// === BIDDING & RENTAL BOOKING ===
export const placeBid = async (bidData) => {
  try {
    console.log('Sending bid data:', bidData); // Debug log
    const response = await axios.post('/buyer/auction/place-bid', bidData);
    console.log('Bid response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error placing bid:', error);
    console.error('Error response data:', error.response?.data); // More detailed error
    throw error;
  }
};

export const bookRental = async (rentalData) => {
  try {
    const response = await axios.post('/buyer/rentals/book', rentalData);
    return response.data;
  } catch (error) {
    console.error('Error booking rental:', error);
    throw error;
  }
};

export const processRentalPayment = async (data) => {
  try {
    const response = await axios.post('/buyer/rental', data);
    return response.data;
  } catch (error) {
    console.error('Error processing rental payment:', error);
    throw error;
  }
};

// === PURCHASES ===
export const getPurchases = async () => {
  try {
    const response = await axios.get('/buyer/purchases');
    return response.data.data || { auctionPurchases: [], rentals: [], pastRentals: [] };
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return { auctionPurchases: [], rentals: [], pastRentals: [] };
  }
};

export const getPurchaseDetails = async (id) => {
  try {
    const response = await axios.get(`/buyer/purchases/${id}`);
    return response.data.data?.purchase || null;
  } catch (error) {
    console.error('Error fetching purchase details:', error);
    return null;
  }
};

// === CHAT / CONTACT SELLER ===
export const createOrGetChatForPurchase = async (purchaseId) => {
  try {
    const response = await axios.post(`/chat/create/purchase/${purchaseId}`);
    return response.data.data?.chat || null;
  } catch (error) {
    console.error('Error creating/getting chat for purchase:', error);
    return null;
  }
};

export const createOrGetChatForRental = async (rentalId) => {
  try {
    const response = await axios.post(`/chat/create/rental/${rentalId}`);
    return response.data.data?.chat || null;
  } catch (error) {
    console.error('Error creating/getting chat for rental:', error);
    return null;
  }
};

export const createOrGetChatForAuction = async (auctionId) => {
  try {
    console.log('Creating chat for auction:', auctionId);
    const response = await axios.post(`/chat/create/auction/${auctionId}`);
    console.log('Chat creation response:', response.data);
    return response.data.data?.chat || null;
  } catch (error) {
    console.error('Error creating/getting chat for auction:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.message);
    throw error; // Re-throw to let the caller handle it
  }
};

// === AUCTION PAYMENTS ===
export const getAuctionPaymentDetails = async (auctionId) => {
  try {
    const response = await axios.get(`/buyer/auction/confirm-payment/${auctionId}`);
    return response.data.data || null;
  } catch (error) {
    console.error('Error fetching auction payment details:', error);
    return null;
  }
};

export const completeAuctionPayment = async (purchaseId, paymentMethod) => {
  try {
    const response = await axios.post(`/buyer/auction/complete-payment/${purchaseId}`, {
      paymentMethod
    });
    return response.data;
  } catch (error) {
    console.error('Error completing auction payment:', error);
    throw error;
  }
};

// === STRIPE CHECKOUT EXPERIMENTAL ===
export const createCheckoutSession = async (paymentData) => {
  try {
    const response = await axios.post('/buyer/payment/create-checkout-session', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const verifyPaymentSession = async (sessionId) => {
  try {
    const response = await axios.get(`/buyer/payment/verify-session?sessionId=${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error verifying payment session:', error);
    throw error;
  }
};

// === MY BIDS ===
export const getMyBids = async () => {
  try {
    const response = await axios.get('/buyer/bids');
    console.log('MyBids API response:', response.data); // Debug log
    // FIX: Use auctionsWithBids instead of bids
    return response.data.data?.auctionsWithBids || [];
  } catch (error) {
    console.error('Error fetching my bids:', error);
    return [];
  }
};

// === WISHLIST ===
export const getWishlist = async () => {
  try {
    const response = await axios.get('/buyer/wishlist');
    console.log('Wishlist API response:', response.data);

    // Handle both response formats
    if (response.data.data) {
      // If using getWishlistApi endpoint
      if (response.data.data.wishlist) {
        return response.data.data.wishlist;
      }
      // If using getWishlist endpoint with populated data
      if (response.data.data.auctionWishlist || response.data.data.rentalWishlist) {
        return {
          auctions: response.data.data.auctionWishlist || [],
          rentals: response.data.data.rentalWishlist || []
        };
      }
      // Direct format with auctions and rentals
      if (response.data.data.auctions || response.data.data.rentals) {
        return {
          auctions: response.data.data.auctions || [],
          rentals: response.data.data.rentals || []
        };
      }
    }

    return { auctions: [], rentals: [] };
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return { auctions: [], rentals: [] };
  }
};

export const addToWishlist = async (id, type) => {
  try {
    const payload = type === 'auction'
      ? { auctionId: id, type }
      : { rentalId: id, type };

    const response = await axios.post('/buyer/wishlist', payload);
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (id, type) => {
  try {
    const payload = type === 'auction'
      ? { auctionId: id, type }
      : { rentalId: id, type };

    const response = await axios.delete('/buyer/wishlist', { data: payload });
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

// === PROFILE ===
export const getProfile = async () => {
  try {
    const response = await axios.get('/buyer/profile');
    return response.data.data?.user || null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await axios.put('/buyer/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await axios.post('/buyer/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export const uploadPhoto = async (formData) => {
  try {
    const response = await axios.post('/buyer/upload/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

// === NOTIFICATIONS ===
export const getNotifications = async () => {
  try {
    const response = await axios.get('/buyer/notifications');
    return response.data.data?.notifications || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.put(`/buyer/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axios.post('/buyer/notifications/mark-all-read');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const response = await axios.get('/buyer/notifications/unread-count');
    return response.data.data?.unreadCount || 0;
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    return 0;
  }
};

// === ABOUT US ===
export const getAboutUs = async () => {
  try {
    const response = await axios.get('/buyer/about');
    return response.data.data || {};
  } catch (error) {
    console.error('Error fetching about us:', error);
    return {};
  }
};

// Remove the React hooks from this file and create separate custom hooks

// === REVIEWS ===
export const addReview = async (rentalId, reviewData) => {
  try {
    const response = await axios.post(`/buyer/rentals/${rentalId}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

export const getReviews = async (rentalId) => {
  try {
    const response = await axios.get(`/buyer/rentals/${rentalId}/reviews`);
    return response.data.data?.reviews || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const checkCanReview = async (rentalId) => {
  try {
    const response = await axios.get(`/buyer/rentals/${rentalId}/can-review`);
    return response.data.data || { canReview: false };
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return { canReview: false };
  }
};

