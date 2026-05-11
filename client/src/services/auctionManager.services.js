// client/src/services/auctionManager.services.js

import axiosInstance from "../utils/axiosInstance.util.js";

export const auctionManagerServices = {
  // Dashboard
  getDashboard: () => axiosInstance.get('/auctionmanager/dashboard'),

  // Requests
  getRequests: () => axiosInstance.get('/auctionmanager/requests'),
  rejectRequest: (id, rejectionReason) => axiosInstance.post(`/auctionmanager/reject-request/${id}`, { rejectionReason }),

  // Pending Cars
  getPending: () => axiosInstance.get('/auctionmanager/pending'),
  getReview: (id) => axiosInstance.get(`/auctionmanager/get-review/${id}`),
  updateStatus: (id, status, startingBid) => axiosInstance.post(`/auctionmanager/update-status/${id}`, { status, ...(startingBid ? { startingBid } : {}) }),
  getPendingCarDetails: (id) => axiosInstance.get(`/auctionmanager/pending-car-details/${id}`),

  // Approved Cars
  getApproved: () => axiosInstance.get('/auctionmanager/approved'),

  // Assign Mechanic
  getAssignMechanic: (id) => axiosInstance.get(`/auctionmanager/assign-mechanic/${id}`),
  assignMechanic: (id, data) => axiosInstance.post(`/auctionmanager/assign-mechanic/${id}`, data),

  // Auction Actions
  startAuction: (id) => axiosInstance.post(`/auctionmanager/start-auction/${id}`),
  stopAuction: (id) => axiosInstance.post(`/auctionmanager/stop-auction/${id}`),
  reAuction: (id) => axiosInstance.post(`/auctionmanager/re-auction/${id}`),
  pokeBuyer: (id) => axiosInstance.post(`/auctionmanager/poke-buyer/${id}`),

  // View Bids
  viewBids: (id) => axiosInstance.get(`/auctionmanager/view-bids/${id}`),

  // Backwards-compatible aliases
  getBids: (id) => axiosInstance.get(`/auctionmanager/view-bids/${id}`),
  endAuction: (id) => axiosInstance.post(`/auctionmanager/stop-auction/${id}`),

  // Profile
  getProfile: () => axiosInstance.get('/auctionmanager/profile'),
  updatePhone: (phone) => axiosInstance.post('/auctionmanager/update-phone', { phone }),
  changePassword: (data) => axiosInstance.post('/auctionmanager/change-password', data),

  // Migration (run once to fix existing data)
  migrateAssignments: () => axiosInstance.post('/auctionmanager/migrate-assignments')
};  