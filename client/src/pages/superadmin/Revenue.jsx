// client/src/pages/superadmin/Revenue.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.util";
import LoadingSpinner from "../components/LoadingSpinner";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
const Revenue = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState('12months');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRevenue();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/superadmin/revenue?period=${period}`);
      console.log('Revenue API Response:', res.data); // Debug log
      if (res.data.success) {
        setData(res.data.data);
        console.log('Revenue data set:', res.data.data); // Debug log
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error('Revenue fetch error:', err); // Debug log
      setError("Failed to load revenue data");
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-700 mt-8">{error}</div>;

  const formatCurrencyShort = (value) => {
    const num = Number(value || 0);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
    return `₹${num.toFixed(0)}`;
  };

  return (
    <div className="min-h-screen py-8 relative" style={{ zIndex: 1 }}>
      <section className="max-w-7xl mx-auto px-6">
        <div className="premium-page-header animate-fade-in-up">
          <h1 className="premium-page-title">Revenue Analytics</h1>
          <p className="premium-page-subtitle">Complete financial insights and earnings breakdown</p>
        </div>

        {/* Period Filter */}
        <div className="premium-chart-container mb-6 flex items-center justify-center gap-4 py-3">
          <label className="font-bold text-gray-700">Period:</label>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="12months">Last 12 Months</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="premium-stat-card animate-fade-in-up">
            <h2 className="premium-stat-label">Total Revenue</h2>
            <p className="premium-stat-value">₹{data.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            <div className="premium-stat-details">
              <div className="premium-stat-detail-item">
                <span className="premium-stat-detail-label">Auctions:</span>
                <span className="premium-stat-detail-value">₹{data.auctionRevenue.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="premium-stat-detail-item">
                <span className="premium-stat-detail-label">Rentals:</span>
                <span className="premium-stat-detail-value">₹{data.rentalRevenue.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="premium-stat-card animate-fade-in-up">
            <h2 className="premium-stat-label">Total Transactions</h2>
            <p className="premium-stat-value">{(data.auctionRevenue.count + data.rentalRevenue.count).toLocaleString()}</p>
            <div className="premium-stat-details">
              <div className="premium-stat-detail-item">
                <span className="premium-stat-detail-label">Auctions:</span>
                <span className="premium-stat-detail-value">{data.auctionRevenue.count}</span>
              </div>
              <div className="premium-stat-detail-item">
                <span className="premium-stat-detail-label">Rentals:</span>
                <span className="premium-stat-detail-value">{data.rentalRevenue.count}</span>
              </div>
            </div>
          </div>

          <div className="premium-stat-card animate-fade-in-up">
            <h2 className="premium-stat-label">Platform Fees (5%)</h2>
            <p className="premium-stat-value">₹{data.platformFees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            <div className="premium-stat-details">
              <div className="premium-stat-detail-item">
                <span className="premium-stat-detail-label">Avg Transaction:</span>
                <span className="premium-stat-detail-value">₹{data.auctionRevenue.avgTransaction?.toLocaleString('en-IN') || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Revenue Chart */}
        <div className="premium-chart-container animate-fade-in-up mb-8">
          <div className="premium-chart-header">
            <h2 className="premium-chart-title">Daily Revenue Trend</h2>
          </div>
          {data.dailyRevenue && data.dailyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="_id.day" 
                  tickFormatter={(day, index) => {
                    const entry = data.dailyRevenue[index];
                    return entry ? `${entry._id.month}/${entry._id.day}` : day;
                  }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const entry = payload[0].payload;
                      return `${entry._id.year}-${entry._id.month}-${entry._id.day}`;
                    }
                    return label;
                  }}
                  formatter={(value) => `₹${value.toLocaleString()}`}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} name="Revenue" />
                <Line type="monotone" dataKey="transactions" stroke="#ec4899" strokeWidth={2} name="Transactions" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No revenue data available for this period</p>
              <p className="text-sm mt-2">Try selecting a different time period or add some completed purchases</p>
            </div>
          )}
        </div>

        {/* Top Sellers */}
        <div className="premium-chart-container animate-fade-in-up mb-8">
          <div className="premium-chart-header">
            <h2 className="premium-chart-title">Top Revenue Generating Sellers</h2>
          </div>
          {data.topSellers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-orange-200">
                    <th className="text-left py-3 px-4">Rank</th>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-right py-3 px-4">Total Revenue</th>
                    <th className="text-right py-3 px-4">Auction Revenue</th>
                    <th className="text-right py-3 px-4">Rental Revenue</th>
                    <th className="text-right py-3 px-4">Total Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topSellers.map((seller, idx) => (
                    <tr key={seller._id} className="border-b hover:bg-orange-50">
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-600 text-white rounded-full font-bold">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold">{seller.name}</td>
                      <td className="py-3 px-4 text-gray-600">{seller.email}</td>
                      <td className="py-3 px-4 text-right font-bold text-green-600">
                        ₹{seller.totalRevenue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right text-blue-600">
                        ₹{seller.auctionRevenue.toLocaleString('en-IN')}
                        <span className="text-xs block text-gray-500">({seller.auctionSales} sales)</span>
                      </td>
                      <td className="py-3 px-4 text-right text-orange-600">
                        ₹{seller.rentalRevenue.toLocaleString('en-IN')}
                        <span className="text-xs block text-gray-500">({seller.rentalSales} rentals)</span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">{seller.salesCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No sellers with revenue data available</p>
            </div>
          )}
        </div>

        {/* Revenue by Vehicle Type */}
        <div className="premium-chart-container animate-fade-in-up">
          <div className="premium-chart-header">
            <h2 className="premium-chart-title">Revenue by Vehicle Type</h2>
          </div>
          <p className="text-gray-600 mb-4 font-medium">Auction revenue split by car category</p>
          {data.revenueByVehicleType && data.revenueByVehicleType.length > 0 ? (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={data.revenueByVehicleType} margin={{ top: 12, right: 20, left: 6, bottom: 8 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <linearGradient id="countGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#f472b6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#d1d5db" />
                <XAxis
                  dataKey="_id"
                  tick={{ fill: '#4b5563', fontSize: 14, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  yAxisId="left"
                  tickFormatter={formatCurrencyShort}
                  tick={{ fill: '#7c3aed', fontSize: 12, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  width={78}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  allowDecimals={false}
                  tick={{ fill: '#db2777', fontSize: 12, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  width={42}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
                  }}
                  formatter={(value, name) =>
                    name === 'Revenue'
                      ? `₹${Number(value || 0).toLocaleString('en-IN')}`
                      : Number(value || 0).toLocaleString('en-IN')
                  }
                />
                <Legend wrapperStyle={{ paddingTop: 12, fontWeight: 600 }} />
                <Bar yAxisId="left" dataKey="revenue" fill="url(#revenueGradient)" name="Revenue" barSize={42} radius={[10, 10, 0, 0]} />
                <Bar yAxisId="right" dataKey="count" fill="url(#countGradient)" name="Count" barSize={22} radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No revenue data by vehicle type available</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Revenue;
