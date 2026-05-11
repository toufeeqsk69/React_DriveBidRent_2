// client/src/pages/superadmin/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.util";
import LoadingSpinner from "../components/LoadingSpinner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#3b82f6', '#f59e0b'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axiosInstance.get('/superadmin/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError(res.data.message);
        }
      } catch (err) {
        setError("Failed to load dashboard");
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-700 mt-8">{error}</div>;

  // Prepare user counts for chart
  const userCountsData = data.userCounts.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    count: item.count
  }));

  return (
    <div className="min-h-screen py-8 relative" style={{ zIndex: 1 }}>
      <section className="max-w-7xl mx-auto px-6">
        {/* Premium Page Header */}
        <div className="premium-page-header animate-fade-in-up">
          <h1 className="premium-page-title">Business Overview</h1>
          <p className="premium-page-subtitle">Complete insights into your platform's performance</p>
        </div>

        {/* Revenue Cards - Ultra Premium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="premium-stat-card animate-fade-in-up">
            <h2 className="premium-stat-label">Total Revenue</h2>
            <p className="premium-stat-value">₹{data.revenue.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            <div className="premium-stat-details">
              <div className="premium-stat-detail-item">
                <span className="premium-stat-detail-label">Auctions:</span>
                <span className="premium-stat-detail-value">₹{data.revenue.auctions.toLocaleString('en-IN')}</span>
              </div>
              <div className="premium-stat-detail-item">
                <span className="premium-stat-detail-label">Rentals:</span>
                <span className="premium-stat-detail-value">₹{data.revenue.rentals.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="premium-stat-card animate-fade-in-up">
            <h2 className="premium-stat-label">Active Auctions</h2>
            <p className="premium-stat-value">{data.activeAuctions}</p>
            <div className="premium-stat-details">
              <div className="premium-stat-detail-item">
                <span className="premium-stat-detail-label">Total Bids:</span>
                <span className="premium-stat-detail-value">{data.totalBids}</span>
              </div>
            </div>
          </div>

          <div className="premium-stat-card animate-fade-in-up">
            <h2 className="premium-stat-label">Active Rentals</h2>
            <p className="premium-stat-value">{data.activeRentals}</p>
            <div className="premium-stat-details">
              <div className="premium-stat-detail-item">
                <span className="premium-stat-detail-label">New Users (7d):</span>
                <span className="premium-stat-detail-value">{data.recentSignups}</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Statistics - Premium Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Count Chart */}
          <div className="premium-chart-container animate-fade-in-up">
            <div className="premium-chart-header">
              <h2 className="premium-chart-title">User Distribution</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userCountsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 107, 0, 0.1)" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontWeight: 600 }} />
                <YAxis stroke="#6b7280" style={{ fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid rgba(255, 107, 0, 0.2)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    fontWeight: 600
                  }}
                />
                <Legend wrapperStyle={{ fontWeight: 600 }} />
                <Bar dataKey="count" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b35" stopOpacity={1} />
                    <stop offset="100%" stopColor="#ff8a3d" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* User Count Pie */}
          <div className="premium-chart-container animate-fade-in-up">
            <div className="premium-chart-header">
              <h2 className="premium-chart-title">User Types Breakdown</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userCountsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  style={{ fontWeight: 700 }}
                >
                  {userCountsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid rgba(255, 107, 0, 0.2)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    fontWeight: 600
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers - Ultra Premium Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Buyers */}
          <div className="premium-performer-card animate-fade-in-up">
            <div className="premium-performer-header">
              <h2 className="premium-performer-title">Top Buyers (Most Bids)</h2>
            </div>
            {data.topBuyers.length > 0 ? (
              <div className="space-y-3">
                {data.topBuyers.map((buyer, idx) => (
                  <div key={buyer._id} className="premium-performer-item">
                    <div className="premium-performer-rank">
                      {idx + 1}
                    </div>
                    <div className="premium-performer-info">
                      <p className="premium-performer-name">{buyer.name}</p>
                      <p className="premium-performer-email">{buyer.email}</p>
                    </div>
                    <div className="premium-performer-stats">
                      <p className="premium-performer-count">{buyer.bidCount}</p>
                      <p className="premium-performer-label">bids</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No buyers yet</p>
            )}
          </div>

          {/* Top Sellers */}
          <div className="premium-performer-card animate-fade-in-up">
            <div className="premium-performer-header">
              <h2 className="premium-performer-title text-gradient-pink">Top Sellers (Most Auctions)</h2>
            </div>
            {data.topSellers.length > 0 ? (
              <div className="space-y-3">
                {data.topSellers.map((seller, idx) => (
                  <div key={seller._id} className="premium-performer-item seller-variant">
                    <div className="premium-performer-rank">
                      {idx + 1}
                    </div>
                    <div className="premium-performer-info">
                      <p className="premium-performer-name">{seller.name}</p>
                      <p className="premium-performer-email">{seller.email}</p>
                    </div>
                    <div className="premium-performer-stats">
                      <p className="premium-performer-count">{seller.auctionCount}</p>
                      <p className="premium-performer-label">auctions</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No sellers yet</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
