// client/src/pages/auctionManager/ManagerProfile.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { auctionManagerServices } from '../../services/auctionManager.services';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ManagerProfile() {
  const [user, setUser] = useState({});
  const [phone, setPhone] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordMatch, setPasswordMatch] = useState('');

  // Fetch profile directly from auction manager endpoint
  useEffect(() => {
    const fetchProfile = async () => {
      console.log('🔍 [Frontend] Fetching auction manager profile...');
      try {
        setLoading(true);
        const response = await auctionManagerServices.getProfile();
        console.log('📦 [Frontend] Profile API response:', response);
        
        const profileData = response?.data?.data?.user || response?.data?.user || response?.data || {};
        console.log('✅ [Frontend] Extracted profile data:', profileData);
        
        // Set userType as 'auction_manager' by default
        const userWithType = {
          ...profileData,
          userType: 'auction_manager'
        };
        
        setUser(userWithType);
        setPhone(userWithType.phone || '');
        console.log('✅ [Frontend] Profile loaded successfully:', {
          name: `${userWithType.firstName} ${userWithType.lastName}`,
          email: userWithType.email,
          phone: userWithType.phone,
          userType: userWithType.userType
        });
      } catch (error) {
        console.error('❌ [Frontend] Failed to fetch profile:', error);
        toast.error('Failed to load profile. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

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

  const _handleOldPasswordChange = (value) => {
    setOldPassword(value);
  };



  const handlePhoneUpdate = async (e) => {
    e.preventDefault();
    console.log('📱 [Frontend] Updating phone number to:', phone);
    
    if (!/^\d{10}$/.test(phone)) {
      console.log('❌ [Frontend] Invalid phone format:', phone);
      toast.error('Phone number must be 10 digits');
      return;
    }
    if (phone === user.phone) {
      console.log('❌ [Frontend] New phone same as current phone');
      toast.error('New phone number cannot be the same as current phone number');
      return;
    }
    try {
      setUpdating(true);
      const res = await auctionManagerServices.updatePhone(phone);
      console.log('📦 [Frontend] Update phone response:', res);
      
      const responseData = res.data || res;
      if (responseData.success) {
        console.log('✅ [Frontend] Phone updated successfully');
        toast.success('Phone updated successfully');
        setUser(prev => ({ ...prev, phone }));
      } else {
        console.log('❌ [Frontend] Phone update failed:', responseData.message);
        toast.error(responseData.message || 'Failed to update phone');
      }
    } catch (err) {
      console.error('❌ [Frontend] Phone update error:', err);
      toast.error('Failed to update phone');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    console.log('🔐 [Frontend] Attempting to change password');
    
    if (!oldPassword) {
      console.log('❌ [Frontend] Current password not provided');
      toast.error('Please enter your current password');
      return;
    }
    if (oldPassword === newPassword) {
      console.log('❌ [Frontend] New password same as current');
      toast.error('New password cannot be the same as current password');
      return;
    }
    if (newPassword !== confirmPassword) {
      console.log('❌ [Frontend] Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      console.log('❌ [Frontend] Password too short');
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      setUpdating(true);
      const res = await auctionManagerServices.changePassword({ oldPassword, newPassword });
      console.log('📦 [Frontend] Change password response:', res);
      
      const responseData = res.data || res;
      if (responseData.success) {
        console.log('✅ [Frontend] Password changed successfully');
        toast.success('Password changed successfully');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordStrength('');
        setPasswordMatch('');
      } else {
        console.log('❌ [Frontend] Password change failed:', responseData.message);
        toast.error(responseData.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('❌ [Frontend] Password change error:', err);
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 pt-12 pb-24 px-4 font-montserrat">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-10 pl-4 border-l-4 border-amber-500">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Manager Profile</h1>
          <p className="text-gray-600 font-medium">Manage your personal details and security settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Details Section */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col">
            <div className="mb-8 pb-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900">Personal Details</h3>
            </div>
            
            <form onSubmit={handlePhoneUpdate} className="space-y-6 flex-grow flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <span className="text-lg font-bold text-gray-900">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-gray-900 font-medium">{user.email}</span>
                    <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-md">Cannot be changed</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Role</label>
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 font-bold shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    AUCTION MANAGER
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border-2 border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                    pattern="[0-9]{10}"
                    maxLength="10"
                    placeholder="Enter 10-digit phone number"
                    required
                  />
                </div>
              </div>
              
              <div className="pt-6 mt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full bg-gray-900 hover:bg-amber-500 text-white font-bold py-4 px-8 rounded-xl transition duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updating ? (
                    'Updating...'
                  ) : (
                    <>
                      <span>Update Phone</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col">
            <div className="mb-8 pb-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900">Change Password</h3>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-6 flex-grow flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-white border-2 border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                    placeholder="Enter your current password"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => handleNewPasswordChange(e.target.value)}
                    className="w-full bg-white border-2 border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                    minLength="8"
                    placeholder="Enter new password"
                    required
                  />
                  {passwordStrength && (
                    <div className={`text-xs mt-2 font-bold px-3 py-2 rounded-lg ${passwordStrength.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {passwordStrength}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    className="w-full bg-white border-2 border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                    placeholder="Re-enter new password"
                    required
                  />
                  {passwordMatch && (
                    <div className={`text-xs mt-2 font-bold px-3 py-2 rounded-lg ${passwordMatch.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {passwordMatch}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-6 mt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={updating || !oldPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-xl transition duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updating ? (
                    'Changing Password...'
                  ) : (
                    <>
                      <span>Secure Account</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}