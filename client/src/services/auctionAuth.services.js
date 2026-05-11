// client/src/services/auctionAuth.services.js
import axiosInstance from '../utils/axiosInstance.util';
import { useNavigate } from 'react-router-dom';

export const auctionAuthServices = {
  signup: async (data) => {
    const res = await axiosInstance.post('/auth/auctionmanager/signup', data);
    return res.data;
  },

  login: async (credentials) => {
    // Prevent a stale token (e.g. buyer/seller token) from being reused on this login call.
    localStorage.removeItem('token');
    const res = await axiosInstance.post('/auth/auctionmanager/login', credentials);
    if (res.data?.token) {
      localStorage.setItem('token', res.data.token);
    }
    if (res.data?.user) {
      localStorage.setItem('authState', JSON.stringify({
        user: res.data.user,
        userType: res.data.user.userType,
        approved_status: res.data.user.approved_status
      }));
    }
    return res.data;
  },

  logout: async () => {
    const res = await axiosInstance.get('/auth/auctionmanager/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('authState');
    return res.data;
  }
};

export const useAuctionManagerLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await auctionAuthServices.logout();
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Auction Manager logout failed', err);
      navigate('/', { replace: true });
    }
  };

  return logout;
};
