// client/src/pages/auth/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { loginUser, clearError, clearSuccess, clearRedirect } from "../../redux/slices/authSlice";
import { googleLogin } from "../../redux/slices/authSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, success, redirect, userType, approved_status, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(clearSuccess());
    dispatch(loginUser({ email, password }));
  };

  const handleGoogleSuccess = (credentialResponse) => {
    dispatch(clearError());
    dispatch(clearSuccess());
    dispatch(googleLogin(credentialResponse.credential));
  };

  const handleGoogleError = () => {
    toast.error("Google login failed. Please try again.");
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearSuccess());
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (isAuthenticated && redirect) {
      if (userType === "mechanic" && approved_status !== "Yes") {
        setShowApprovalModal(true);
        return;
      }

      let finalRedirect = redirect;
      if (finalRedirect.includes("mechanic-dashboard")) finalRedirect = "/mechanic/dashboard";
      if (finalRedirect === "/buyer-dashboard") finalRedirect = "/buyer";
      if (finalRedirect === "/auctionmanager-dashboard") finalRedirect = "/auctionmanager";

      setTimeout(() => {
        navigate(finalRedirect, { replace: true });
        dispatch(clearRedirect());
      }, 800);
    }
  }, [isAuthenticated, redirect, userType, approved_status, navigate, dispatch]);

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    dispatch(clearError());
    dispatch(clearSuccess());
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
            <h2 className="text-xl font-bold text-gray-800 mb-4">Account Pending Approval</h2>
            <p className="text-gray-600 mb-6">Your mechanic account is pending admin approval. Please wait until it is approved.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowApprovalModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Close</button>
              <button onClick={() => { setShowApprovalModal(false); navigate('/'); }} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">Go to Home</button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="relative w-full max-w-md bg-white shadow-lg rounded-xl p-8">
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center bg-white hover:bg-gray-100 transition z-10"
            style={{ zIndex: 10 }}
          >
            <i className="fas fa-times text-gray-600"></i>
          </button>
          
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 mt-6">Login to Your Account</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email Address</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3 top-3 text-gray-500"></i>
                <input type="email" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500" value={email} onChange={handleInputChange(setEmail)} required disabled={loading} />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3 top-3 text-gray-500"></i>
                <input type="password" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500" value={password} onChange={handleInputChange(setPassword)} required disabled={loading} />
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full py-3 text-white rounded-lg text-lg font-semibold transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="flex items-center mt-4 mb-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-3 text-gray-500">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="350"
              />
            </div>

            <p className="text-center text-sm text-gray-600 mt-4">Don't have an account? <a href="/signup" className="text-orange-600 font-medium hover:underline">Sign up</a></p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
