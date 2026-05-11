import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminServices from '../../services/admin.services';
import LoadingSpinner from '../components/LoadingSpinner';
import UserStatisticsDetail from './UserStatisticsDetail';

const ManageUsers = () => {
  const [data, setData] = useState({
    pendingMechanics: [],
    approvedMechanics: [],
    buyers: [],
    sellers: [],
    reportedUsers: [],
    blockedUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStatistics, setUserStatistics] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [searchTerms, setSearchTerms] = useState({
    pendingMechanic: '',
    approvedMechanic: '',
    buyer: '',
    seller: '',
    reportedUser: '',
    blockedUser: ''
  });
  const [showAll, setShowAll] = useState({
    pendingMechanics: false,
    approvedMechanics: false,
    buyers: false,
    sellers: false,
    reportedUsers: false,
    blockedUsers: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminServices.getManageUsers();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError('Failed to load users');
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [navigate]);

  const handleSearch = (type, value) => {
    setSearchTerms(prev => ({ ...prev, [type]: value.toLowerCase() }));
  };

  const toggleShowMore = (type) => {
    setShowAll(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleAction = async (action, id, _type) => {
    try {
      let res;
      if (action === 'approve') {
        res = await adminServices.approveMechanic(id);
      } else if (action === 'decline') {
        res = await adminServices.declineUser(id);
      } else if (action === 'deleteBuyer') {
        res = await adminServices.deleteBuyer(id);
      } else if (action === 'deleteSeller') {
        res = await adminServices.deleteSeller(id);
      } else if (action === 'block') {
        res = await adminServices.blockUser(id);
      }

      if (res.success) {
        // Refresh data
        const refreshed = await adminServices.getManageUsers();
        if (refreshed.success) setData(refreshed.data);
        
        // Update selected user in modal if blocking/unblocking
        if (action === 'block' && selectedUser && selectedUser._id === id) {
          setSelectedUser(prev => ({ ...prev, isBlocked: res.data.isBlocked }));
        }
      }
    } catch (err) {
      console.error('Error performing action:', err);
    }
  };

  const openModal = async (user) => {
    setSelectedUser(user);
    setLoadingStats(true);
    setUserStatistics(null);
    
    try {
      const res = await adminServices.getUserDetails(user._id);
      if (res.success) {
        setUserStatistics(res.statistics);
      }
    } catch (err) {
      console.error('Error fetching user statistics:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setUserStatistics(null);
    setLoadingStats(false);
    setExpandedSections({});
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filterUsers = (users, searchTerm) => {
    return users.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email.toLowerCase();
      return fullName.includes(searchTerm) || email.includes(searchTerm);
    });
  };

  const renderUserList = (users, type, isMechanic = false, isPending = false) => {
    const searchTerm = searchTerms[type];
    const filtered = filterUsers(users, searchTerm);
    const display = showAll[type] ? filtered : filtered.slice(0, 5);

    return (
      <>
        <div className="search-bar mb-4">
          <input
            type="text"
            placeholder={`Search ${type}s...`}
            className="w-full p-2.5 border border-gray-300 rounded font-medium text-base"
            onChange={(e) => handleSearch(type, e.target.value)}
          />
        </div>
        <ul className={`${type}-list list-none p-0`}>
          {display.length > 0 ? (
            display.map(user => (
              <li key={user._id} className={`${type}-item p-4 border-b border-gray-200 flex justify-between items-center transition-all duration-500 ease-in-out`} data-firstname={user.firstName.toLowerCase()} data-lastname={user.lastName.toLowerCase()} data-email={user.email.toLowerCase()}>
                <div className={`${type}-info flex-grow`}>
                  {user.firstName} {user.lastName} ({user.email})
                </div>
                <div className="action-buttons flex gap-2.5">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold transition"
                    onClick={() => openModal(user)}
                  >
                    View Details
                  </button>
                  {isMechanic && isPending && (
                    <button
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold transition"
                      onClick={() => handleAction('approve', user._id, type)}
                    >
                      Approve
                    </button>
                  )}
                  <button
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold transition"
                    onClick={() => handleAction(isPending ? 'decline' : type === 'buyer' ? 'deleteBuyer' : 'deleteSeller', user._id, type)}
                  >
                    {isPending ? 'Decline' : 'Delete'}
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className={`no-${type}s p-8 text-center text-gray-600 italic`}>No {type}s found</li>
          )}
        </ul>
        {filtered.length > 5 && (
            <div className="show-more flex justify-center mt-4">
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded flex items-center gap-1 transition" onClick={() => toggleShowMore(type)}>
              {showAll[type] ? 'Show Less' : 'Show More'} <span className="arrow">{showAll[type] ? '▲' : '▼'}</span>
            </button>
          </div>
        )}
      </>
    );
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message text-center text-red-700 mt-8">{error}</div>;

  return (
    <>
      <div className="container p-8 max-w-6xl mx-auto">
        <div className="admin-page-header">
          <h1 className="admin-page-title">
            <i className="fas fa-users"></i>
            Manage Users
          </h1>
          <p className="admin-page-subtitle">View, approve, and manage all platform users</p>
        </div>

        {/* Reported Users Section - Shows at the top */}
        {data.reportedUsers.length > 0 && (
          <div className="admin-section border-l-4 border-l-red-500">
            <h2 className="admin-section-title text-red-600 mb-6 flex items-center gap-2"><i className="fas fa-exclamation-triangle"></i>Reported Users (Payment Failures)</h2>
            <div className="search-bar mb-4">
              <input
                type="text"
                placeholder="Search reported users..."
                className="w-full p-2.5 border border-gray-300 rounded font-medium text-base"
                onChange={(e) => handleSearch('reportedUser', e.target.value)}
              />
            </div>
            <ul className="list-none p-0">
              {filterUsers(data.reportedUsers, searchTerms.reportedUser)
                .slice(0, showAll.reportedUsers ? undefined : 5)
                .map(user => (
                  <li key={user._id} className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex-grow">
                      <div className="font-bold text-gray-800">{user.firstName} {user.lastName} ({user.email})</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Reported: {new Date(user.reportedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="action-buttons flex gap-2.5">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold transition"
                        onClick={() => openModal(user)}
                      >
                        View Details
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
            {filterUsers(data.reportedUsers, searchTerms.reportedUser).length > 5 && (
              <div className="show-more flex justify-center mt-4">
                <button 
                  className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded flex items-center gap-1 transition" 
                  onClick={() => toggleShowMore('reportedUsers')}
                >
                  {showAll.reportedUsers ? 'Show Less' : 'Show More'} <span className="arrow">{showAll.reportedUsers ? '▲' : '▼'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Blocked Users Section */}
        {data.blockedUsers.length > 0 && (
          <div className="admin-section border-l-4 border-l-red-600">
            <h2 className="admin-section-title text-red-600 mb-6 flex items-center gap-2"><i className="fas fa-ban"></i>Blocked Users</h2>
            <div className="search-bar mb-4">
              <input
                type="text"
                placeholder="Search blocked users..."
                className="w-full p-2.5 border border-gray-300 rounded font-medium text-base"
                onChange={(e) => handleSearch('blockedUser', e.target.value)}
              />
            </div>
            <ul className="list-none p-0">
              {filterUsers(data.blockedUsers, searchTerms.blockedUser)
                .slice(0, showAll.blockedUsers ? undefined : 5)
                .map(user => (
                  <li key={user._id} className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex-grow">
                      <div className="font-bold text-gray-800">{user.firstName} {user.lastName} ({user.email})</div>
                      <div className="text-xs text-red-600 mt-1">
                        Blocked: {new Date(user.blockedAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">User Type: {user.userType}</div>
                    </div>
                    <div className="action-buttons flex gap-2.5">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold transition"
                        onClick={() => openModal(user)}
                      >
                        View Details
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
            {filterUsers(data.blockedUsers, searchTerms.blockedUser).length > 5 && (
              <div className="show-more flex justify-center mt-4">
                <button 
                  className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded flex items-center gap-1 transition" 
                  onClick={() => toggleShowMore('blockedUsers')}
                >
                  {showAll.blockedUsers ? 'Show Less' : 'Show More'} <span className="arrow">{showAll.blockedUsers ? '▲' : '▼'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="admin-section">
          <h2 className="admin-section-title mb-6"><i className="fas fa-tools mr-2"></i>Pending Mechanics</h2>
          {renderUserList(data.pendingMechanics, 'pendingMechanic', true, true)}
        </div>

        <div className="admin-section">
          <h2 className="admin-section-title mb-6"><i className="fas fa-check-circle mr-2"></i>Approved Mechanics</h2>
          {renderUserList(data.approvedMechanics, 'approvedMechanic', true, false)}
        </div>

        <div className="admin-section">
          <h2 className="admin-section-title mb-6"><i className="fas fa-shopping-cart mr-2"></i>Buyers</h2>
          {renderUserList(data.buyers, 'buyer')}
        </div>

        <div className="admin-section">
          <h2 className="admin-section-title mb-6"><i className="fas fa-store mr-2"></i>Sellers</h2>
          {renderUserList(data.sellers, 'seller')}
        </div>
      </div>

      {selectedUser && (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4">
          <div className="modal-content relative bg-white m-auto p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl">
            <span className="close absolute top-4 right-6 text-2xl cursor-pointer text-gray-500 hover:text-gray-700" onClick={closeModal}>&times;</span>
            <h2 className="text-xl font-bold text-gray-800 mb-6">User Details</h2>
            <div className="details-grid grid grid-cols-2 gap-4 text-gray-700">
              <p><strong>First Name:</strong> {selectedUser.firstName}</p>
              <p><strong>Last Name:</strong> {selectedUser.lastName}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>User Type:</strong> {selectedUser.userType}</p>
              {selectedUser.isReported && (
                <>
                  <p className="col-span-2 bg-red-50 p-3 rounded border border-red-200">
                    <strong className="text-red-600">Report Reason:</strong> 
                    <span className="block mt-1 text-gray-700">{selectedUser.reportReason}</span>
                  </p>
                  <p><strong>Reported Date:</strong> {new Date(selectedUser.reportedAt).toLocaleDateString()}</p>
                </>
              )}
              {selectedUser.userType === 'mechanic' && (
                <>
                  <p><strong>Approved Status:</strong> {selectedUser.approved_status}</p>
                  <p><strong>Shop Name:</strong> {selectedUser.shopName}</p>
                  <p><strong>Experience Years:</strong> {selectedUser.experienceYears}</p>
                  <p><strong>Repair Bikes:</strong> {selectedUser.repairBikes ? 'Yes' : 'No'}</p>
                  <p><strong>Repair Cars:</strong> {selectedUser.repairCars ? 'Yes' : 'No'}</p>
                </>
              )}
              <p><strong>Phone:</strong> {selectedUser.phone}</p>
              <p><strong>Address:</strong> {selectedUser.doorNo}, {selectedUser.street}, {selectedUser.city}, {selectedUser.state}</p>
              {selectedUser.googleAddressLink && <p><strong>Google Address:</strong> <a href={selectedUser.googleAddressLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View on Google Maps</a></p>}
            </div>
            
            {/* Statistics Section */}
            {loadingStats && (
              <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
                <p className="text-center text-gray-600">Loading statistics...</p>
              </div>
            )}
            
            {!loadingStats && userStatistics && (
              <UserStatisticsDetail
                userType={selectedUser.userType}
                statistics={userStatistics}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
              />
            )}
            
            {/* Block/Unblock Button */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => handleAction('block', selectedUser._id)}
                className={`px-6 py-2.5 rounded font-semibold text-white transition ${
                  selectedUser.isBlocked 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-500 hover:bg-gray-600 px-6 py-2.5 rounded font-semibold text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default ManageUsers;