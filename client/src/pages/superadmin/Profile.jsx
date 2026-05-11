// client/src/pages/superadmin/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.util";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/superadmin/profile');
        if (res.data.success) {
          setProfile(res.data.data);
        } else {
          setError(res.data.message);
        }
      } catch (err) {
        setError("Failed to load profile");
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setUpdating(true);
    try {
      const res = await axiosInstance.post('/superadmin/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (res.data.success) {
        toast.success("Password updated successfully!");
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-700 mt-8">{error}</div>;

  return (
    <div className="min-h-screen py-8 relative" style={{ zIndex: 1 }}>
      <section className="max-w-4xl mx-auto px-6">
        <div className="premium-page-header animate-fade-in-up">
          <h1 className="premium-page-title">Super Admin Profile</h1>
          <p className="premium-page-subtitle">Business owner account settings</p>
        </div>

        {/* Profile Information */}
        <div className="premium-chart-container animate-fade-in-up mb-8">
          <div className="flex items-center gap-6 mb-6 pb-6 border-b-2 border-gray-100">
            <div className="w-24 h-24 bg-orange-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {profile.firstName[0]}{profile.lastName[0]}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{profile.firstName} {profile.lastName}</h2>
              <p className="text-orange-600 font-semibold text-lg">Super Administrator</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-600 text-sm font-semibold mb-1">Email</label>
              <p className="text-lg text-gray-800 font-medium">{profile.email}</p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-semibold mb-1">Phone</label>
              <p className="text-lg text-gray-800 font-medium">{profile.phone}</p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-semibold mb-1">User Type</label>
              <span className="inline-block px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-bold uppercase">
                {profile.userType}
              </span>
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-semibold mb-1">Member Since</label>
              <p className="text-lg text-gray-800 font-medium">
                {new Date(profile.createdAt).toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="premium-chart-container animate-fade-in-up">
          <div className="premium-chart-header mb-4">
            <h2 className="premium-chart-title">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordUpdate} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter current password"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter new password (min 8 characters)"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Re-enter new password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-all duration-300 disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Profile;
