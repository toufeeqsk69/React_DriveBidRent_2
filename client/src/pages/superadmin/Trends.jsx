// client/src/pages/superadmin/Trends.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.util";
import LoadingSpinner from "../components/LoadingSpinner";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Trends = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await axiosInstance.get('/superadmin/trends');
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError(res.data.message);
        }
      } catch (err) {
        setError("Failed to load trends");
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-700 mt-8">{error}</div>;

  // Prepare growth data for visualization
  const _growthData = [
    { name: 'User Signups', current: data.growth.signups.current, previous: data.growth.signups.previous, growth: parseFloat(data.growth.signups.growth) },
    { name: 'Auctions', current: data.growth.auctions.current, previous: data.growth.auctions.previous, growth: parseFloat(data.growth.auctions.growth) },
    { name: 'Rentals', current: data.growth.rentals.current, previous: data.growth.rentals.previous, growth: parseFloat(data.growth.rentals.growth) },
    { name: 'Bidding', current: data.growth.bidding.current, previous: data.growth.bidding.previous, growth: parseFloat(data.growth.bidding.growth) },
  ];

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600 bg-green-100';
    if (growth < 0) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return '↑';
    if (growth < 0) return '↓';
    return '→';
  };

  return (
    <div className="min-h-screen py-8 relative" style={{ zIndex: 1 }}>
      <section className="max-w-7xl mx-auto px-6">
        <div className="premium-page-header animate-fade-in-up">
          <h1 className="premium-page-title">Business Trends</h1>
          <p className="premium-page-subtitle">Current trends and growth metrics (Last 30 days vs Previous 30 days)</p>
        </div>

        {/* Growth Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* User Signups */}
          <div className="premium-stat-card animate-fade-in-up">
            <div className="flex items-center justify-between mb-2">
              <h3 className="premium-stat-label">User Signups</h3>
              <span className="text-2xl">{getGrowthIcon(data.growth.signups.growth)}</span>
            </div>
            <p className="premium-stat-value mb-2">{data.growth.signups.current}</p>
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getGrowthColor(data.growth.signups.growth)}`}>
              {data.growth.signups.growth > 0 ? '+' : ''}{data.growth.signups.growth}%
            </div>
            <p className="text-xs text-gray-500 mt-2">Previous: {data.growth.signups.previous}</p>
          </div>

          {/* Auctions */}
          <div className="premium-stat-card animate-fade-in-up">
            <div className="flex items-center justify-between mb-2">
              <h3 className="premium-stat-label">Auctions</h3>
              <span className="text-2xl">{getGrowthIcon(data.growth.auctions.growth)}</span>
            </div>
            <p className="text-3xl font-bold text-gradient-orange mb-2">{data.growth.auctions.current}</p>
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getGrowthColor(data.growth.auctions.growth)}`}>
              {data.growth.auctions.growth > 0 ? '+' : ''}{data.growth.auctions.growth}%
            </div>
            <p className="text-xs text-gray-500 mt-2">Previous: {data.growth.auctions.previous}</p>
          </div>

          {/* Rentals */}
          <div className="premium-stat-card animate-fade-in-up">
            <div className="flex items-center justify-between mb-2">
              <h3 className="premium-stat-label">Rentals</h3>
              <span className="text-2xl">{getGrowthIcon(data.growth.rentals.growth)}</span>
            </div>
            <p className="premium-stat-value mb-2">{data.growth.rentals.current}</p>
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getGrowthColor(data.growth.rentals.growth)}`}>
              {data.growth.rentals.growth > 0 ? '+' : ''}{data.growth.rentals.growth}%
            </div>
            <p className="text-xs text-gray-500 mt-2">Previous: {data.growth.rentals.previous}</p>
          </div>

          {/* Bidding */}
          <div className="premium-stat-card animate-fade-in-up">
            <div className="flex items-center justify-between mb-2">
              <h3 className="premium-stat-label">Bidding Activity</h3>
              <span className="text-2xl">{getGrowthIcon(data.growth.bidding.growth)}</span>
            </div>
            <p className="text-3xl font-bold text-gradient-pink mb-2">{data.growth.bidding.current}</p>
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getGrowthColor(data.growth.bidding.growth)}`}>
              {data.growth.bidding.growth > 0 ? '+' : ''}{data.growth.bidding.growth}%
            </div>
            <p className="text-xs text-gray-500 mt-2">Previous: {data.growth.bidding.previous}</p>
          </div>

          {/* Revenue */}
          <div className="premium-stat-card animate-fade-in-up">
            <div className="flex items-center justify-between mb-2">
              <h3 className="premium-stat-label">Total Revenue</h3>
              <span className="text-2xl">{getGrowthIcon(data.growth.revenue.growth)}</span>
            </div>
            <p className="text-2xl font-bold text-gradient-orange mb-2">₹{data.growth.revenue.current.toLocaleString('en-IN')}</p>
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getGrowthColor(data.growth.revenue.growth)}`}>
              {data.growth.revenue.growth > 0 ? '+' : ''}{data.growth.revenue.growth}%
            </div>
            <div className="text-xs text-gray-500 mt-2">
              <p>Auctions: ₹{data.growth.revenue.auctionCurrent.toLocaleString('en-IN')}</p>
              <p>Rentals: ₹{data.growth.revenue.rentalCurrent.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="premium-stat-card animate-fade-in-up text-center">
            <h3 className="premium-stat-label">Conversion Rate</h3>
            <p className="text-4xl font-bold text-gradient-orange">{data.conversionRate}%</p>
            <p className="text-xs text-gray-500 mt-2 font-semibold">Auctions to Purchases</p>
          </div>

          <div className="premium-stat-card animate-fade-in-up text-center">
            <h3 className="premium-stat-label">User Retention</h3>
            <p className="text-4xl font-bold text-gradient-orange">{data.retention.retentionRate}%</p>
            <p className="text-xs text-gray-500 mt-2 font-semibold">{data.retention.retainedUsers} of {data.retention.totalPreviousUsers} users</p>
          </div>

          <div className="premium-stat-card animate-fade-in-up text-center">
            <h3 className="premium-stat-label">Avg Auction Duration</h3>
            <p className="text-4xl font-bold text-gradient-pink">{data.avgAuctionDuration}</p>
            <p className="text-xs text-gray-500 mt-2 font-semibold">days</p>
          </div>
        </div>

        {/* Trending Vehicle Types */}
        <div className="premium-chart-container animate-fade-in-up mb-8">
          <div className="premium-chart-header">
            <h2 className="premium-chart-title">Trending Vehicle Types (Last 30 Days)</h2>
          </div>
          {data.trendingVehicleTypes && data.trendingVehicleTypes.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.trendingVehicleTypes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="_id" 
                  tickFormatter={(value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown'}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown'}
                />
                <Legend />
                <Bar dataKey="auctionCount" fill="#3b82f6" name="Auctions" />
                <Bar dataKey="rentalCount" fill="#f97316" name="Rentals" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No trending vehicle data available for the last 30 days</p>
            </div>
          )}
        </div>

        {/* Bidding Time Distribution */}
        <div className="premium-chart-container animate-fade-in-up">
          <div className="premium-chart-header">
            <h2 className="premium-chart-title">Bidding Activity by Hour</h2>
          </div>
          <p className="text-gray-600 mb-4 font-medium">Shows when users are most active in bidding</p>
          {data.biddingTimeDistribution && data.biddingTimeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.biddingTimeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="_id" 
                  label={{ value: 'Hour of Day (24h)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis label={{ value: 'Number of Bids', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} name="Bids" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No bidding activity data available</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Trends;
