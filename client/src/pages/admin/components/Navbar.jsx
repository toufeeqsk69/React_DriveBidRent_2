// src/components/Navbar.jsx  (or your preferred location)
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
    <nav className="admin-navbar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/admin/dashboard"
              className="admin-logo"
            >
              DriveBidRent
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/admin/dashboard" className="admin-nav-link">
              Dashboard
            </Link>
            <Link to="/admin/manage-users" className="admin-nav-link">
              Manage Users
            </Link>
            <Link to="/admin/manage-earnings" className="admin-nav-link">
              Earnings
            </Link>
            <Link to="/admin/analytics" className="admin-nav-link">
              Analytics
            </Link>
            <Link to="/admin/auction-managers" className="admin-nav-link">
              Auction Managers
            </Link>
          </div>

          {/* Profile + Logout */}
          <div className="flex items-center gap-4">
            <img
              src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              alt="Admin"
              className="h-10 w-10 rounded-full object-cover shadow-sm"
            />
            <Link
              to="/admin/admin-profile"
              className="admin-nav-link hidden sm:block !text-orange-600 uppercase text-xs tracking-wider"
            >
              My Profile
            </Link>

            <button
              onClick={handleLogout}
              className="admin-btn-primary !px-4 !py-2 !text-sm"
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