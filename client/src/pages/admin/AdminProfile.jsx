import React, { useState } from "react";

import toast from 'react-hot-toast';
import adminServices from "../../services/admin.services";
import LoadingSpinner from "../components/LoadingSpinner";
import useProfile from "../../hooks/useProfile";

const AdminProfile = () => {
  const { profile: admin, loading, refresh } = useProfile();
  const [error, _setError] = useState("");
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordMatch, setPasswordMatch] = useState("");



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "newPassword") {
      const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      if (!value) {
        setPasswordStrength("Password must be at least 8 characters, include uppercase, number, special character");
      } else if (!strongRegex.test(value)) {
        setPasswordStrength("❌ Weak password: must include uppercase, number, special char");
      } else {
        setPasswordStrength("✅ Strong password");
      }
    }

    if (name === "confirmPassword") {
      if (!value) {
        setPasswordMatch("");
      } else if (formData.newPassword !== value) {
        setPasswordMatch("❌ Passwords do not match");
      } else {
        setPasswordMatch("✅ Passwords match");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = formData;

    if (currentPassword === newPassword) {
      toast.error("New password cannot be the same as current password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      const res = await adminServices.updateAdminPassword(formData);
      if (res.success) {
        toast.success(res.message);
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setPasswordStrength("Password must be at least 8 characters, include uppercase, number, special character");
        setPasswordMatch("");
        refresh();
      } else {
        toast.error(res.message || "Password update failed");
      }
    } catch (_err) {
      toast.error("An error occurred. Please try again.");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message" style={{ textAlign: "center", color: "#c62828", marginTop: "2rem" }}>{error}</div>;
  // If profile hasn't been loaded yet (no admin object), show spinner instead of rendering and risking an exception
  if (!admin) return <LoadingSpinner />;

  return (
    <>
      <div className="profile-settings" style={{ padding: "4rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div className="admin-page-header">
          <h1 className="admin-page-title">
            <i className="fas fa-user-shield"></i>
            Admin Profile
          </h1>
          <p className="admin-page-subtitle">Manage your personal details and security</p>
        </div>

        <div className="profile-container" style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <div className="profile-details" style={{ flex: 1, minWidth: "300px", background: "#fff", padding: "2rem", borderRadius: "1rem", border: "1px solid #ff6b00", boxShadow: "0 5px 15px rgba(255,107,0,0.1)" }}>
            <h3 style={{ color: "#ff6b00", fontSize: "1.5rem", marginBottom: "1.5rem", borderBottom: "2px solid #ff6b00", paddingBottom: "0.5rem" }}>
              Profile Details
            </h3>
            <div className="profile-details-item" style={{ marginBottom: "1rem", fontSize: "1.05rem" }}>
              <strong style={{ display: "inline-block", width: "160px", fontWeight: 600, color: "#555" }}>First Name:</strong>
              <span className="read-only" style={{ padding: "0.75rem 0.5rem", border: "1px solid #eee", borderRadius: "0.5rem", background: "#f4f4f4", marginBottom: "1rem", color: "#666", display: "block" }}>{admin.firstName}</span>
            </div>
            <div className="profile-details-item" style={{ marginBottom: "1rem", fontSize: "1.05rem" }}>
              <strong style={{ display: "inline-block", width: "160px", fontWeight: 600, color: "#555" }}>Last Name:</strong>
              <span className="read-only" style={{ padding: "0.75rem 0.5rem", border: "1px solid #eee", borderRadius: "0.5rem", background: "#f4f4f4", marginBottom: "1rem", color: "#666", display: "block" }}>{admin.lastName}</span>
            </div>
            <div className="profile-details-item" style={{ marginBottom: "1rem", fontSize: "1.05rem" }}>
              <strong style={{ display: "inline-block", width: "160px", fontWeight: 600, color: "#555" }}>Email:</strong>
              <span className="read-only" style={{ padding: "0.75rem 0.5rem", border: "1px solid #eee", borderRadius: "0.5rem", background: "#f4f4f4", marginBottom: "1rem", color: "#666", display: "block" }}>{admin.email}</span>
            </div>
            <div className="profile-details-item" style={{ marginBottom: "1rem", fontSize: "1.05rem" }}>
              <strong style={{ display: "inline-block", width: "160px", fontWeight: 600, color: "#555" }}>Phone:</strong>
              <span className="read-only" style={{ padding: "0.75rem 0.5rem", border: "1px solid #eee", borderRadius: "0.5rem", background: "#f4f4f4", marginBottom: "1rem", color: "#666", display: "block" }}>{admin.phone}</span>
            </div>
            <div className="profile-details-item" style={{ marginBottom: "1rem", fontSize: "1.05rem" }}>
              <strong style={{ display: "inline-block", width: "160px", fontWeight: 600, color: "#555" }}>Address:</strong>
              <span className="read-only" style={{ padding: "0.75rem 0.5rem", border: "1px solid #eee", borderRadius: "0.5rem", background: "#f4f4f4", marginBottom: "1rem", color: "#666", display: "block" }}>
                {admin.doorNo}, {admin.street}, {admin.city}, {admin.state}
              </span>
            </div>
          </div>

          <div className="change-password" style={{ flex: 1, minWidth: "300px", background: "#fff", padding: "2rem", borderRadius: "1rem", border: "1px solid #ff6b00", boxShadow: "0 5px 15px rgba(255,107,0,0.1)" }}>
            <h3 style={{ color: "#ff6b00", fontSize: "1.5rem", marginBottom: "1.5rem", borderBottom: "2px solid #ff6b00", paddingBottom: "0.5rem" }}>
              Change Password
            </h3>
            <form onSubmit={handleSubmit}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, color: "#333" }}>Current Password</label>
              <input
                type="password"
                id="current-password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                required
                style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem", border: "1px solid #ccc", borderRadius: "0.5rem", fontSize: "1rem" }}
              />

              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, color: "#333" }}>New Password</label>
              <input
                type="password"
                id="new-password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem", border: "1px solid #ccc", borderRadius: "0.5rem", fontSize: "1rem" }}
              />
              <small style={{ display: "block", marginTop: "-0.8rem", marginBottom: "1rem", color: "#666", fontSize: "0.85rem" }}>
                Password must be at least 8 characters, include uppercase, number, special character
              </small>
              <div style={{ color: passwordStrength.includes("✅") ? "green" : passwordStrength.includes("❌") ? "red" : "#666", marginBottom: "1rem", fontSize: "0.85rem" }}>
                {passwordStrength}
              </div>

              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, color: "#333" }}>Confirm New Password</label>
              <input
                type="password"
                id="confirm-password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem", border: "1px solid #ccc", borderRadius: "0.5rem", fontSize: "1rem" }}
              />
              <div style={{ color: passwordMatch.includes("✅") ? "green" : passwordMatch.includes("❌") ? "red" : "#666", marginBottom: "1rem", fontSize: "0.85rem" }}>
                {passwordMatch}
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-md font-semibold transition"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminProfile;