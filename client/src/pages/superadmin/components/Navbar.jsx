// client/src/pages/superadmin/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../../redux/slices/authSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("user");
      navigate("/", { replace: true });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-lg border-b-2 border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/superadmin/dashboard"
              className="text-2xl font-bold text-orange-600 tracking-tight hover:text-orange-700 transition-colors"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              DriveBidRent
            </Link>
            <span className="ml-3 text-xs font-semibold text-gray-500 bg-orange-100 px-2 py-1 rounded-full">SUPER ADMIN</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/superadmin/dashboard"
              className="text-gray-700 hover:text-orange-600 font-medium transition-all duration-200 hover:border-b-2 hover:border-orange-600 pb-1"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Dashboard
            </Link>
            <Link
              to="/superadmin/analytics"
              className="text-gray-700 hover:text-orange-600 font-medium transition-all duration-200 hover:border-b-2 hover:border-orange-600 pb-1"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Analytics
            </Link>
            <Link
              to="/superadmin/user-activities"
              className="text-gray-700 hover:text-orange-600 font-medium transition-all duration-200 hover:border-b-2 hover:border-orange-600 pb-1"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Users
            </Link>
            <Link
              to="/superadmin/revenue"
              className="text-gray-700 hover:text-orange-600 font-medium transition-all duration-200 hover:border-b-2 hover:border-orange-600 pb-1"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Revenue
            </Link>
            <Link
              to="/superadmin/trends"
              className="text-gray-700 hover:text-orange-600 font-medium transition-all duration-200 hover:border-b-2 hover:border-orange-600 pb-1"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Trends
            </Link>
          </div>

          {/* Profile + Logout */}
          <div className="flex items-center gap-4">
            <Link
              to="/superadmin/profile"
              className="text-gray-700 hover:text-orange-600 font-medium transition-all duration-200 hidden sm:block"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Profile
            </Link>

            <button
              onClick={handleLogout}
              className="bg-orange-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-md hover:shadow-lg"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
