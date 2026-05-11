import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminServices from '../../services/admin.services';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AuctionManagers = () => {
  const [data, setData] = useState({
    disapprovedManagers: [],
    approvedManagers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedManager, setSelectedManager] = useState(null);
  const [managerStatistics, setManagerStatistics] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [activeTab, setActiveTab] = useState('disapproved');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAuctionManagers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAuctionManagers = async () => {
    try {
      const res = await adminServices.getAuctionManagers();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message);
        toast.error(res.message);
      }
    } catch (err) {
      setError('Failed to load auction managers');
      toast.error('Failed to load auction managers');
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await adminServices.approveAuctionManager(id);
      if (res.success) {
        toast.success('Auction Manager approved successfully');
        await fetchAuctionManagers();
        setSelectedManager(null);
      }
    } catch (err) {
      console.error('Error approving:', err);
      toast.error('Failed to approve auction manager');
    }
  };

  const handleDelete = async (manager) => {
    const carCount = manager.auctionCars?.length || 0;

    if (carCount > 0) {
      toast.error(
        `Cannot delete this manager — ${carCount} car${carCount === 1 ? '' : 's'} ${carCount === 1 ? 'is' : 'are'} still assigned.`
      );
      return;
    }

    if (
      !window.confirm(
        'Are you sure you want to delete this Auction Manager? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const res = await adminServices.deleteAuctionManager(manager._id);
      if (res.success) {
        toast.success('Auction Manager deleted successfully');
        await fetchAuctionManagers();
        setSelectedManager(null);
      }
    } catch (err) {
      console.error('Error deleting:', err);
      toast.error('Failed to delete auction manager');
    }
  };

  const openModal = async (manager) => {
    setSelectedManager(manager);
    setLoadingStats(true);
    setManagerStatistics(null);
    
    try {
      const res = await adminServices.getUserDetails(manager._id);
      if (res.success) {
        setManagerStatistics(res.statistics);
      }
    } catch (err) {
      console.error('Error fetching manager statistics:', err);
      toast.error('Failed to load statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  const closeModal = () => {
    setSelectedManager(null);
    setManagerStatistics(null);
    setLoadingStats(false);
    setExpandedSections({});
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filterManagers = (managers) => {
    if (!searchTerm) return managers;
    const term = searchTerm.toLowerCase();
    return managers.filter((manager) => {
      const fullName = `${manager.firstName} ${manager.lastName}`.toLowerCase();
      const email = manager.email.toLowerCase();
      const city = manager.city?.toLowerCase() || '';
      return fullName.includes(term) || email.includes(term) || city.includes(term);
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) return <LoadingSpinner />;

  const activeManagers = activeTab === 'disapproved' ? data.disapprovedManagers : data.approvedManagers;
  const filteredManagers = filterManagers(activeManagers);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="admin-page-header">
          <h1 className="admin-page-title">
            <i className="fas fa-gavel"></i>
            Auction Managers
          </h1>
          <p className="admin-page-subtitle">Review and manage auction manager registrations</p>
        </div>

        {/* Header & Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-8">
              <div className="text-right">
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-2xl font-bold text-gray-900">
                  {data.disapprovedManagers.length + data.approvedManagers.length}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
            <div className="bg-white border border-amber-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600">Pending Approval</div>
                  <div className="text-3xl font-bold text-amber-700 mt-1">
                    {data.disapprovedManagers.length}
                  </div>
                </div>
                <div className="text-amber-500 text-3xl">
                  <i className="fas fa-hourglass-half"></i>
                </div>
              </div>
            </div>
            <div className="bg-white border border-green-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600">Approved</div>
                  <div className="text-3xl font-bold text-green-700 mt-1">
                    {data.approvedManagers.length}
                  </div>
                </div>
                <div className="text-green-500 text-3xl">
                  <i className="fas fa-check-circle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('disapproved')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === 'disapproved'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending ({data.disapprovedManagers.length})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === 'approved'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Approved ({data.approvedManagers.length})
              </button>
            </div>
            <div className="relative flex-1 max-w-md">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search by name, email or city..."
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 flex items-center gap-3">
            <i className="fas fa-exclamation-circle text-xl"></i>
            {error}
          </div>
        )}

        {/* Table / Empty State */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredManagers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Manager
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredManagers.map((manager) => (
                    <tr key={manager._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {manager.firstName} {manager.lastName}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          ID: {manager._id.slice(-8)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{manager.email}</div>
                        <div className="text-sm text-gray-600 mt-0.5">{manager.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {manager.city || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(manager.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            manager.approved
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {manager.approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => openModal(manager)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-md text-sm transition"
                          >
                            View
                          </button>

                          {!manager.approved && (
                            <button
                              onClick={() => handleApprove(manager._id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3.5 py-1.5 rounded-md text-sm transition"
                            >
                              Approve
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(manager)}
                            disabled={manager.auctionCars?.length > 0}
                            className={`px-3.5 py-1.5 rounded-md text-sm transition ${
                              manager.auctionCars?.length > 0
                                ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <i className="fas fa-users-slash text-5xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No auction managers found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? 'Try adjusting your search'
                  : `No ${activeTab} managers at this time`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedManager && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-5 z-10 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 w-10 h-10 rounded-full flex items-center justify-center text-2xl font-bold transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Close modal"
              title="Close"
            >
              ×
            </button>

            {/* Header */}
            <div className="p-6 border-b pr-16">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedManager.firstName} {selectedManager.lastName}
              </h2>
              <div className="mt-2">
                <span
                  className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    selectedManager.approved
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedManager.approved ? 'Approved' : 'Pending Approval'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase">Email</div>
                  <div className="mt-1 text-gray-900">{selectedManager.email}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase">Phone</div>
                  <div className="mt-1 text-gray-900">{selectedManager.phone}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase">City</div>
                  <div className="mt-1 text-gray-900">{selectedManager.city || '—'}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase">Date of Birth</div>
                  <div className="mt-1 text-gray-900">
                    {formatDate(selectedManager.dateOfBirth)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase">Registered On</div>
                  <div className="mt-1 text-gray-900">
                    {formatDate(selectedManager.createdAt)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase">Auction Cars</div>
                  <div className="mt-1 text-gray-900">
                    {selectedManager.auctionCars?.length || 0} cars assigned
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Section */}
            {loadingStats && (
              <div className="p-6 bg-gray-50 border-t">
                <p className="text-center text-gray-600">Loading statistics...</p>
              </div>
            )}
            
            {!loadingStats && managerStatistics && (
              <div className="p-6 border-t bg-gradient-to-br from-gray-50 to-white">
                <h3 className="text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                  <i className="fas fa-chart-line"></i>
                  Performance Statistics
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cars Accepted Card */}
                  <div className="bg-white border-2 border-blue-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-blue-900 text-lg">Cars Accepted</h4>
                        <div className="bg-blue-100 rounded-full p-3">
                          <i className="fas fa-check-double text-blue-600 text-xl"></i>
                        </div>
                      </div>
                      <p className="text-4xl font-bold text-blue-700 mb-2">{managerStatistics.carsAccepted}</p>
                      <p className="text-sm text-gray-600 mb-3">Total requests approved</p>
                      
                      {/* Show preview of accepted cars */}
                      {managerStatistics.acceptedCarsList?.length > 0 && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-md">
                          <p className="text-xs text-gray-700 font-medium mb-2">
                            <i className="fas fa-info-circle text-blue-600"></i> Recent Accepted Cars:
                          </p>
                          <div className="space-y-1">
                            {managerStatistics.acceptedCarsList.slice(0, 2).map((car, idx) => (
                              <div key={idx} className="text-xs text-gray-700">
                                • <span className="font-semibold">{car.vehicleName}</span>
                                {car.sellerId && (
                                  <span className="text-gray-600 ml-1">
                                    (Seller: {car.sellerId.firstName} {car.sellerId.lastName})
                                  </span>
                                )}
                              </div>
                            ))}
                            {managerStatistics.acceptedCarsList.length > 2 && (
                              <p className="text-xs text-blue-600 font-medium">
                                +{managerStatistics.acceptedCarsList.length - 2} more
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {managerStatistics.acceptedCarsList?.length > 0 && (
                        <button
                          onClick={() => toggleSection('accepted')}
                          className="w-full mt-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm font-medium transition flex items-center justify-center gap-2"
                        >
                          {expandedSections.accepted ? (
                            <>
                              <i className="fas fa-chevron-up"></i>
                              Hide Full Details
                            </>
                          ) : (
                            <>
                              <i className="fas fa-chevron-down"></i>
                              View All Details
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    
                    {expandedSections.accepted && managerStatistics.acceptedCarsList?.length > 0 && (
                      <div className="border-t border-blue-200 bg-blue-50/50 max-h-64 overflow-y-auto">
                        <div className="p-3 bg-blue-100 border-b border-blue-200">
                          <p className="text-xs font-semibold text-blue-900 uppercase">All Accepted Cars</p>
                        </div>
                        {managerStatistics.acceptedCarsList.map((car, idx) => (
                          <div key={idx} className="px-5 py-3 border-b border-blue-100 last:border-b-0 hover:bg-blue-100/50 transition">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{car.vehicleName}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {car.year} • ₹{car.startingBid?.toLocaleString()} • {car.mileage?.toLocaleString()} km
                                </p>
                                {car.sellerId && (
                                  <p className="text-xs text-gray-700 mt-1 font-medium">
                                    <i className="fas fa-user text-blue-600"></i> Seller: {car.sellerId.firstName} {car.sellerId.lastName}
                                  </p>
                                )}
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                                car.started_auction === 'yes' ? 'bg-green-100 text-green-800 animate-pulse' :
                                car.started_auction === 'ended' ? 'bg-gray-100 text-gray-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {car.started_auction === 'yes' ? 'LIVE' :
                                 car.started_auction === 'ended' ? 'Ended' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Cars Auctioned Card */}
                  <div className="bg-white border-2 border-green-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-green-900 text-lg">Cars Auctioned</h4>
                        <div className="bg-green-100 rounded-full p-3">
                          <i className="fas fa-gavel text-green-600 text-xl"></i>
                        </div>
                      </div>
                      <p className="text-4xl font-bold text-green-700 mb-2">{managerStatistics.carsAuctioned}</p>
                      <p className="text-sm text-gray-600 mb-3">Started or completed auctions</p>
                      
                      {/* Show preview of auctioned cars */}
                      {managerStatistics.auctionedCarsList?.length > 0 && (
                        <div className="mb-3 p-3 bg-green-50 rounded-md">
                          <p className="text-xs text-gray-700 font-medium mb-2">
                            <i className="fas fa-info-circle text-green-600"></i> Recent Auctioned Cars:
                          </p>
                          <div className="space-y-1">
                            {managerStatistics.auctionedCarsList.slice(0, 2).map((car, idx) => (
                              <div key={idx} className="text-xs text-gray-700">
                                • <span className="font-semibold">{car.vehicleName}</span>
                                {car.winnerId && (
                                  <span className="text-green-700 ml-1 font-medium">
                                    (Winner: {car.winnerId.firstName} {car.winnerId.lastName})
                                  </span>
                                )}
                                {!car.winnerId && car.sellerId && (
                                  <span className="text-gray-600 ml-1">
                                    (Seller: {car.sellerId.firstName} {car.sellerId.lastName})
                                  </span>
                                )}
                              </div>
                            ))}
                            {managerStatistics.auctionedCarsList.length > 2 && (
                              <p className="text-xs text-green-600 font-medium">
                                +{managerStatistics.auctionedCarsList.length - 2} more
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {managerStatistics.auctionedCarsList?.length > 0 && (
                        <button
                          onClick={() => toggleSection('auctioned')}
                          className="w-full mt-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-md text-sm font-medium transition flex items-center justify-center gap-2"
                        >
                          {expandedSections.auctioned ? (
                            <>
                              <i className="fas fa-chevron-up"></i>
                              Hide Full Details
                            </>
                          ) : (
                            <>
                              <i className="fas fa-chevron-down"></i>
                              View All Details
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    
                    {expandedSections.auctioned && managerStatistics.auctionedCarsList?.length > 0 && (
                      <div className="border-t border-green-200 bg-green-50/50 max-h-64 overflow-y-auto">
                        <div className="p-3 bg-green-100 border-b border-green-200">
                          <p className="text-xs font-semibold text-green-900 uppercase">All Auctioned Cars</p>
                        </div>
                        {managerStatistics.auctionedCarsList.map((car, idx) => (
                          <div key={idx} className="px-5 py-3 border-b border-green-100 last:border-b-0 hover:bg-green-100/50 transition">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{car.vehicleName}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {car.year} • Starting: ₹{car.startingBid?.toLocaleString()}
                                </p>
                                {car.winnerId && (
                                  <p className="text-xs text-green-700 mt-1 font-medium">
                                    <i className="fas fa-trophy text-yellow-600 text-xs"></i> Winner: {car.winnerId.firstName} {car.winnerId.lastName}
                                  </p>
                                )}
                                {car.sellerId && (
                                  <p className="text-xs text-gray-700 mt-1">
                                    <i className="fas fa-user text-gray-500"></i> Seller: {car.sellerId.firstName} {car.sellerId.lastName}
                                  </p>
                                )}
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                                car.started_auction === 'ended' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800 animate-pulse'
                              }`}>
                                {car.started_auction === 'ended' ? 'Completed' : 'LIVE'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-info-circle text-indigo-600 text-xl"></i>
                    <p className="text-sm text-gray-700">
                      <strong className="text-indigo-900">Success Rate:</strong> 
                      {managerStatistics.carsAccepted > 0 
                        ? ` ${((managerStatistics.carsAuctioned / managerStatistics.carsAccepted) * 100).toFixed(1)}% of accepted cars have been auctioned`
                        : ' No data available yet'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="p-6 border-t flex flex-col sm:flex-row gap-3">
              {!selectedManager.approved && (
                <button
                  onClick={() => handleApprove(selectedManager._id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  <i className="fas fa-check-circle"></i>
                  Approve Manager
                </button>
              )}

              <button
                onClick={() => handleDelete(selectedManager)}
                disabled={selectedManager.auctionCars?.length > 0}
                className={`flex-1 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                  selectedManager.auctionCars?.length > 0
                    ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                <i className="fas fa-trash-alt"></i>
                Delete Manager
              </button>

              <button
                onClick={closeModal}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <i className="fas fa-times"></i>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionManagers;