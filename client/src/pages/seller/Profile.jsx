// client/src/pages/seller/Profile.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance.util';
import { updateMyProfile } from '../../redux/slices/profileSlice';
import useProfile from '../../hooks/useProfile';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const dispatch = useDispatch();
  const { profile: reduxProfile, loading: profileLoading, refresh } = useProfile();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    doorNo: '',
    street: '',
    city: '',
    state: '',
    notificationPreference: 'all',
  });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [auctionsCount, setAuctionsCount] = useState(0);
  const [rentalsCount, setRentalsCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordMatch, setPasswordMatch] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');

  useEffect(() => {
    if (reduxProfile) {
      setUser(reduxProfile);
    }
  }, [reduxProfile]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch all data in parallel for faster loading
        const [earningsRes, auctionsRes, rentalsRes] = await Promise.all([
          axiosInstance.get('/seller/view-earnings'),
          axiosInstance.get('/seller/view-auctions'),
          axiosInstance.get('/seller/view-rentals')
        ]);

        if (earningsRes.data.success) {
          const { totalRentalEarnings, totalAuctionEarnings, recentEarnings } = earningsRes.data.data;
          setTotalEarnings(totalRentalEarnings + totalAuctionEarnings);
          setRecentTransactions(recentEarnings);
        }

        if (auctionsRes.data.success) setAuctionsCount(auctionsRes.data.data.length);
        if (rentalsRes.data.success) setRentalsCount(rentalsRes.data.data.length);
      } catch (err) {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name === 'firstName') {
      const hasNumbers = /\d/.test(value);
      if (value && hasNumbers) {
        setFirstNameError('First name cannot contain numbers');
      } else {
        setFirstNameError('');
      }
    }
    if (name === 'lastName') {
      const hasNumbers = /\d/.test(value);
      if (value && hasNumbers) {
        setLastNameError('Last name cannot contain numbers');
      } else {
        setLastNameError('');
      }
    }
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewPasswordChange = (value) => {
    setNewPassword(value);
    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!value) {
      setPasswordStrength('');
    } else if (!strongRegex.test(value)) {
      setPasswordStrength('❌ Weak: needs uppercase, number, special char');
    } else {
      setPasswordStrength('✅ Strong password');
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    if (!value) {
      setPasswordMatch('');
    } else if (newPassword !== value) {
      setPasswordMatch('❌ Passwords do not match');
    } else {
      setPasswordMatch('✅ Passwords match');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const hasNumbers = /\d/.test(user.firstName);
    if (user.firstName && hasNumbers) {
      toast.error('First name cannot contain numbers');
      return;
    }
    if (firstNameError || lastNameError) {
      toast.error('Names cannot contain numbers');
      return;
    }
    if (!user.firstName || user.firstName.trim() === '') {
      toast.error('First name is required');
      return;
    }
    const phoneRegex = /^\d{10}$/;
    if (user.phone && !phoneRegex.test(user.phone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }
    // Remove this check - allow saving without changing phone
    // Only prevent if trying to save a phone number identical to current one
    try {
      const result = await dispatch(updateMyProfile(user)).unwrap();
      toast.success('Profile updated successfully!');
      setUser(result);
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    }
  };



  if (loading || profileLoading) return <LoadingSpinner />;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (oldPassword === newPassword) {
      toast.error('New password cannot be the same as current password');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!strongRegex.test(newPassword)) {
      toast.error('Password must include uppercase letter, number, and special character');
      return;
    }

    try {
      const res = await axiosInstance.post('/seller/change-password', {
        oldPassword,
        newPassword,
      });
      if (res.data.success) {
        toast.success('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordStrength('');
        setPasswordMatch('');
        refresh();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to change password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-orange-600 mb-10">Seller Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-2xl font-semibold text-orange-600 mb-4">Personal Information</h2>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={user.firstName}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    />
                    {firstNameError && <div style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem' }}>❌ {firstNameError}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={user.lastName}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    />
                    {lastNameError && <div style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem' }}>❌ {lastNameError}</div>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-100 border rounded-lg cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={user.phone}
                    onChange={handleProfileChange}
                    pattern="[0-9]{10}"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <h3 className="text-lg font-semibold text-orange-600 mt-6 mb-3">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Door/Flat No</label>
                    <input
                      type="text"
                      name="doorNo"
                      value={user.doorNo}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street/Area</label>
                    <input
                      type="text"
                      name="street"
                      value={user.street}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={user.city}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-100 border rounded-lg cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={user.state}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700"
                >
                  Save Changes
                </button>
              </form>
            </div>

            {/* Earnings Summary */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-2xl font-semibold text-orange-600 mb-4">Earnings Summary</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-lg">
                  <strong>Total Earnings:</strong> ₹{totalEarnings.toLocaleString('en-IN')}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  <strong>Recent Transactions (Completed):</strong>
                </p>
                {recentTransactions.length > 0 ? (
                  <ul className="mt-2 text-sm">
                    {recentTransactions.map((t, i) => (
                      <li key={i}>
                        ₹{t.amount.toLocaleString('en-IN')} - {t.description} (
                        {new Date(t.createdAt).toLocaleDateString()})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">No recent completed transactions</p>
                )}
                <Link
                  to="/seller/view-earnings"
                  className="inline-block mt-4 bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700"
                >
                  View All Earnings
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT: Preferences + Password */}
          <div className="space-y-6">
            {/* Listings Overview */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-2xl font-semibold text-orange-600 mb-4">Listings Overview</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-orange-600">Active Auctions</h3>
                  <p className="text-2xl font-bold mb-2">Total: {auctionsCount}</p>
                  <Link
                    to="/seller/view-auctions"
                    className="inline-block bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700 w-full text-center"
                  >
                    View Auctions
                  </Link>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-orange-600">Active Rentals</h3>
                  <p className="text-2xl font-bold mb-2">Total: {rentalsCount}</p>
                  <Link
                    to="/seller/view-rentals"
                    className="inline-block bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700 w-full text-center"
                  >
                    View Rentals
                  </Link>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-2xl font-semibold text-orange-600 mb-4">Change Password</h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <input
                  type="password"
                  placeholder="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <div>
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => handleNewPasswordChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  {passwordStrength && (
                    <div style={{ color: passwordStrength.includes('✅') ? 'green' : 'red', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      {passwordStrength}
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  {passwordMatch && (
                    <div style={{ color: passwordMatch.includes('✅') ? 'green' : 'red', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      {passwordMatch}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700"
                >
                  Change Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;