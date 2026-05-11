// client/src/pages/auth/auctionManagerLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { auctionAuthServices } from '../../services/auctionAuth.services';

const AuctionManagerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await auctionAuthServices.login({ email, password });
      
      if (response.success) {
        // Check if account is approved
        if (response.approved === false) {
          setShowApprovalModal(true);
          setLoading(false);
          return;
        }

        toast.success(response.message || 'Login successful!');
        setTimeout(() => {
          navigate(response.redirect || '/auctionmanager/dashboard');
        }, 800);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Check if the error is about approval status
      if (error.response?.data?.approved === false) {
        setShowApprovalModal(true);
      } else {
        const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
      />

      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                <i className="fas fa-hourglass-half text-yellow-600 text-2xl"></i>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Account Pending Approval</h2>
            <p className="text-gray-600 mb-6 text-center">
              Your auction manager account is pending admin approval. Please wait until it is approved.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  navigate('/');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="relative w-full max-w-md bg-white shadow-lg rounded-xl p-8">
          {/* Close button */}
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center bg-white hover:bg-gray-100 transition z-10"
          >
            <i className="fas fa-times text-gray-600"></i>
          </button>

          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 mt-6">
            Auction Manager Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email Address</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3 top-3 text-gray-500"></i>
                <input
                  type="email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  value={email}
                  onChange={handleInputChange(setEmail)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3 top-3 text-gray-500"></i>
                <input
                  type="password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  value={password}
                  onChange={handleInputChange(setPassword)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white rounded-lg text-lg font-semibold transition ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>



            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{' '}
              <Link
                to="/secret-signup"
                className="text-orange-600 font-medium hover:underline"
              >
                Register here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default AuctionManagerLogin;