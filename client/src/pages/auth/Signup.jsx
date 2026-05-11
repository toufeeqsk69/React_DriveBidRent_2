// client/src/pages/auth/Signup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { signupUser, verifySignupOtp, cancelSignupOtp, clearError, clearSuccess } from '../../redux/slices/authSlice';

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, success, message, requireSignupOtpUI, signupEmail, redirect: authRedirect } = useSelector((state) => state.auth);
  
  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState({
    userType: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    doorNo: '',
    street: '',
    city: '',
    state: '',
    drivingLicense: '',
    shopName: '',
    experienceYears: '',
    googleAddressLink: '',
    repairBikes: false,
    repairCars: false,
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (success) {
      toast.success(message || 'Success!');
      setTimeout(() => {
        if (!requireSignupOtpUI) {
          navigate(authRedirect || '/login');
        }
      }, 2000);
    }
  }, [success, message, navigate, authRedirect, requireSignupOtpUI]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate on change and update errors immediately
    const newValue = type === 'checkbox' ? checked : value;
    const error = validateField(name, newValue);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) error = 'Required';
        else if (/\d/.test(value)) error = 'Numbers not allowed';
        break;
      case 'email':
        if (!value) error = 'Required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) error = 'Invalid email';
        break;
      case 'phone':
        if (!value) error = 'Required';
        else if (!/^[6-9]\d{9}$/.test(value)) error = 'Must be 10 digits, starting with 6, 7, 8, or 9';
        break;
      case 'password':
        if (!value) error = 'Required';
        else {
          const errors = [];
          if (!/[A-Za-z]/.test(value)) errors.push('1 alphabet');
          if (!/\d/.test(value)) errors.push('1 digit');
          if (!/[@$!%*?&]/.test(value)) errors.push('1 special char (@$!%*?&)');
          if (value.length < 8) errors.push('8+ chars');
          if (errors.length > 0) error = `Missing: ${errors.join(', ')}`;
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) error = 'Passwords do not match';
        break;
      case 'dateOfBirth':
        if (!value) error = 'Required';
        else {
          const selectedDate = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - selectedDate.getFullYear();
          const monthDiff = today.getMonth() - selectedDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
            age--;
          }
          if (age < 18) error = 'Must be at least 18 years old';
        }
        break;
      case 'experienceYears':
        if (value && value >= 50) error = 'Experience must be less than 50 years';
        break;
      case 'userType':
        if (!value) error = 'Select a role';
        break;
      case 'termsAccepted':
        if (!value) error = 'Must accept terms';
        break;
      default:
        break;
    }
    return error;
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateAll();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Object.keys(newErrors).forEach((key) => {
        setTouched((prev) => ({ ...prev, [key]: true }));
      });
      // Scroll to first error
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Remove confirmPassword before sending to backend
    const { confirmPassword: _confirmPassword, ...signupData } = formData;
    dispatch(clearError());
    dispatch(clearSuccess());
    dispatch(signupUser(signupData));
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    dispatch(clearError());
    dispatch(clearSuccess());
    dispatch(verifySignupOtp({ email: signupEmail, otp }));
  };

  const getBorderColor = (field) => {
    if (!touched[field]) return 'border-gray-300 hover:border-gray-400';
    return errors[field] ? 'border-red-500 focus:border-red-500' : 'border-green-500 focus:border-green-500';
  };

  // Helper functions for password validation display
  const hasAlphabet = (pwd) => /[A-Za-z]/.test(pwd);
  const hasDigit = (pwd) => /\d/.test(pwd);
  const hasSpecialChar = (pwd) => /[@$!%*?&]/.test(pwd);
  const hasMinLength = (pwd) => pwd.length >= 8;

  const getPasswordRequirementColor = (condition) => {
    return condition ? 'text-green-600' : 'text-red-600';
  };

  // Calculate max date for 18+ requirement
  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <>
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
        rel="stylesheet"
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
        <div className="relative max-w-4xl w-full bg-white p-8 rounded-2xl shadow-2xl">
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
          >
            <i className="fas fa-times text-gray-600"></i>
          </button>

          {requireSignupOtpUI ? (
            <div className="max-w-md mx-auto mt-8 mb-6">
              <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Verify Email</h1>
              <p className="text-center text-gray-600 mb-6">
                We've sent a 6-digit code to <br/><span className="font-semibold text-gray-800">{signupEmail}</span>
              </p>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Enter OTP Code</label>
                  <div className="relative">
                    <i className="fas fa-key absolute left-3 top-3 text-gray-500"></i>
                    <input 
                      type="text" 
                      maxLength={6}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 font-mono text-center tracking-[0.5em] text-lg" 
                      value={otp} 
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/[^0-9]/g, ''));
                        dispatch(clearError());
                        dispatch(clearSuccess());
                      }} 
                      placeholder="------"
                      required 
                      disabled={loading} 
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => dispatch(cancelSignupOtp())}
                    disabled={loading} 
                    className="w-1/3 py-3 text-gray-700 bg-gray-200 rounded-lg text-lg font-semibold transition hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading || otp.length !== 6} 
                    className={`w-2/3 py-3 text-white rounded-lg text-lg font-semibold transition ${loading || otp.length !== 6 ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mt-10">Create an Account</h1>
              </div>

              {/* Role Selection Cards */}
          {!formData.userType && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Choose your role:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['buyer', 'seller', 'mechanic'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, userType: role }));
                      setTouched(prev => ({ ...prev, userType: true }));
                    }}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 text-left"
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-100 to-orange-200 flex items-center justify-center mr-3">
                        <i className={`fas fa-${role === 'buyer' ? 'shopping-cart' : role === 'seller' ? 'store' : 'tools'} text-orange-600`}></i>
                      </div>
                      <span className="font-semibold capitalize">{role}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {role === 'buyer' && 'Buy or rent vehicles'}
                      {role === 'seller' && 'Sell or rent out your vehicles'}
                      {role === 'mechanic' && 'Offer repair services'}
                    </p>
                  </button>
                ))}
              </div>
              {errors.userType && touched.userType && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  {errors.userType}
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {formData.userType && (
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center mr-3">
                      <i className={`fas fa-${formData.userType === 'buyer' ? 'user' : formData.userType === 'seller' ? 'store' : 'tools'}`}></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Registering as: <span className="capitalize text-orange-600">{formData.userType}</span></h3>
                      <p className="text-sm text-gray-600">
                        {formData.userType === 'buyer' ? 'Vehicle buyer/renter account' :
                          formData.userType === 'seller' ? 'Vehicle seller/renter account' :
                            'Vehicle repair service provider account'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, userType: '' }))}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    <i className="fas fa-edit mr-1"></i> Change
                  </button>
                </div>
              </div>
            )}

            {/* Basic Information Section */}
            <div className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <i className="fas fa-user mr-2 text-gray-500"></i>
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={() => setTouched((p) => ({ ...p, firstName: true }))}
                      className={`w-full pl-4 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 transition-all duration-300 ${getBorderColor('firstName')}`}
                      placeholder="Enter your first name"
                    />
                    {touched.firstName && !errors.firstName && formData.firstName && (
                      <i className="fas fa-check absolute right-3 top-3.5 text-green-500"></i>
                    )}
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <i className="fas fa-user mr-2 text-gray-500"></i>
                    Last Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={() => setTouched((p) => ({ ...p, lastName: true }))}
                      className={`w-full pl-4 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 transition-all duration-300 ${getBorderColor('lastName')}`}
                      placeholder="Enter your last name"
                    />
                    {touched.lastName && !errors.lastName && formData.lastName && (
                      <i className="fas fa-check absolute right-3 top-3.5 text-green-500"></i>
                    )}
                  </div>
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <i className="fas fa-envelope mr-2 text-gray-500"></i>
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                      className={`w-full pl-4 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 transition-all duration-300 ${getBorderColor('email')}`}
                      placeholder="you@example.com"
                    />
                    {touched.email && !errors.email && formData.email && (
                      <i className="fas fa-check absolute right-3 top-3.5 text-green-500"></i>
                    )}
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <i className="fas fa-phone mr-2 text-gray-500"></i>
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                      maxLength="10"
                      className={`w-full pl-4 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 transition-all duration-300 ${getBorderColor('phone')}`}
                      placeholder="Enter your phone number"
                    />
                    {touched.phone && !errors.phone && formData.phone && (
                      <i className="fas fa-check absolute right-3 top-3.5 text-green-500"></i>
                    )}
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <i className="fas fa-calendar-alt mr-2 text-gray-500"></i>
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    onBlur={() => setTouched((p) => ({ ...p, dateOfBirth: true }))}
                    max={getMaxDate()}
                    className={`w-full pl-4 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 transition-all duration-300 ${getBorderColor('dateOfBirth')}`}
                  />
                  {touched.dateOfBirth && !errors.dateOfBirth && formData.dateOfBirth && (
                    <i className="fas fa-check absolute right-3 top-3.5 text-green-500"></i>
                  )}
                </div>
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>
            </div>

            {/* Security Section */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <i className="fas fa-lock mr-2 text-gray-500"></i>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                      className={`w-full pl-4 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 transition-all duration-300 ${getBorderColor('password')}`}
                      placeholder="Create a strong password"
                    />
                    {touched.password && !errors.password && formData.password && (
                      <i className="fas fa-check absolute right-3 top-3.5 text-green-500"></i>
                    )}
                  </div>
                  {formData.password && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className={`flex flex-col items-center ${getPasswordRequirementColor(hasAlphabet(formData.password))}`}>
                          <i className={`fas fa-${hasAlphabet(formData.password) ? 'check-circle' : 'times-circle'} text-lg mb-1`}></i>
                          <span>Alphabet</span>
                        </div>
                        <div className={`flex flex-col items-center ${getPasswordRequirementColor(hasDigit(formData.password))}`}>
                          <i className={`fas fa-${hasDigit(formData.password) ? 'check-circle' : 'times-circle'} text-lg mb-1`}></i>
                          <span>Digit</span>
                        </div>
                        <div className={`flex flex-col items-center ${getPasswordRequirementColor(hasSpecialChar(formData.password))}`}>
                          <i className={`fas fa-${hasSpecialChar(formData.password) ? 'check-circle' : 'times-circle'} text-lg mb-1`}></i>
                          <span>Special Char</span>
                        </div>
                        <div className={`flex flex-col items-center ${getPasswordRequirementColor(hasMinLength(formData.password))}`}>
                          <i className={`fas fa-${hasMinLength(formData.password) ? 'check-circle' : 'times-circle'} text-lg mb-1`}></i>
                          <span>8 Chars</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <i className="fas fa-lock mr-2 text-gray-500"></i>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
                      className={`w-full pl-4 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 transition-all duration-300 ${getBorderColor('confirmPassword')}`}
                      placeholder="Re-enter your password"
                    />
                    {formData.confirmPassword && formData.password && (
                      <i className={`fas fa-${formData.confirmPassword === formData.password ? 'check' : 'times'} absolute right-3 top-3.5 ${formData.confirmPassword === formData.password ? 'text-green-500' : 'text-red-500'}`}></i>
                    )}
                  </div>
                  {formData.confirmPassword && formData.password && (
                    <div className="mt-2">
                      {formData.confirmPassword === formData.password ? (
                        <p className="text-green-600 text-sm flex items-center">
                          <i className="fas fa-check-circle mr-2"></i>
                          Passwords match
                        </p>
                      ) : (
                        <p className="text-red-600 text-sm flex items-center">
                          <i className="fas fa-times-circle mr-2"></i>
                          Passwords do not match
                        </p>
                      )}
                    </div>
                  )}
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Role-specific Sections */}
            {(formData.userType === 'buyer' || formData.userType === 'seller') && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    name="doorNo"
                    placeholder="Door / Flat No."
                    value={formData.doorNo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                  />
                  <input
                    type="text"
                    name="street"
                    placeholder="Street / Area"
                    value={formData.street}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                  />
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white"
                  >
                    <option value="">Select City</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Kurnool">Kurnool</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bangalore">Bangalore</option>
                  </select>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                  />
                </div>
              </div>
            )}

            {formData.userType === 'mechanic' && (
              <div className="space-y-6">
                <div className="space-y-6">
                  <input
                    type="text"
                    name="shopName"
                    placeholder="Shop Name"
                    value={formData.shopName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                      type="text"
                      name="doorNo"
                      placeholder="Shop Door No."
                      value={formData.doorNo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                    />
                    <input
                      type="text"
                      name="street"
                      placeholder="Shop Street"
                      value={formData.street}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                    />
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white"
                    >
                      <option value="">Select City</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Kurnool">Kurnool</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Bangalore">Bangalore</option>
                    </select>
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                    />
                  </div>
                  <input
                    type="number"
                    name="experienceYears"
                    placeholder="Experience (Years)"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    onBlur={() => setTouched((p) => ({ ...p, experienceYears: true }))}
                    min="0"
                    max="49"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 transition-all duration-300 ${getBorderColor('experienceYears')}`}
                  />
                  {errors.experienceYears && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.experienceYears}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center p-4 border border-gray-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 cursor-pointer">
                      <input
                        type="checkbox"
                        name="repairBikes"
                        checked={formData.repairBikes}
                        onChange={handleChange}
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="ml-3 font-medium">Bike Repair</span>
                    </label>
                    <label className="flex items-center p-4 border border-gray-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 cursor-pointer">
                      <input
                        type="checkbox"
                        name="repairCars"
                        checked={formData.repairCars}
                        onChange={handleChange}
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="ml-3 font-medium">Car Repair</span>
                    </label>
                  </div>
                  <input
                    type="url"
                    name="googleAddressLink"
                    placeholder="Google Maps Link to your workshop"
                    value={formData.googleAddressLink}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                  />
                </div>
              </div>
            )}

            {/* Terms */}
            <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    onBlur={() => setTouched((p) => ({ ...p, termsAccepted: true }))}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 focus:ring-offset-1"
                  />
                </div>
                <label className="ml-3 text-sm">
                  <span className="font-medium text-gray-900">
                    I agree to the{' '}
                    <a href="#" className="text-orange-600 hover:text-orange-700 font-semibold">
                      Terms and Conditions
                    </a>
                    {' '}and{' '}
                    <a href="#" className="text-orange-600 hover:text-orange-700 font-semibold">
                      Privacy Policy
                    </a>
                  </span>
                  <p className="text-gray-600 mt-1">
                    By creating an account, you agree to our terms and acknowledge our data practices.
                  </p>
                </label>
              </div>
              {errors.termsAccepted && touched.termsAccepted && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {errors.termsAccepted}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 disabled:opacity-70 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-3"></i>
                  Creating Account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus mr-3"></i>
                  Create Account
                </>
              )}
            </button>
          </form>
          </>
          )}

          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          width: 20px;
          height: 20px;
          opacity: 1;
        }
      `}</style>
    </>
  );
};

export default Signup;
