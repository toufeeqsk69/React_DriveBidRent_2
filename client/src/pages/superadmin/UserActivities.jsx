// client/src/pages/superadmin/UserActivities.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.util";
import LoadingSpinner from "../components/LoadingSpinner";
import superadminServices from "../../services/superadmin.services";
import {
  Users, UserPlus, Search, Filter, ChevronLeft, ChevronRight,
  X, Phone, Mail, MapPin, Calendar, Shield, ShieldCheck, ShieldAlert,
  Gavel, ShoppingCart, Car, Wrench, Eye, EyeOff, AlertCircle,
  CheckCircle, XCircle, Clock, TrendingUp, Hash, IndianRupee,
  UserCheck, UserX, Truck, Star, ChevronDown
} from "lucide-react";

/* ── tiny inline styles for the page  ── */
const styles = {
  page: {
    minHeight: "100vh",
    padding: "2rem 1.5rem",
    position: "relative",
    zIndex: 1,
    fontFamily: "'Inter', 'Montserrat', sans-serif",
  },
  /* ─── Header ─── */
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "1.75rem",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "0.75rem" },
  headerIcon: {
    width: 44, height: 44, borderRadius: 12,
    background: "linear-gradient(135deg,#f59e0b,#d97706)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 14px rgba(245,158,11,0.35)",
  },
  headerTitle: {
    fontSize: "1.75rem", fontWeight: 800, color: "#111827",
    letterSpacing: "-0.03em", lineHeight: 1.2,
  },
  headerSub: {
    fontSize: "0.875rem", color: "#6b7280", fontWeight: 500, marginTop: 2,
  },
  createBtn: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "0.625rem 1.25rem", borderRadius: 12,
    background: "linear-gradient(135deg,#f59e0b,#d97706)",
    color: "#fff", fontWeight: 700, fontSize: "0.875rem",
    border: "none", cursor: "pointer",
    boxShadow: "0 4px 14px rgba(245,158,11,0.3)",
    transition: "all 0.2s",
  },

  /* ─── Toolbar ─── */
  toolbar: {
    display: "flex", alignItems: "center", gap: "1rem",
    flexWrap: "wrap", marginBottom: "1.5rem",
    padding: "0.875rem 1.25rem", borderRadius: 16,
    background: "#fff", border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  searchWrap: {
    position: "relative", flex: "1 1 260px", minWidth: 200,
  },
  searchIcon: {
    position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
    color: "#9ca3af", pointerEvents: "none",
  },
  searchInput: {
    width: "100%", padding: "0.625rem 0.75rem 0.625rem 2.5rem",
    borderRadius: 10, border: "1px solid #e5e7eb",
    fontSize: "0.875rem", fontWeight: 500,
    outline: "none", transition: "border 0.2s",
    background: "#f9fafb",
  },
  filterWrap: {
    display: "flex", alignItems: "center", gap: 8,
    position: "relative",
  },
  filterSelect: {
    appearance: "none", padding: "0.625rem 2.25rem 0.625rem 2.25rem",
    borderRadius: 10, border: "1px solid #e5e7eb",
    fontSize: "0.875rem", fontWeight: 600,
    background: "#f9fafb", cursor: "pointer",
    outline: "none", transition: "border 0.2s",
    color: "#374151",
  },

  /* ─── Table ─── */
  tableWrap: {
    borderRadius: 16, overflow: "hidden",
    border: "1px solid #e5e7eb",
    background: "#fff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  table: {
    width: "100%", borderCollapse: "collapse",
    fontSize: "0.875rem",
  },
  th: {
    textAlign: "left", padding: "0.875rem 1.25rem",
    fontWeight: 700, fontSize: "0.75rem",
    textTransform: "uppercase", letterSpacing: "0.06em",
    color: "#6b7280", background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "0.875rem 1.25rem",
    borderBottom: "1px solid #f3f4f6",
    color: "#374151", fontWeight: 500,
    verticalAlign: "middle",
  },
  trHover: {
    cursor: "pointer",
    transition: "background 0.15s",
  },

  /* ─── Badge ─── */
  badge: (bg, color) => ({
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "0.25rem 0.625rem", borderRadius: 999,
    fontSize: "0.6875rem", fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.04em",
    background: bg, color,
    lineHeight: 1,
  }),

  /* ─── Pagination ─── */
  pagination: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0.875rem 1.25rem",
    borderTop: "1px solid #f3f4f6",
    background: "#fafbfc",
  },
  pageBtn: (disabled) => ({
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "0.5rem 1rem", borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: disabled ? "#f3f4f6" : "#fff",
    color: disabled ? "#9ca3af" : "#374151",
    fontWeight: 600, fontSize: "0.8125rem",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.15s",
    opacity: disabled ? 0.6 : 1,
  }),

  /* ─── Modal overlay ─── */
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(15,23,42,0.55)",
    backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 60, padding: "1rem",
  },

  /* ─── Detail modal ─── */
  detailModal: {
    background: "#fff", borderRadius: 20,
    width: "100%", maxWidth: 640,
    maxHeight: "90vh", overflow: "hidden",
    boxShadow: "0 25px 50px rgba(0,0,0,0.18)",
    display: "flex", flexDirection: "column",
    animation: "modalSlide 0.3s ease-out",
  },
  detailHeader: {
    padding: "1.5rem 1.75rem",
    background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",
    color: "#fff",
    position: "relative",
  },
  detailAvatar: {
    width: 52, height: 52, borderRadius: 14,
    background: "linear-gradient(135deg,#f59e0b,#d97706)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.25rem", fontWeight: 800, color: "#fff",
    boxShadow: "0 4px 14px rgba(245,158,11,0.35)",
    flexShrink: 0,
  },
  detailBody: {
    padding: "1.5rem 1.75rem",
    overflowY: "auto", flex: 1,
  },
  infoGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  infoItem: {
    display: "flex", alignItems: "flex-start", gap: 10,
  },
  infoIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  infoLabel: {
    fontSize: "0.6875rem", fontWeight: 600,
    textTransform: "uppercase", letterSpacing: "0.05em",
    color: "#9ca3af", marginBottom: 2,
  },
  infoValue: {
    fontSize: "0.9375rem", fontWeight: 700, color: "#111827",
  },

  /* ─── Activity section ─── */
  sectionTitle: {
    fontSize: "0.9375rem", fontWeight: 700, color: "#111827",
    display: "flex", alignItems: "center", gap: 8,
    marginBottom: "0.75rem", marginTop: "1.5rem",
  },
  activityCard: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0.75rem 1rem", borderRadius: 12,
    border: "1px solid #f3f4f6",
    background: "#fafbfc",
    marginBottom: "0.5rem",
    transition: "all 0.15s",
  },

  /* ─── Create admin modal ─── */
  createModal: {
    background: "#fff", borderRadius: 20,
    width: "100%", maxWidth: 460,
    overflow: "hidden",
    boxShadow: "0 25px 50px rgba(0,0,0,0.18)",
    animation: "modalSlide 0.3s ease-out",
  },
  createHeader: {
    padding: "1.5rem 1.75rem",
    background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",
    color: "#fff",
  },
  formField: {
    marginBottom: "1.25rem",
  },
  formLabel: {
    fontSize: "0.8125rem", fontWeight: 700, color: "#374151",
    marginBottom: 6, display: "flex", alignItems: "center", gap: 6,
  },
  formInput: (hasError) => ({
    width: "100%", padding: "0.6875rem 0.875rem 0.6875rem 2.75rem",
    borderRadius: 12,
    border: `1.5px solid ${hasError ? "#ef4444" : "#e5e7eb"}`,
    fontSize: "0.875rem", fontWeight: 500,
    outline: "none", transition: "border 0.2s, box-shadow 0.2s",
    background: "#fff",
  }),
  formError: {
    fontSize: "0.75rem", color: "#ef4444", fontWeight: 600,
    marginTop: 4, display: "flex", alignItems: "center", gap: 4,
  },

  /* ─── Toast ─── */
  toast: (type) => ({
    position: "fixed", top: 24, right: 24, zIndex: 100,
    display: "flex", alignItems: "center", gap: 10,
    padding: "0.875rem 1.25rem", borderRadius: 14,
    background: type === "success"
      ? "linear-gradient(135deg,#059669,#047857)"
      : "linear-gradient(135deg,#dc2626,#b91c1c)",
    color: "#fff", fontWeight: 600, fontSize: "0.875rem",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    animation: "modalSlide 0.3s ease-out",
    minWidth: 280, maxWidth: 420,
  }),
};

/* ── helper: user-type badge config ── */
const TYPE_CONFIG = {
  buyer:     { bg: "#dbeafe", color: "#1e40af", icon: ShoppingCart },
  seller:    { bg: "#dcfce7", color: "#166534", icon: TrendingUp },
  mechanic:  { bg: "#fef9c3", color: "#854d0e", icon: Wrench },
  admin:     { bg: "#fce7f3", color: "#9d174d", icon: ShieldCheck },
  driver:    { bg: "#ffedd5", color: "#9a3412", icon: Truck },
  superadmin:{ bg: "#f3e8ff", color: "#6b21a8", icon: Shield },
};

const getTypeConfig = (type) =>
  TYPE_CONFIG[type] || { bg: "#f3f4f6", color: "#374151", icon: Users };

/* ── helper: initials ── */
const getInitials = (first, last) =>
  `${(first || "?")[0]}${(last || "?")[0]}`.toUpperCase();


const UserActivities = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState('all');
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Create Admin modal state
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({ email: '', password: '', phone: '' });
  const [adminFormErrors, setAdminFormErrors] = useState({});
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  // Validation helpers
  const validateAdminForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!adminForm.email.trim()) errors.email = 'Email is required.';
    else if (!emailRegex.test(adminForm.email)) errors.email = 'Invalid email format.';
    if (!adminForm.password) errors.password = 'Password is required.';
    else if (adminForm.password.length < 8) errors.password = 'Must be at least 8 characters.';
    if (!adminForm.phone.trim()) errors.phone = 'Phone number is required.';
    else if (!/^\d{10}$/.test(adminForm.phone)) errors.phone = 'Must be exactly 10 digits.';
    return errors;
  };

  const handleAdminFormChange = (e) => {
    const { name, value } = e.target;
    setAdminForm(prev => ({ ...prev, [name]: value }));
    if (adminFormErrors[name]) {
      setAdminFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    const errors = validateAdminForm();
    if (Object.keys(errors).length > 0) {
      setAdminFormErrors(errors);
      return;
    }
    setAdminSubmitting(true);
    try {
      const res = await superadminServices.createAdmin(adminForm);
      showToast(res.message || 'Admin created successfully!', 'success');
      setShowCreateAdmin(false);
      setAdminForm({ email: '', password: '', phone: '' });
      setAdminFormErrors({});
      fetchUserActivities();
    } catch (err) {
      showToast(err.message || 'Failed to create admin.', 'error');
    } finally {
      setAdminSubmitting(false);
    }
  };

  const closeCreateAdminModal = () => {
    setShowCreateAdmin(false);
    setAdminForm({ email: '', password: '', phone: '' });
    setAdminFormErrors({});
  };

  useEffect(() => {
    fetchUserActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userType, currentPage]);

  const fetchUserActivities = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/superadmin/user-activities?userType=${userType}&page=${currentPage}&limit=20`);
      if (res.data.success) {
        setUsers(res.data.data.users);
        setPagination(res.data.data.pagination);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Failed to load user activities");
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    setDetailsLoading(true);
    try {
      const res = await axiosInstance.get(`/superadmin/user-details/${userId}`);
      if (res.data.success) {
        setUserDetails(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load user details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    fetchUserDetails(user._id);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setUserDetails(null);
  };

  /* ── search filter (client side) ── */
  const filtered = users.filter((u) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q)
    );
  });

  /* ── helper: get summary text for table ── */
  const getSummary = (user) => {
    const a = user.activityData;
    if (!a) return "—";
    if (user.userType === "buyer")
      return `${a.bidsCount || 0} bids · ${a.purchasesCount || 0} purchases · ${a.rentalsCount || 0} rentals`;
    if (user.userType === "seller")
      return `${a.auctionsCount || 0} auctions · ${a.rentalsCount || 0} rentals · ₹${(a.totalRevenue || 0).toLocaleString()}`;
    if (user.userType === "mechanic")
      return `${a.assignedTasks || 0} tasks · ${a.approved ? "Approved" : "Pending"}`;
    if (user.userType === "driver")
      return `${a.totalTrips || 0} trips`;
    if (user.userType === "admin")
      return "Platform administrator";
    return "—";
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={styles.page}>
      {/* Keyframes */}
      <style>{`
        @keyframes modalSlide {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .ua-row:hover { background: #fefce8 !important; }
        .ua-search:focus { border-color: #f59e0b !important; box-shadow: 0 0 0 3px rgba(245,158,11,0.12) !important; }
        .ua-select:focus { border-color: #f59e0b !important; box-shadow: 0 0 0 3px rgba(245,158,11,0.12) !important; }
        .ua-input:focus { border-color: #f59e0b !important; box-shadow: 0 0 0 3px rgba(245,158,11,0.12) !important; }
        .ua-create-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(245,158,11,0.4) !important; }
        .ua-page-btn:hover:not(:disabled) { background: #fefce8 !important; border-color: #f59e0b !important; }
        .ua-act-card:hover { background: #f9fafb !important; border-color: #e5e7eb !important; }
        @media (max-width: 768px) {
          .ua-table-hide { display: none !important; }
          .ua-info-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ─── Toast ─── */}
      {toast && (
        <div style={styles.toast(toast.type)}>
          {toast.type === "success"
            ? <CheckCircle size={18} />
            : <XCircle size={18} />
          }
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 2 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ─── Header ─── */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <Users size={22} color="#fff" />
          </div>
          <div>
            <h1 style={styles.headerTitle}>User Management</h1>
            <p style={styles.headerSub}>View and manage all platform users</p>
          </div>
        </div>
        <button
          id="create-admin-btn"
          className="ua-create-btn"
          style={styles.createBtn}
          onClick={() => setShowCreateAdmin(true)}
        >
          <UserPlus size={16} />
          Create Admin
        </button>
      </div>

      {/* ─── Toolbar ─── */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <Search size={16} style={styles.searchIcon} />
          <input
            className="ua-search"
            style={styles.searchInput}
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={styles.filterWrap}>
          <Filter size={15} style={{ color: "#9ca3af", position: "absolute", left: 10, zIndex: 1, pointerEvents: "none" }} />
          <ChevronDown size={14} style={{ color: "#9ca3af", position: "absolute", right: 10, zIndex: 1, pointerEvents: "none" }} />
          <select
            className="ua-select"
            style={styles.filterSelect}
            value={userType}
            onChange={(e) => { setUserType(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Users</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
            <option value="mechanic">Mechanics</option>
            <option value="driver">Drivers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "0.75rem 1rem", borderRadius: 12,
          background: "#fef2f2", color: "#991b1b",
          fontWeight: 600, marginBottom: "1rem",
          border: "1px solid #fecaca",
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* ─── Table ─── */}
      <div style={styles.tableWrap}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User</th>
                <th style={{ ...styles.th }} className="ua-table-hide">Contact</th>
                <th style={styles.th}>Role</th>
                <th style={{ ...styles.th }} className="ua-table-hide">Activity Summary</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th }} className="ua-table-hide">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...styles.td, textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
                    <Users size={32} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
                    <p style={{ fontWeight: 600 }}>No users found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const tc = getTypeConfig(user.userType);
                  const TypeIcon = tc.icon;
                  return (
                    <tr
                      key={user._id}
                      className="ua-row"
                      style={styles.trHover}
                      onClick={() => handleUserClick(user)}
                    >
                      {/* User */}
                      <td style={styles.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: `linear-gradient(135deg,${tc.bg},${tc.bg})`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 800, fontSize: "0.8125rem", color: tc.color,
                            flexShrink: 0,
                          }}>
                            {getInitials(user.firstName, user.lastName)}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, color: "#111827", fontSize: "0.9rem" }}>
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="ua-table-hide" style={{ display: "none" }}></p>
                            {/* Show email on mobile only under name */}
                            <p style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 500 }} className="">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={styles.td} className="ua-table-hide">
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7280", fontSize: "0.8125rem" }}>
                          <Phone size={13} />
                          {user.phone || "—"}
                        </div>
                      </td>

                      {/* Role badge */}
                      <td style={styles.td}>
                        <span style={styles.badge(tc.bg, tc.color)}>
                          <TypeIcon size={11} />
                          {user.userType}
                        </span>
                      </td>

                      {/* Activity */}
                      <td style={{ ...styles.td, fontSize: "0.8125rem", color: "#6b7280", maxWidth: 260 }} className="ua-table-hide">
                        {getSummary(user)}
                      </td>

                      {/* Status */}
                      <td style={styles.td}>
                        {user.isBlocked ? (
                          <span style={styles.badge("#fef2f2", "#991b1b")}>
                            <UserX size={11} />
                            Blocked
                          </span>
                        ) : (
                          <span style={styles.badge("#ecfdf5", "#065f46")}>
                            <UserCheck size={11} />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Joined */}
                      <td style={{ ...styles.td, fontSize: "0.8125rem", whiteSpace: "nowrap" }} className="ua-table-hide">
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination ─── */}
        {pagination && pagination.totalPages > 1 && (
          <div style={styles.pagination}>
            <span style={{ fontSize: "0.8125rem", color: "#6b7280", fontWeight: 500 }}>
              Page <strong style={{ color: "#111827" }}>{pagination.currentPage}</strong> of{" "}
              <strong style={{ color: "#111827" }}>{pagination.totalPages}</strong>
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="ua-page-btn"
                style={styles.pageBtn(currentPage === 1)}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                className="ua-page-btn"
                style={styles.pageBtn(currentPage === pagination.totalPages)}
                disabled={currentPage === pagination.totalPages}
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════
           USER DETAILS MODAL
         ════════════════════════════════════════════════ */}
      {selectedUser && (
        <div style={styles.overlay} onClick={closeModal}>
          <div style={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={styles.detailHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={styles.detailAvatar}>
                  {getInitials(selectedUser.firstName, selectedUser.lastName)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#fff", margin: 0 }}>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8125rem", marginTop: 2 }}>
                    {selectedUser.email}
                  </p>
                  <span style={{
                    ...styles.badge("rgba(245,158,11,0.2)", "#fbbf24"),
                    marginTop: 6,
                  }}>
                    {(() => { const TypeIcon = getTypeConfig(selectedUser.userType).icon; return <TypeIcon size={11} />; })()}
                    {selectedUser.userType}
                  </span>
                </div>
                <button
                  onClick={closeModal}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "background 0.15s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={styles.detailBody}>
              {detailsLoading ? (
                <div style={{ textAlign: "center", padding: "3rem 0" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    border: "3px solid #f3f4f6", borderTopColor: "#f59e0b",
                    animation: "spin 0.8s linear infinite",
                    margin: "0 auto",
                  }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
                  <p style={{ color: "#9ca3af", marginTop: 12, fontWeight: 500, fontSize: "0.875rem" }}>Loading details...</p>
                </div>
              ) : userDetails ? (
                <>
                  {/* ── Basic Info Grid ── */}
                  <div className="ua-info-grid" style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                      <div style={{ ...styles.infoIconWrap, background: "#eff6ff" }}>
                        <Phone size={16} color="#3b82f6" />
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Phone</p>
                        <p style={styles.infoValue}>{userDetails.user.phone || "—"}</p>
                      </div>
                    </div>
                    <div style={styles.infoItem}>
                      <div style={{ ...styles.infoIconWrap, background: "#fef3c7" }}>
                        <Calendar size={16} color="#d97706" />
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Joined</p>
                        <p style={styles.infoValue}>
                          {new Date(userDetails.user.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div style={styles.infoItem}>
                      <div style={{ ...styles.infoIconWrap, background: "#f3e8ff" }}>
                        <MapPin size={16} color="#8b5cf6" />
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Location</p>
                        <p style={styles.infoValue}>
                          {[userDetails.user.city, userDetails.user.state].filter(Boolean).join(", ") || "—"}
                        </p>
                      </div>
                    </div>
                    <div style={styles.infoItem}>
                      <div style={{ ...styles.infoIconWrap, background: userDetails.user.isBlocked ? "#fef2f2" : "#ecfdf5" }}>
                        {userDetails.user.isBlocked
                          ? <ShieldAlert size={16} color="#ef4444" />
                          : <ShieldCheck size={16} color="#059669" />
                        }
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Status</p>
                        <p style={{
                          ...styles.infoValue,
                          color: userDetails.user.isBlocked ? "#ef4444" : "#059669",
                        }}>
                          {userDetails.user.isBlocked ? "Blocked" : "Active"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── Buyer Activity ── */}
                  {userDetails.user.userType === "buyer" && (
                    <>
                      {userDetails.detailedActivity?.bids?.length > 0 && (
                        <>
                          <div style={styles.sectionTitle}>
                            <Gavel size={16} color="#3b82f6" />
                            Recent Bids
                            <span style={{
                              fontSize: "0.75rem", fontWeight: 700,
                              background: "#dbeafe", color: "#1e40af",
                              padding: "2px 8px", borderRadius: 999,
                            }}>{userDetails.detailedActivity.bids.length}</span>
                          </div>
                          {userDetails.detailedActivity.bids.slice(0, 5).map((bid) => (
                            <div key={bid._id} className="ua-act-card" style={styles.activityCard}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Gavel size={14} color="#3b82f6" />
                                </div>
                                <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#374151" }}>
                                  {bid.auctionId?.vehicleName || "Unknown Vehicle"}
                                </span>
                              </div>
                              <span style={{ fontWeight: 800, color: "#3b82f6", fontSize: "0.875rem" }}>
                                ₹{bid.bidAmount?.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </>
                      )}

                      {userDetails.detailedActivity?.purchases?.length > 0 && (
                        <>
                          <div style={styles.sectionTitle}>
                            <ShoppingCart size={16} color="#059669" />
                            Purchases
                            <span style={{
                              fontSize: "0.75rem", fontWeight: 700,
                              background: "#dcfce7", color: "#166534",
                              padding: "2px 8px", borderRadius: 999,
                            }}>{userDetails.detailedActivity.purchases.length}</span>
                          </div>
                          {userDetails.detailedActivity.purchases.slice(0, 5).map((purchase) => (
                            <div key={purchase._id} className="ua-act-card" style={styles.activityCard}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <ShoppingCart size={14} color="#059669" />
                                </div>
                                <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#374151" }}>
                                  {purchase.vehicleName}
                                </span>
                              </div>
                              <span style={{ fontWeight: 800, color: "#059669", fontSize: "0.875rem" }}>
                                ₹{purchase.purchasePrice?.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </>
                      )}

                      {userDetails.detailedActivity?.rentals?.length > 0 && (
                        <>
                          <div style={styles.sectionTitle}>
                            <Car size={16} color="#d97706" />
                            Rentals
                            <span style={{
                              fontSize: "0.75rem", fontWeight: 700,
                              background: "#fef3c7", color: "#92400e",
                              padding: "2px 8px", borderRadius: 999,
                            }}>{userDetails.detailedActivity.rentals.length}</span>
                          </div>
                          {userDetails.detailedActivity.rentals.slice(0, 5).map((rental) => (
                            <div key={rental._id} className="ua-act-card" style={styles.activityCard}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fef9c3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Car size={14} color="#d97706" />
                                </div>
                                <div>
                                  <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#374151", display: "block" }}>
                                    {rental.vehicleName || "Unknown Vehicle"}
                                  </span>
                                  <span style={{ fontSize: "0.6875rem", color: "#9ca3af" }}>
                                    {rental.status || "unavailable"}
                                    {rental.driverAvailable && " · Driver available"}
                                  </span>
                                </div>
                              </div>
                              <span style={{ fontWeight: 800, color: "#d97706", fontSize: "0.875rem" }}>
                                ₹{rental.costPerDay}/day
                              </span>
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  )}

                  {/* ── Seller Activity ── */}
                  {userDetails.user.userType === "seller" && (
                    <>
                      {userDetails.detailedActivity?.auctions?.length > 0 && (
                        <>
                          <div style={styles.sectionTitle}>
                            <Gavel size={16} color="#d97706" />
                            Auctions
                            <span style={{
                              fontSize: "0.75rem", fontWeight: 700,
                              background: "#fef3c7", color: "#92400e",
                              padding: "2px 8px", borderRadius: 999,
                            }}>{userDetails.detailedActivity.auctions.length}</span>
                          </div>
                          {userDetails.detailedActivity.auctions.slice(0, 5).map((auction) => (
                            <div key={auction._id} className="ua-act-card" style={styles.activityCard}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fef9c3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Gavel size={14} color="#d97706" />
                                </div>
                                <div>
                                  <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#374151", display: "block" }}>
                                    {auction.vehicleName}
                                  </span>
                                  <span style={{ fontSize: "0.6875rem", color: "#9ca3af" }}>
                                    {auction.status}
                                  </span>
                                </div>
                              </div>
                              <span style={{ fontWeight: 800, color: "#d97706", fontSize: "0.875rem" }}>
                                ₹{auction.currentPrice?.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </>
                      )}

                      {userDetails.detailedActivity?.rentals?.length > 0 && (
                        <>
                          <div style={styles.sectionTitle}>
                            <Car size={16} color="#3b82f6" />
                            Rental Listings
                            <span style={{
                              fontSize: "0.75rem", fontWeight: 700,
                              background: "#dbeafe", color: "#1e40af",
                              padding: "2px 8px", borderRadius: 999,
                            }}>{userDetails.detailedActivity.rentals.length}</span>
                          </div>
                          {userDetails.detailedActivity.rentals.slice(0, 5).map((rental) => (
                            <div key={rental._id} className="ua-act-card" style={styles.activityCard}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Car size={14} color="#3b82f6" />
                                </div>
                                <div>
                                  <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#374151", display: "block" }}>
                                    {rental.vehicleName}
                                  </span>
                                  <span style={{ fontSize: "0.6875rem", color: "#9ca3af" }}>
                                    {rental.status}
                                  </span>
                                </div>
                              </div>
                              <span style={{ fontWeight: 800, color: "#3b82f6", fontSize: "0.875rem" }}>
                                ₹{rental.costPerDay?.toLocaleString()}/day
                              </span>
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  )}

                  {/* ── Mechanic Activity ── */}
                  {userDetails.user.userType === "mechanic" && userDetails.detailedActivity && (
                    <>
                      <div style={styles.sectionTitle}>
                        <Wrench size={16} color="#d97706" />
                        Mechanic Details
                      </div>
                      <div className="ua-info-grid" style={{ ...styles.infoGrid, marginTop: 8 }}>
                        <div style={styles.infoItem}>
                          <div style={{ ...styles.infoIconWrap, background: "#fef3c7" }}>
                            <Hash size={16} color="#d97706" />
                          </div>
                          <div>
                            <p style={styles.infoLabel}>Assigned Tasks</p>
                            <p style={styles.infoValue}>{userDetails.detailedActivity.assignedTasks || 0}</p>
                          </div>
                        </div>
                        <div style={styles.infoItem}>
                          <div style={{ ...styles.infoIconWrap, background: userDetails.detailedActivity.approved ? "#ecfdf5" : "#fef2f2" }}>
                            {userDetails.detailedActivity.approved
                              ? <CheckCircle size={16} color="#059669" />
                              : <Clock size={16} color="#ef4444" />
                            }
                          </div>
                          <div>
                            <p style={styles.infoLabel}>Approval</p>
                            <p style={{
                              ...styles.infoValue,
                              color: userDetails.detailedActivity.approved ? "#059669" : "#ef4444",
                            }}>
                              {userDetails.detailedActivity.approved ? "Approved" : "Pending"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* No activity fallback */}
                  {!userDetails.detailedActivity && (
                    <div style={{ textAlign: "center", padding: "2rem 0", color: "#9ca3af" }}>
                      <Users size={28} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
                      <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>No detailed activity available</p>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "2rem 0", color: "#9ca3af" }}>
                  <p style={{ fontWeight: 600 }}>No details available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
           CREATE ADMIN MODAL
         ════════════════════════════════════════════════ */}
      {showCreateAdmin && (
        <div style={styles.overlay} onClick={closeCreateAdminModal}>
          <div style={styles.createModal} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={styles.createHeader}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: "linear-gradient(135deg,#f59e0b,#d97706)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
                  }}>
                    <UserPlus size={20} color="#fff" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff", margin: 0 }}>
                      Create Admin
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8125rem", margin: 0 }}>
                      Add a new administrator
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeCreateAdminModal}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateAdminSubmit} style={{ padding: "1.5rem 1.75rem" }}>
              {/* Email */}
              <div style={styles.formField}>
                <label style={styles.formLabel}>
                  <Mail size={13} color="#6b7280" /> Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                  <input
                    id="admin-email"
                    className="ua-input"
                    type="email"
                    name="email"
                    value={adminForm.email}
                    onChange={handleAdminFormChange}
                    placeholder="admin@example.com"
                    style={styles.formInput(adminFormErrors.email)}
                  />
                </div>
                {adminFormErrors.email && (
                  <p style={styles.formError}><AlertCircle size={12} /> {adminFormErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div style={styles.formField}>
                <label style={styles.formLabel}>
                  <Shield size={13} color="#6b7280" /> Password
                </label>
                <div style={{ position: "relative" }}>
                  <Shield size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                  <input
                    id="admin-password"
                    className="ua-input"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={adminForm.password}
                    onChange={handleAdminFormChange}
                    placeholder="Minimum 8 characters"
                    style={{ ...styles.formInput(adminFormErrors.password), paddingRight: "2.75rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: "#9ca3af", padding: 4,
                      display: "flex", alignItems: "center",
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {adminFormErrors.password && (
                  <p style={styles.formError}><AlertCircle size={12} /> {adminFormErrors.password}</p>
                )}
              </div>

              {/* Phone */}
              <div style={styles.formField}>
                <label style={styles.formLabel}>
                  <Phone size={13} color="#6b7280" /> Phone Number
                </label>
                <div style={{ position: "relative" }}>
                  <Phone size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                  <input
                    id="admin-phone"
                    className="ua-input"
                    type="text"
                    name="phone"
                    value={adminForm.phone}
                    onChange={handleAdminFormChange}
                    placeholder="10 digit number"
                    maxLength={10}
                    style={styles.formInput(adminFormErrors.phone)}
                  />
                </div>
                {adminFormErrors.phone && (
                  <p style={styles.formError}><AlertCircle size={12} /> {adminFormErrors.phone}</p>
                )}
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 12, marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={closeCreateAdminModal}
                  style={{
                    flex: 1, padding: "0.75rem",
                    borderRadius: 12, border: "1.5px solid #e5e7eb",
                    background: "#fff", color: "#374151",
                    fontWeight: 700, fontSize: "0.875rem",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.borderColor = "#d1d5db"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
                >
                  Cancel
                </button>
                <button
                  id="submit-create-admin"
                  type="submit"
                  disabled={adminSubmitting}
                  style={{
                    flex: 1, padding: "0.75rem",
                    borderRadius: 12, border: "none",
                    background: adminSubmitting
                      ? "#d1d5db"
                      : "linear-gradient(135deg,#f59e0b,#d97706)",
                    color: "#fff", fontWeight: 700,
                    fontSize: "0.875rem", cursor: adminSubmitting ? "not-allowed" : "pointer",
                    boxShadow: adminSubmitting ? "none" : "0 4px 14px rgba(245,158,11,0.3)",
                    transition: "all 0.15s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  {adminSubmitting ? (
                    <>
                      <div style={{
                        width: 16, height: 16, borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        animation: "spin 0.6s linear infinite",
                      }} />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Create Admin
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActivities;
