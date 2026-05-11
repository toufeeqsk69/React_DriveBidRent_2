import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminServices from "../../services/admin.services";
import LoadingSpinner from "../components/LoadingSpinner";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const COLORS = ['#FF6B00', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#00BCD4', '#E91E63', '#FF5722'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await adminServices.getAnalytics();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message);
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

  // Chart.js configuration options
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ₹${value.toLocaleString()}`;
          }
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            if (Number.isInteger(value)) return value;
          }
        },
        title: {
          display: true,
          text: 'Count',
          font: { size: 14, weight: 'bold' }
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: { size: 11 }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Count: ${context.parsed.y}`;
          }
        }
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message" style={{ textAlign: "center", color: "#c62828", marginTop: "2rem" }}>{error}</div>;

  return (
    <>
      <section className="py-8 max-w-7xl mx-auto px-6">
        <div className="admin-page-header">
          <h1 className="admin-page-title">
            <i className="fas fa-chart-line"></i>
            Platform Analytics
          </h1>
          <p className="admin-page-subtitle">Deep insights into user behavior and platform performance</p>
        </div>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Users', value: data.totalUsers, icon: 'fas fa-users', color: 'blue' },
            { label: 'Total Revenue', value: `₹${data.totalRevenue.toLocaleString()}`, icon: 'fas fa-rupee-sign', color: 'green' },
            { label: 'Cars Sold', value: data.totalCarsSold, icon: 'fas fa-car', color: 'orange' },
            { label: 'Active Rentals', value: data.activeRentals, icon: 'fas fa-key', color: 'purple' },
          ].map((item, i) => (
            <div key={i} className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-600 font-medium">{item.label}</h3>
                <i className={`${item.icon} text-2xl text-${item.color}-500`}></i>
              </div>
              <p className="text-3xl font-bold text-gray-800">{item.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* User Type Distribution */}
          {data.userTypeDistribution && data.userTypeDistribution.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-users text-orange-600"></i>
                User Type Distribution
              </h2>
              <div style={{ height: '300px' }}>
                <Pie 
                  data={{
                    labels: data.userTypeDistribution.map(item => item.name),
                    datasets: [{
                      data: data.userTypeDistribution.map(item => item.value),
                      backgroundColor: COLORS.slice(0, data.userTypeDistribution.length),
                      borderWidth: 2,
                      borderColor: '#fff'
                    }]
                  }}
                  options={pieOptions}
                />
              </div>
            </div>
          )}

          {/* Revenue Distribution */}
          {data.revenueDistribution && data.revenueDistribution.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-rupee-sign text-green-600"></i>
                Revenue Distribution
              </h2>
              {data.totalRevenue > 0 ? (
                <div style={{ height: '300px' }}>
                  <Pie 
                    data={{
                      labels: data.revenueDistribution.filter(item => item.value > 0).map(item => item.name),
                      datasets: [{
                        data: data.revenueDistribution.filter(item => item.value > 0).map(item => item.value),
                        backgroundColor: [COLORS[0], COLORS[1]],
                        borderWidth: 2,
                        borderColor: '#fff'
                      }]
                    }}
                    options={revenueOptions}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <div className="text-center">
                    <i className="fas fa-chart-pie text-6xl mb-4 opacity-20"></i>
                    <p>No revenue data available yet</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Car Type Distribution */}
          {data.carTypeDistribution && data.carTypeDistribution.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-car text-blue-600"></i>
                Car Type Distribution
              </h2>
              <div style={{ height: '300px' }}>
                <Pie 
                  data={{
                    labels: data.carTypeDistribution.map(item => item.name),
                    datasets: [{
                      data: data.carTypeDistribution.map(item => item.value),
                      backgroundColor: COLORS.slice(0, data.carTypeDistribution.length),
                      borderWidth: 2,
                      borderColor: '#fff'
                    }]
                  }}
                  options={pieOptions}
                />
              </div>
            </div>
          )}

          {/* Auction Status Distribution */}
          {data.auctionStatusDistribution && data.auctionStatusDistribution.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-gavel text-purple-600"></i>
                Auction Status
              </h2>
              <div style={{ height: '300px' }}>
                <Pie 
                  data={{
                    labels: data.auctionStatusDistribution.map(item => item.name),
                    datasets: [{
                      data: data.auctionStatusDistribution.map(item => item.value),
                      backgroundColor: COLORS.slice(0, data.auctionStatusDistribution.length),
                      borderWidth: 2,
                      borderColor: '#fff'
                    }]
                  }}
                  options={pieOptions}
                />
              </div>
            </div>
          )}
        </div>

        {/* Car Model Distribution Bar Chart */}
        {data.carModelDistribution && data.carModelDistribution.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-chart-bar text-orange-600"></i>
              Top 10 Car Models Listed
            </h2>
            <div style={{ height: '400px' }}>
              <Bar 
                data={{
                  labels: data.carModelDistribution.map(item => item.name),
                  datasets: [{
                    label: 'Count',
                    data: data.carModelDistribution.map(item => item.value),
                    backgroundColor: COLORS[0],
                    borderColor: COLORS[0],
                    borderWidth: 1
                  }]
                }}
                options={barOptions}
              />
            </div>
          </div>
        )}

        {/* Top Sellers */}
        {data.topSellers && data.topSellers.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-trophy text-yellow-500"></i>
              Top Sellers (Auction Listings)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <tr>
                    <th className="p-3 text-left">Rank</th>
                    <th className="p-3 text-left">Seller Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Cars Listed</th>
                    <th className="p-3 text-left">Cars Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topSellers.map((seller, i) => (
                    <tr key={i} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-orange-50 transition`}>
                      <td className="p-3 border-b">
                        <span className="font-bold text-orange-600">#{i + 1}</span>
                      </td>
                      <td className="p-3 border-b font-medium">{seller.name}</td>
                      <td className="p-3 border-b text-gray-600">{seller.email}</td>
                      <td className="p-3 border-b">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {seller.totalCarsListed}
                        </span>
                      </td>
                      <td className="p-3 border-b">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {seller.carsSold}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Rental Providers */}
        {data.topRentalProviders && data.topRentalProviders.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-key text-purple-500"></i>
              Top Rental Providers
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <tr>
                    <th className="p-3 text-left">Rank</th>
                    <th className="p-3 text-left">Provider Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Rentals Listed</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topRentalProviders.map((provider, i) => (
                    <tr key={i} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-purple-50 transition`}>
                      <td className="p-3 border-b">
                        <span className="font-bold text-purple-600">#{i + 1}</span>
                      </td>
                      <td className="p-3 border-b font-medium">{provider.name}</td>
                      <td className="p-3 border-b text-gray-600">{provider.email}</td>
                      <td className="p-3 border-b">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          {provider.totalRentalsListed}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Buyers */}
        {data.topBuyers && data.topBuyers.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-shopping-cart text-green-500"></i>
              Top Buyers (Auction Purchases)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <tr>
                    <th className="p-3 text-left">Rank</th>
                    <th className="p-3 text-left">Buyer Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Total Purchases</th>
                    <th className="p-3 text-left">Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topBuyers.map((buyer, i) => (
                    <tr key={i} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-green-50 transition`}>
                      <td className="p-3 border-b">
                        <span className="font-bold text-green-600">#{i + 1}</span>
                      </td>
                      <td className="p-3 border-b font-medium">{buyer.name}</td>
                      <td className="p-3 border-b text-gray-600">{buyer.email}</td>
                      <td className="p-3 border-b">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {buyer.totalPurchases}
                        </span>
                      </td>
                      <td className="p-3 border-b font-semibold text-green-700">
                        ₹{buyer.totalSpent.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Renters */}
        {data.topRenters && data.topRenters.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-users text-blue-500"></i>
              Top Renters
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <tr>
                    <th className="p-3 text-left">Rank</th>
                    <th className="p-3 text-left">Renter Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Total Rentals</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topRenters.map((renter, i) => (
                    <tr key={i} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition`}>
                      <td className="p-3 border-b">
                        <span className="font-bold text-blue-600">#{i + 1}</span>
                      </td>
                      <td className="p-3 border-b font-medium">{renter.name}</td>
                      <td className="p-3 border-b text-gray-600">{renter.email}</td>
                      <td className="p-3 border-b">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {renter.totalRentals}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vehicle Sales Performance */}
        {data.vehiclePerformance && data.vehiclePerformance.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-chart-line text-orange-600"></i>
              Top 10 Vehicle Sales Performance
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <tr>
                    <th className="p-3 text-left">Rank</th>
                    <th className="p-3 text-left">Vehicle Name</th>
                    <th className="p-3 text-left">Starting Price</th>
                    <th className="p-3 text-left">Final Sale Price</th>
                    <th className="p-3 text-left">Increase</th>
                  </tr>
                </thead>
                <tbody>
                  {data.vehiclePerformance.map((vehicle, i) => {
                    const increase = ((vehicle.finalSalePrice - vehicle.startingPrice) / vehicle.startingPrice * 100).toFixed(1);
                    return (
                      <tr key={i} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-orange-50 transition`}>
                        <td className="p-3 border-b">
                          <span className="font-bold text-orange-600">#{i + 1}</span>
                        </td>
                        <td className="p-3 border-b font-medium">{vehicle.vehicleName}</td>
                        <td className="p-3 border-b">₹{vehicle.startingPrice.toLocaleString()}</td>
                        <td className="p-3 border-b font-semibold text-green-700">
                          ₹{vehicle.finalSalePrice.toLocaleString()}
                        </td>
                        <td className="p-3 border-b">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            increase > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {increase > 0 ? '+' : ''}{increase}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default Analytics;