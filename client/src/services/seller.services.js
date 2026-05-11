// client/src/services/seller.services.js
import axios from '../utils/axiosInstance.util';

// === AUCTIONS ===
export const getAuctions = async () => {
  try {
    const response = await axios.get('/seller/view-auctions');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching auctions:', error);
    throw error;
  }
};

export const getAuctionById = async (id) => {
  try {
    const response = await axios.get(`/seller/auction-details/${id}`);
    return response.data.data || null;
  } catch (error) {
    console.error('Error fetching auction:', error);
    throw error;
  }
};

export const addAuction = async (auctionData) => {
  try {
    const response = await axios.post('/seller/add-auction', auctionData);
    return response.data;
  } catch (error) {
    console.error('Error adding auction:', error);
    throw error;
  }
};

export const deleteAuction = async (id) => {
  try {
    const response = await axios.delete(`/seller/auction/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting auction:', error);
    throw error;
  }
};

// === BIDS ===
export const getBidsByAuction = async (auctionId) => {
  try {
    const response = await axios.get(`/seller/view-bids/${auctionId}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching bids:', error);
    throw error;
  }
};

// === RENTALS ===
export const getRentals = async () => {
  try {
    const response = await axios.get('/seller/view-rentals');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching rentals:', error);
    throw error;
  }
};

export const getRentalById = async (id) => {
  try {
    const response = await axios.get(`/seller/rental-details/${id}`);
    return response.data.data?.rental || null;
  } catch (error) {
    console.error('Error fetching rental:', error);
    throw error;
  }
};

export const addRental = async (rentalData) => {
  try {
    const response = await axios.post('/seller/add-rental', rentalData);
    return response.data;
  } catch (error) {
    console.error('Error adding rental:', error);
    throw error;
  }
};

export const updateRental = async (id, rentalData) => {
  try {
    const response = await axios.put(`/seller/update-rental/${id}`, rentalData);
    return response.data;
  } catch (error) {
    console.error('Error updating rental:', error);
    throw error;
  }
};

export const markRentalAsReturned = async (id) => {
  try {
    const response = await axios.post(`/seller/rental/mark-returned/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error marking rental as returned:', error);
    throw error;
  }
};

export const getRentalReviews = async (id) => {
  try {
    const response = await axios.get(`/seller/rentals/${id}/reviews`);
    return response.data.data?.reviews || [];
  } catch (error) {
    console.error('Error fetching rental reviews:', error);
    throw error;
  }
};

// === EARNINGS ===
export const getEarnings = async () => {
  try {
    const response = await axios.get('/seller/view-earnings');
    return response.data.data || { totalAuctionEarnings: 0, totalRentalEarnings: 0, recentEarnings: [] };
  } catch (error) {
    console.error('Error fetching earnings:', error);
    throw error;
  }
};

// === PROFILE ===
export const getProfile = async () => {
  try {
    const response = await axios.get('/seller/profile');
    return response.data.data || null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await axios.put('/seller/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};
