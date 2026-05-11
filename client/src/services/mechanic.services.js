// client/src/services/mechanic.services.js
import axiosInstance from '../utils/axiosInstance.util';

export const getDashboard = () => axiosInstance.get('/mechanic/dashboard');
export const getPendingTasks = () => axiosInstance.get('/mechanic/pending-tasks');
export const acceptPendingTask = (id) => axiosInstance.post(`/mechanic/pending-tasks/${id}/accept`);
export const declinePendingTask = (id) => axiosInstance.post(`/mechanic/pending-tasks/${id}/decline`);
export const getCurrentTasks = () => axiosInstance.get('/mechanic/current-tasks');
export const getPastTasks = () => axiosInstance.get('/mechanic/past-tasks');
export const getVehicleDetails = (id) => axiosInstance.get(`/mechanic/vehicle-details/${id}`);
export const submitReview = (id, data) => axiosInstance.post(`/mechanic/submit-review/${id}`, data);
export const getProfile = () => axiosInstance.get('/mechanic/profile');
export const changePassword = (data) => axiosInstance.post('/mechanic/change-password', data);