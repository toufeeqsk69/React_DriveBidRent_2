// client/src/services/superadmin.services.js
import axios from 'axios';

const API_URL = '/api/superadmin';

const superadminServices = {
  // Dashboard
  getDashboard: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard`, { withCredentials: true });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Analytics
  getAnalytics: async () => {
    try {
      const response = await axios.get(`${API_URL}/analytics`, { withCredentials: true });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // User Activities
  getUserActivities: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axios.get(`${API_URL}/user-activities?${queryParams}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getUserDetails: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/user-details/${userId}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Revenue
  getRevenue: async (period = '12months') => {
    try {
      const response = await axios.get(`${API_URL}/revenue?period=${period}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Trends
  getTrends: async () => {
    try {
      const response = await axios.get(`${API_URL}/trends`, { withCredentials: true });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Profile
  getProfile: async () => {
    try {
      const response = await axios.get(`${API_URL}/profile`, { withCredentials: true });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updatePassword: async (passwordData) => {
    try {
      const response = await axios.post(`${API_URL}/update-password`, passwordData, { withCredentials: true });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create Admin
  createAdmin: async (adminData) => {
    try {
      const response = await axios.post(`${API_URL}/create-admin`, adminData, { withCredentials: true });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default superadminServices;
