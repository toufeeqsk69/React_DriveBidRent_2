// client/src/services/auth.services.js
import axiosInstance from '../utils/axiosInstance.util';
import { useNavigate } from 'react-router-dom';

export const authServices = {
  signup: async (data) => {
    const res = await axiosInstance.post('/auth/signup', data);
    return res.data;
  },

  login: async (credentials) => {
    const res = await axiosInstance.post('/auth/login', credentials);
    return res.data;
  },

  googleLogin: async (credential) => {
    const res = await axiosInstance.post('/auth/google', { credential });
    return res.data;
  },

  verifySignupOtp: async (data) => {
    const res = await axiosInstance.post('/auth/verify-signup-otp', data);
    return res.data;
  },

  logout: async () => {
    const res = await axiosInstance.get('/auth/logout');
    return res.data;
  }
};

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await authServices.logout();
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Logout failed', err);
      navigate('/', { replace: true });
    }
  };

  return logout;
};