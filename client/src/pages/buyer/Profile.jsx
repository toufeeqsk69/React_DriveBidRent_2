import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useProfile } from '../../hooks/useBuyerHooks';
import LoadingSpinner from '../components/LoadingSpinner';
import './BuyerDashboard.css';
import {
  User, Phone, Mail, MapPin, Lock, Eye, EyeOff,
  CheckCircle2, XCircle, ShieldAlert, Save, KeyRound
} from 'lucide-react';

export default function Profile() {
  const { profile, loading, updateProfile, changePassword } = useProfile();
  const [profileForm, setProfileForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    doorNo: '', street: '', city: '', state: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '', newPassword: '', confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false, new: false, confirm: false
  });
  const [passwordStrength, setPasswordStrength] = useState('hint');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (profile && !hasInitialized.current) {
      hasInitialized.current = true;
      setProfileForm({
        firstName: profile.firstName || '',
        lastName:  profile.lastName  || '',
        phone:     profile.phone     || '',
        email:     profile.email     || '',
        doorNo:    profile.doorNo    || '',
        street:    profile.street    || '',
        city:      profile.city      || '',
        state:     profile.state     || ''
      });
    }
  }, [profile]);

  const handleProfileChange = (field, value) => {
    if (field === 'firstName') {
      setFirstNameError(/\d/.test(value) ? 'First name cannot contain numbers' : '');
    }
    if (field === 'lastName') {
      setLastNameError(/\d/.test(value) ? 'Last name cannot contain numbers' : '');
    }
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    const strong = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (field === 'newPassword') {
      if (!value) setPasswordStrength('hint');
      else if (!strong.test(value)) setPasswordStrength('weak');
      else setPasswordStrength('strong');
    }
    if (field === 'confirmPassword') {
      if (!value) setConfirmMessage('');
      else setConfirmMessage(passwordForm.newPassword === value ? 'match' : 'mismatch');
    }
  };

  const handlePhoneInput = (value) => {
    handleProfileChange('phone', value.replace(/\D/g, '').slice(0, 10));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (lastNameError || firstNameError) return toast.error('Names cannot contain numbers');
    if (profileForm.phone && !/^\d{10}$/.test(profileForm.phone))
      return toast.error('Phone number must be exactly 10 digits');
    try {
      const result = await updateProfile(profileForm);
      if (result?.success) toast.success(result.message || 'Profile updated successfully!');
      else toast.error(result?.message || 'Failed to update profile.');
    } catch (err) { toast.error(err?.message || 'An error occurred.'); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.oldPassword) return toast.error('Please enter your current password');
    if (passwordForm.oldPassword === passwordForm.newPassword)
      return toast.error('New password cannot be the same as current password');
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return toast.error('New passwords do not match');
    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(passwordForm.newPassword))
      return toast.error('Password must include uppercase, number, and special character');
    try {
      const result = await changePassword(passwordForm);
      if (result?.success) {
        toast.success(result.message || 'Password changed successfully!');
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordStrength('hint');
        setConfirmMessage('');
      } else toast.error(result?.message || 'Failed to change password.');
    } catch (err) { toast.error(err?.message || 'An error occurred.'); }
  };

  if (loading) return <LoadingSpinner />;

  const initials = `${profile?.firstName?.[0] || ''}${profile?.lastName?.[0] || ''}`.toUpperCase() || '?';
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Your Profile';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&display=swap');

        .pf-root *, .pf-root input, .pf-root button, .pf-root label {
          font-family: 'Montserrat', sans-serif;
          box-sizing: border-box;
        }

        .pf-root {
          min-height: 100vh;
          background: linear-gradient(180deg, #fdfcf9 0%, #f8f5f0 100%);
          padding: 48px 24px 80px;
        }

        /* ── page wrapper ── */
        .pf-wrap { max-width: 1080px; margin: 0 auto; }

        /* ── identity strip ── */
        .pf-identity {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 40px;
        }
        .pf-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c17f3a, #e8a855);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -1px;
          flex-shrink: 0;
          box-shadow: 0 8px 24px rgba(193,127,58,0.30);
        }
        .pf-identity-text {}
        .pf-identity-name {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
          line-height: 1.15;
        }
        .pf-identity-sub {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
          margin-top: 2px;
        }

        /* ── blocked banner ── */
        .pf-blocked {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          background: #fff5f5;
          border: 1.5px solid #fca5a5;
          border-radius: 16px;
          padding: 18px 22px;
          margin-bottom: 32px;
        }
        .pf-blocked-icon { flex-shrink: 0; margin-top: 1px; }
        .pf-blocked-title { font-size: 15px; font-weight: 700; color: #dc2626; margin-bottom: 4px; }
        .pf-blocked-body  { font-size: 13px; color: #991b1b; line-height: 1.5; }

        /* ── two-column layout ── */
        .pf-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          align-items: start;
        }
        @media (max-width: 860px) { .pf-cols { grid-template-columns: 1fr; } }

        /* ── card ── */
        .pf-card {
          background: #fff;
          border-radius: 24px;
          border: 1px solid #ece5dc;
          box-shadow: 0 8px 26px rgba(80,66,50,0.08);
          overflow: hidden;
        }
        .pf-card-head {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 22px 26px 18px;
          border-bottom: 1px solid #f2ece3;
        }
        .pf-card-head-icon {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pf-card-head-icon-amber { background: #fff3de; color: #c17f3a; }
        .pf-card-head-icon-navy  { background: #eaf0fb; color: #1a2d4a; }
        .pf-card-head-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.2px;
        }
        .pf-card-body { padding: 24px 26px 28px; }

        /* ── form fields ── */
        .pf-fields { display: flex; flex-direction: column; gap: 18px; }

        .pf-field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 560px) { .pf-field-row { grid-template-columns: 1fr; } }

        .pf-field { display: flex; flex-direction: column; gap: 6px; }
        .pf-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
        }
        .pf-input-wrap { position: relative; }
        .pf-input-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #c4bab0;
          pointer-events: none;
          display: flex;
        }
        .pf-input {
          width: 100%;
          padding: 11px 13px 11px 38px;
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
          background: #faf8f5;
          border: 1.5px solid #e6dfd6;
          border-radius: 12px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          -webkit-appearance: none;
        }
        .pf-input:focus {
          border-color: #c17f3a;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(193,127,58,0.13);
        }
        .pf-input:read-only {
          color: #94a3b8;
          cursor: not-allowed;
          background: #f5f1ec;
        }
        .pf-input-no-icon { padding-left: 13px; }
        .pf-hint { font-size: 11px; color: #94a3b8; font-weight: 500; }
        .pf-error { font-size: 11px; color: #dc2626; font-weight: 600; }

        /* eye toggle for password */
        .pf-eye {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 2px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .pf-eye:hover { color: #c17f3a; }
        .pf-input-with-eye { padding-right: 40px; }

        /* password strength bar */
        .pf-strength-bar {
          height: 4px;
          border-radius: 2px;
          background: #f0ece6;
          margin-top: 8px;
          overflow: hidden;
        }
        .pf-strength-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.3s ease, background 0.3s ease;
        }
        .pf-strength-text {
          font-size: 11px;
          font-weight: 600;
          margin-top: 5px;
        }

        /* confirm match */
        .pf-confirm-msg {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          margin-top: 5px;
        }

        /* section divider inside card */
        .pf-section-divider {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #c4bab0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .pf-section-divider::before,
        .pf-section-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #f0ece6;
        }

        /* submit buttons */
        .pf-btn {
          width: 100%;
          padding: 13px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s, transform 0.2s;
          margin-top: 8px;
        }
        .pf-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .pf-btn:active { transform: translateY(0); }
        .pf-btn-amber {
          background: linear-gradient(135deg, #c17f3a, #e8a855);
          color: #fff;
          box-shadow: 0 6px 18px rgba(193,127,58,0.28);
        }
        .pf-btn-navy {
          background: linear-gradient(135deg, #0f1a2e, #1a2d4a);
          color: #fff;
          box-shadow: 0 6px 18px rgba(15,26,46,0.24);
        }
      `}</style>

      <div className="pf-root">
        <div className="pf-wrap">

          {/* ── Identity strip ── */}
          <div className="pf-identity">
            <div className="pf-avatar">{initials}</div>
            <div className="pf-identity-text">
              <div className="pf-identity-name">{fullName}</div>
              <div className="pf-identity-sub">{profile?.email || 'Manage your account details and security'}</div>
            </div>
          </div>

          {/* ── Blocked banner ── */}
          {profile?.isBlocked && (
            <div className="pf-blocked">
              <ShieldAlert size={20} color="#dc2626" className="pf-blocked-icon" />
              <div>
                <div className="pf-blocked-title">Account Blocked</div>
                <div className="pf-blocked-body">
                  You can view your data but cannot place bids, book rentals, or update your profile.
                  Please contact admin for assistance.
                </div>
              </div>
            </div>
          )}

          {/* ── Two columns ── */}
          <div className="pf-cols">

            {/* ── Personal Details card ── */}
            <div className="pf-card">
              <div className="pf-card-head">
                <div className="pf-card-head-icon pf-card-head-icon-amber">
                  <User size={17} />
                </div>
                <span className="pf-card-head-title">Personal Details</span>
              </div>
              <div className="pf-card-body">
                <form onSubmit={handleProfileSubmit}>
                  <div className="pf-fields">

                    {/* Name row */}
                    <div className="pf-field-row">
                      <div className="pf-field">
                        <label className="pf-label">First Name</label>
                        <div className="pf-input-wrap">
                          <span className="pf-input-icon"><User size={14} /></span>
                          <input
                            className="pf-input"
                            type="text"
                            value={profileForm.firstName}
                            onChange={e => handleProfileChange('firstName', e.target.value)}
                          />
                        </div>
                        {firstNameError && <span className="pf-error">✕ {firstNameError}</span>}
                      </div>
                      <div className="pf-field">
                        <label className="pf-label">Last Name</label>
                        <div className="pf-input-wrap">
                          <span className="pf-input-icon"><User size={14} /></span>
                          <input
                            className="pf-input"
                            type="text"
                            value={profileForm.lastName}
                            onChange={e => handleProfileChange('lastName', e.target.value)}
                          />
                        </div>
                        {lastNameError && <span className="pf-error">✕ {lastNameError}</span>}
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="pf-field">
                      <label className="pf-label">Phone Number</label>
                      <div className="pf-input-wrap">
                        <span className="pf-input-icon"><Phone size={14} /></span>
                        <input
                          className="pf-input"
                          type="tel"
                          value={profileForm.phone}
                          onChange={e => handlePhoneInput(e.target.value)}
                          placeholder="10-digit number"
                        />
                      </div>
                      <span className="pf-hint">Must be exactly 10 digits</span>
                    </div>

                    {/* Email */}
                    <div className="pf-field">
                      <label className="pf-label">Email Address</label>
                      <div className="pf-input-wrap">
                        <span className="pf-input-icon"><Mail size={14} /></span>
                        <input
                          className="pf-input"
                          type="email"
                          value={profileForm.email}
                          readOnly
                        />
                      </div>
                      <span className="pf-hint">Email address cannot be changed</span>
                    </div>

                    {/* Address divider */}
                    <div className="pf-section-divider">Address</div>

                    {/* Door + Street */}
                    <div className="pf-field-row">
                      <div className="pf-field">
                        <label className="pf-label">Door / Flat No</label>
                        <div className="pf-input-wrap">
                          <span className="pf-input-icon"><MapPin size={14} /></span>
                          <input
                            className="pf-input"
                            type="text"
                            value={profileForm.doorNo}
                            onChange={e => handleProfileChange('doorNo', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="pf-field">
                        <label className="pf-label">Street / Area</label>
                        <div className="pf-input-wrap">
                          <span className="pf-input-icon"><MapPin size={14} /></span>
                          <input
                            className="pf-input"
                            type="text"
                            value={profileForm.street}
                            onChange={e => handleProfileChange('street', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* City + State */}
                    <div className="pf-field-row">
                      <div className="pf-field">
                        <label className="pf-label">City</label>
                        <div className="pf-input-wrap">
                          <span className="pf-input-icon"><MapPin size={14} /></span>
                          <input
                            className="pf-input"
                            type="text"
                            value={profileForm.city}
                            onChange={e => handleProfileChange('city', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="pf-field">
                        <label className="pf-label">State</label>
                        <div className="pf-input-wrap">
                          <span className="pf-input-icon"><MapPin size={14} /></span>
                          <input
                            className="pf-input"
                            type="text"
                            value={profileForm.state}
                            onChange={e => handleProfileChange('state', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="pf-btn pf-btn-amber">
                      <Save size={15} />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* ── Change Password card ── */}
            <div className="pf-card">
              <div className="pf-card-head">
                <div className="pf-card-head-icon pf-card-head-icon-navy">
                  <Lock size={17} />
                </div>
                <span className="pf-card-head-title">Change Password</span>
              </div>
              <div className="pf-card-body">
                <form onSubmit={handlePasswordSubmit}>
                  <div className="pf-fields">

                    {/* Current password */}
                    <div className="pf-field">
                      <label className="pf-label">Current Password</label>
                      <div className="pf-input-wrap">
                        <span className="pf-input-icon"><KeyRound size={14} /></span>
                        <input
                          className="pf-input pf-input-with-eye"
                          type={showPasswords.old ? 'text' : 'password'}
                          value={passwordForm.oldPassword}
                          onChange={e => handlePasswordChange('oldPassword', e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="pf-eye"
                          onClick={() => setShowPasswords(p => ({ ...p, old: !p.old }))}
                        >
                          {showPasswords.old ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* New password */}
                    <div className="pf-field">
                      <label className="pf-label">New Password</label>
                      <div className="pf-input-wrap">
                        <span className="pf-input-icon"><Lock size={14} /></span>
                        <input
                          className="pf-input pf-input-with-eye"
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={e => handlePasswordChange('newPassword', e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="pf-eye"
                          onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                        >
                          {showPasswords.new ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>

                      {/* Strength bar */}
                      {passwordForm.newPassword && (
                        <>
                          <div className="pf-strength-bar">
                            <div
                              className="pf-strength-fill"
                              style={{
                                width:      passwordStrength === 'strong' ? '100%' : passwordStrength === 'weak' ? '45%' : '0%',
                                background: passwordStrength === 'strong' ? '#16a34a' : '#f59e0b',
                              }}
                            />
                          </div>
                          <div
                            className="pf-strength-text"
                            style={{ color: passwordStrength === 'strong' ? '#16a34a' : '#f59e0b' }}
                          >
                            {passwordStrength === 'strong'
                              ? '✓ Strong password'
                              : 'Needs uppercase, number & special character'}
                          </div>
                        </>
                      )}
                      {!passwordForm.newPassword && (
                        <span className="pf-hint">Min 8 chars · uppercase · number · special char</span>
                      )}
                    </div>

                    {/* Confirm password */}
                    <div className="pf-field">
                      <label className="pf-label">Confirm New Password</label>
                      <div className="pf-input-wrap">
                        <span className="pf-input-icon"><Lock size={14} /></span>
                        <input
                          className="pf-input pf-input-with-eye"
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={e => handlePasswordChange('confirmPassword', e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="pf-eye"
                          onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                        >
                          {showPasswords.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {confirmMessage && (
                        <div
                          className="pf-confirm-msg"
                          style={{ color: confirmMessage === 'match' ? '#16a34a' : '#dc2626' }}
                        >
                          {confirmMessage === 'match'
                            ? <><CheckCircle2 size={13} /> Passwords match</>
                            : <><XCircle size={13} /> Passwords do not match</>}
                        </div>
                      )}
                    </div>

                    <button type="submit" className="pf-btn pf-btn-navy">
                      <KeyRound size={15} />
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}