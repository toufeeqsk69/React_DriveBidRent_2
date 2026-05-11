// client/src/pages/mechanic/profile/Profile.jsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { changePassword } from '../../../services/mechanic.services';
import useProfile from '../../../hooks/useProfile';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Profile() {
  const { profile: user, loading } = useProfile();
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordMatch, setPasswordMatch] = useState('');

  const handleNewPasswordChange = (value) => {
    setForm({ ...form, newPassword: value });
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
    setForm({ ...form, confirmPassword: value });
    if (!value) {
      setPasswordMatch('');
    } else if (form.newPassword !== value) {
      setPasswordMatch('❌ Passwords do not match');
    } else {
      setPasswordMatch('✅ Passwords match');
    }
  };

  const handleOldPasswordChange = (value) => {
    setForm({ ...form, oldPassword: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.oldPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (form.oldPassword === form.newPassword) {
      toast.error('New password cannot be the same as current password');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (form.newPassword.length < 8) {
      toast.error('New password must be 8+ characters');
      return;
    }

    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!strongRegex.test(form.newPassword)) {
      toast.error('Password must include uppercase letter, number, and special character');
      return;
    }

    setSubmitting(true);
    try {
      const res = await changePassword(form);
      toast.success(res.data.message || 'Password updated successfully');
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStrength('');
      setPasswordMatch('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen font-montserrat" style={{ background: '#f8fafc' }}>
      {/* ── HERO — Premium dark banner ── */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0c1220 0%, #111827 50%, #0c1628 100%)',
        paddingTop: 60,
        paddingBottom: 60,
        overflow: 'hidden',
      }}>
        {/* Floating orbs */}
        {[
          { top: '20%', left: '10%', size: 150, color: 'rgba(99,102,241,0.08)', delay: '0s' },
          { top: '50%', left: '70%', size: 200, color: 'rgba(139,92,246,0.07)', delay: '1s' },
        ].map((orb, i) => (
          <div key={i} style={{
            position: 'absolute', top: orb.top, left: orb.left,
            width: orb.size, height: orb.size, borderRadius: '50%',
            background: orb.color, filter: 'blur(40px)',
            animationDelay: orb.delay, pointerEvents: 'none',
          }} />
        ))}
        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', position: 'relative' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32 }}>
            {/* Left: title */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
                padding: '6px 14px', borderRadius: 100, marginBottom: 16,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Account</span>
              </div>
              <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1.05, marginBottom: 12 }}>
                My <span style={{ color: '#6366f1', fontStyle: 'italic' }}>Profile</span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 420, lineHeight: 1.7 }}>
                Manage your account and security settings
              </p>
            </div>

            {/* Right: stat pills */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {/* Status Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderRadius: 16, background: user?.approved_status === 'Yes' ? 'rgba(16,185,129,0.14)' : 'rgba(245,158,11,0.14)', border: user?.approved_status === 'Yes' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(245,158,11,0.3)' }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: user?.approved_status === 'Yes' ? '#34d399' : '#fbbf24', lineHeight: 1 }}>{user?.approved_status === 'Yes' ? 'Approved' : 'Pending'}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: user?.approved_status === 'Yes' ? 'rgba(52,211,153,0.6)' : 'rgba(251,191,36,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Account Status</div>
                </div>
              </div>
              
              {/* Experience Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{user?.experienceYears || 0} <span className="text-lg">Yrs</span></div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto pb-24 px-4 pt-12">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Personal Information */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-between h-full">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-8 border-b border-gray-100 pb-4">Personal Information</h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex flex-col bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</span>
                  <span className="text-lg font-bold text-gray-900">{user?.firstName} {user?.lastName}</span>
                </div>
                <div className="flex flex-col bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</span>
                  <span className="text-lg font-bold text-gray-900">{user?.email}</span>
                </div>
                <div className="flex flex-col bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</span>
                  <span className="text-lg font-bold text-gray-900">{user?.phone || '—'}</span>
                </div>
                <div className="flex flex-col bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Shop/Business Name</span>
                  <span className="text-lg font-bold text-gray-900">{user?.shopName || '—'}</span>
                </div>
                <div className="flex flex-col bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Services</span>
                  <span className="text-lg font-bold text-gray-900">
                    {user?.repairCars && user?.repairBikes ? 'Cars & Bikes' : user?.repairCars ? 'Cars Only' : 'Bikes Only'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col h-full">
            <h2 className="text-2xl font-black text-gray-900 mb-8 border-b border-gray-100 pb-4">Change Password</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter current password" 
                    required 
                    value={form.oldPassword} 
                    onChange={e => handleOldPasswordChange(e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-gray-50 font-medium" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter new password" 
                    required 
                    value={form.newPassword} 
                    onChange={e => handleNewPasswordChange(e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-gray-50 font-medium" 
                  />
                  {passwordStrength && (
                    <div className={`text-xs mt-2 px-3 py-2 rounded-lg font-bold ${passwordStrength.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {passwordStrength}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                  <input 
                    type="password" 
                    placeholder="Confirm new password" 
                    required 
                    value={form.confirmPassword} 
                    onChange={e => handleConfirmPasswordChange(e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-gray-50 font-medium" 
                  />
                  {passwordMatch && (
                    <div className={`text-xs mt-2 px-3 py-2 rounded-lg font-bold ${passwordMatch.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {passwordMatch}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-auto pt-8">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full inline-flex justify-center items-center py-4 bg-gray-900 hover:bg-indigo-600 text-white font-bold rounded-xl transition duration-300 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}