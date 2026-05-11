// client/src/pages/auth/auctionManagersignup.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { auctionAuthServices } from '../../services/auctionAuth.services';

const AuctionManagerSignup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    city: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setTouched((prev) => ({ ...prev, [name]: true }));

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
        else if (!/^[6-9]\d{9}$/.test(value)) error = 'Must be 10 digits, starting with 6-9';
        break;
      case 'password':
        if (!value) error = 'Required';
        else {
          const errs = [];
          if (!/[A-Za-z]/.test(value)) errs.push('1 letter');
          if (!/\d/.test(value)) errs.push('1 digit');
          if (!/[@$!%*?&]/.test(value)) errs.push('1 special char');
          if (value.length < 8) errs.push('min 8 chars');
          if (errs.length > 0) error = `Missing: ${errs.join(', ')}`;
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) error = 'Passwords do not match';
        break;
      case 'dateOfBirth':
        if (!value) error = 'Required';
        else {
          const selected = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - selected.getFullYear();
          const mDiff = today.getMonth() - selected.getMonth();
          if (mDiff < 0 || (mDiff === 0 && today.getDate() < selected.getDate())) age--;
          if (age < 18) error = 'Must be 18+ years old';
        }
        break;
      case 'city':
        if (!value.trim()) error = 'Required';
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
      const firstError = Object.keys(newErrors)[0];
      document.getElementsByName(firstError)?.[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast.error('Please fix the errors');
      return;
    }

    setLoading(true);

    try {
      // Remove confirmPassword before sending to backend
      const { confirmPassword: _confirmPassword, ...signupData } = formData;
      
      const response = await auctionAuthServices.signup(signupData);
      
      if (response.success) {
        toast.success(response.message || 'Account created! Awaiting admin approval.');
        setTimeout(() => {
          navigate('/secret-login');
        }, 2000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getBorderColor = (field) => {
    if (!touched[field]) return 'border-gray-300 hover:border-gray-400';
    return errors[field] ? 'border-red-500 focus:border-red-500' : 'border-green-500 focus:border-green-500';
  };

  // Password strength helpers
  const hasAlphabet = (pwd) => /[A-Za-z]/.test(pwd);
  const hasDigit = (pwd) => /\d/.test(pwd);
  const hasSpecialChar = (pwd) => /[@$!%*?&]/.test(pwd);
  const hasMinLength = (pwd) => pwd.length >= 8;

  const getPasswordRequirementColor = (condition) => (condition ? 'text-green-600' : 'text-red-600');

  const getMaxDate = () => {
    const today = new Date();
    const max = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return max.toISOString().split('T')[0];
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

          <div className="mb-8 mt-10">
            <h1 className="text-3xl font-bold text-gray-800 text-center">
              Auction Manager Registration
            </h1>
            <p className="text-gray-600 text-center mt-2">
              Join our team of auction professionals
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic fields */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={() => setTouched((p) => ({ ...p, firstName: true }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 ${getBorderColor(
                      'firstName'
                    )}`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && touched.firstName && (
                    <p className="text-red-500 text-sm mt-1.5">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={() => setTouched((p) => ({ ...p, lastName: true }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 ${getBorderColor(
                      'lastName'
                    )}`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && touched.lastName && (
                    <p className="text-red-500 text-sm mt-1.5">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 ${getBorderColor(
                      'email'
                    )}`}
                    placeholder="manager@example.com"
                  />
                  {errors.email && touched.email && (
                    <p className="text-red-500 text-sm mt-1.5">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                    maxLength={10}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 ${getBorderColor(
                      'phone'
                    )}`}
                    placeholder="Enter 10-digit number"
                  />
                  {errors.phone && touched.phone && (
                    <p className="text-red-500 text-sm mt-1.5">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    onBlur={() => setTouched((p) => ({ ...p, dateOfBirth: true }))}
                    max={getMaxDate()}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 ${getBorderColor(
                      'dateOfBirth'
                    )}`}
                  />
                  {errors.dateOfBirth && touched.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1.5">{errors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    onBlur={() => setTouched((p) => ({ ...p, city: true }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 ${getBorderColor(
                      'city'
                    )}`}
                    placeholder="Enter your city"
                  />
                  {errors.city && touched.city && (
                    <p className="text-red-500 text-sm mt-1.5">{errors.city}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Password section */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 ${getBorderColor(
                      'password'
                    )}`}
                    placeholder="Create strong password"
                  />

                  {formData.password && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className={`flex flex-col items-center ${getPasswordRequirementColor(hasAlphabet(formData.password))}`}>
                          <i className={`fas fa-${hasAlphabet(formData.password) ? 'check-circle' : 'times-circle'} text-lg mb-1`}></i>
                          <span>Letter</span>
                        </div>
                        <div className={`flex flex-col items-center ${getPasswordRequirementColor(hasDigit(formData.password))}`}>
                          <i className={`fas fa-${hasDigit(formData.password) ? 'check-circle' : 'times-circle'} text-lg mb-1`}></i>
                          <span>Digit</span>
                        </div>
                        <div className={`flex flex-col items-center ${getPasswordRequirementColor(hasSpecialChar(formData.password))}`}>
                          <i className={`fas fa-${hasSpecialChar(formData.password) ? 'check-circle' : 'times-circle'} text-lg mb-1`}></i>
                          <span>Special</span>
                        </div>
                        <div className={`flex flex-col items-center ${getPasswordRequirementColor(hasMinLength(formData.password))}`}>
                          <i className={`fas fa-${hasMinLength(formData.password) ? 'check-circle' : 'times-circle'} text-lg mb-1`}></i>
                          <span>8+ chars</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {errors.password && touched.password && (
                    <p className="text-red-500 text-sm mt-1.5">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 ${getBorderColor(
                      'confirmPassword'
                    )}`}
                    placeholder="Re-enter password"
                  />

                  {formData.confirmPassword && formData.password && (
                    <p
                      className={`mt-2 text-sm flex items-center ${
                        formData.confirmPassword === formData.password ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      <i
                        className={`fas fa-${
                          formData.confirmPassword === formData.password ? 'check-circle' : 'times-circle'
                        } mr-2`}
                      ></i>
                      {formData.confirmPassword === formData.password ? 'Passwords match' : 'Passwords do not match'}
                    </p>
                  )}

                  {errors.confirmPassword && touched.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1.5">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

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
                      Terms & Conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-orange-600 hover:text-orange-700 font-semibold">
                      Privacy Policy
                    </a>
                  </span>
                  <p className="text-gray-600 mt-1">
                    Your account will be activated only after admin approval.
                  </p>
                </label>
              </div>
              {errors.termsAccepted && touched.termsAccepted && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <i className="fas fa-exclamation-circle mr-1.5"></i>
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
                  Create Manager Account
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/secret-login"
                className="font-semibold text-orange-600 hover:text-orange-700 hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
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

export default AuctionManagerSignup;