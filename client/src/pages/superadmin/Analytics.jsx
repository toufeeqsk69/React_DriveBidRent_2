// client/src/pages/superadmin/Analytics.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.util";
import LoadingSpinner from "../components/LoadingSpinner";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#14b8a6'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axiosInstance.get('/superadmin/analytics');
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError(res.data.message);
        }
      } catch (err) {
        setError("Failed to load analytics");
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-700 mt-8">{error}</div>;

  const peakHoursData = (data.peakHours || [])
    .filter(item => item && item._id !== null && item._id !== undefined)
    .map(item => ({
      ...item,
      hourLabel: `${String(item._id).padStart(2, '0')}:00`
    }));

  return (
    <div className="min-h-screen py-8 relative" style={{ zIndex: 1 }}>
      <section className="max-w-7xl mx-auto px-6">
        <div className="premium-page-header animate-fade-in-up">
          <h1 className="premium-page-title">Detailed Analytics</h1>
          <p className="premium-page-subtitle">Comprehensive business intelligence and trends</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="premium-stat-card animate-fade-in-up text-center">
            <h3 className="premium-stat-label">Auction Success Rate</h3>
            <p className="premium-stat-value">{data.auctionSuccessRate}%</p>
          </div>
          <div className="premium-stat-card animate-fade-in-up text-center">
            <h3 className="premium-stat-label">Avg Bids/Auction</h3>
            <p className="premium-stat-value text-gradient-pink">{data.avgBidsPerAuction}</p>
          </div>
          <div className="premium-stat-card animate-fade-in-up text-center">
            <h3 className="premium-stat-label">Revenue Trends</h3>
            <p className="text-3xl font-bold text-gradient-orange">{data.revenueTrends.length}</p>
            <p className="text-xs text-gray-500 mt-2 font-semibold">months data</p>
          </div>
          <div className="premium-stat-card animate-fade-in-up text-center">
            <h3 className="premium-stat-label">User Growth</h3>
            <p className="text-3xl font-bold text-gradient-orange">{data.userGrowth.length}</p>
            <p className="text-xs text-gray-500 mt-2 font-semibold">months data</p>
          </div>
        </div>

        {/* Revenue Trends Chart */}
        <div className="premium-chart-container animate-fade-in-up mb-8">
          <div className="premium-chart-header">
            <h2 className="premium-chart-title">Revenue Trends (Last 12 Months)</h2>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.revenueTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id.month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Revenue (₹)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} name="Total Revenue" />
              <Line type="monotone" dataKey="auctionRevenue" stroke="#3b82f6" strokeWidth={2} name="Auction Revenue" />
              <Line type="monotone" dataKey="rentalRevenue" stroke="#f97316" strokeWidth={2} name="Rental Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Vehicle Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="premium-chart-container animate-fade-in-up">
            <div className="premium-chart-header">
              <h2 className="premium-chart-title">Popular Vehicle Types</h2>
            </div>
            {data.popularVehicleTypes && data.popularVehicleTypes.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.popularVehicleTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ _id, count }) => `${_id || 'Unknown'}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="_id"
                  >
                    {data.popularVehicleTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No vehicle type data available</p>
              </div>
            )}
          </div>

          {/* Average Price by Type */}
          <div className="premium-chart-container animate-fade-in-up">
            <div className="premium-chart-header">
              <h2 className="premium-chart-title">Avg Price by Vehicle Type</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.avgPriceByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="avgPrice" fill="#8b5cf6" name="Avg Price" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="premium-chart-container animate-fade-in-up mb-8">
          <div className="premium-chart-header">
            <h2 className="premium-chart-title">Geographic Distribution (Top 10 States)</h2>
          </div>
          {data.geographicDistribution && data.geographicDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.geographicDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="_id" 
                  type="category" 
                  width={120}
                  tickFormatter={(value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown'}
                />
                <Tooltip 
                  formatter={(value, _name, props) => [value, 'Users']}
                  labelFormatter={(value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown'}
                />
                <Legend />
                <Bar dataKey="count" fill="#ec4899" name="User Count" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No geographic distribution data available</p>
            </div>
          )}
        </div>

        {/* Peak Activity Hours */}
        <div className="premium-chart-container animate-fade-in-up">
          <div className="premium-chart-header">
            <h2 className="premium-chart-title">Peak Bidding Hours</h2>
          </div>
          {peakHoursData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hourLabel" label={{ value: 'Hour of Day (24h)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Bid Count', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="bidCount" fill="#10b981" name="Bids" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No peak bidding hour data available</p>
            </div>
          )}
        </div>

      </section>
    </div>
  );
};

export default Analytics;
