import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminServices from "../../services/admin.services";
import LoadingSpinner from "../components/LoadingSpinner";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

const ManageEarnings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState('monthly'); // 'daily' or 'monthly'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await adminServices.getManageEarnings();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError("Failed to load earnings");
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, [navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-700 mt-8">{error}</div>;

  // Separate auction and rental transactions
  const auctionTransactions = data.transactions.filter(t => t.type === 'Auction');
  const rentalTransactions = data.transactions.filter(t => t.type === 'Rental');

  // Chart data for earnings trend
  const earningsData = selectedPeriod === 'monthly' ? data.monthlyEarnings : data.dailyEarnings;
  const chartData = {
    labels: earningsData.map(e => selectedPeriod === 'monthly' ? e.month : e.date),
    datasets: [
      {
        label: 'Rental Revenue',
        data: earningsData.map(e => e.rentalRevenue),
        backgroundColor: '#9C27B0',
        borderColor: '#9C27B0',
        borderWidth: 2,
        fill: false,
      },
      {
        label: 'Auction Revenue',
        data: earningsData.map(e => e.auctionRevenue),
        backgroundColor: '#FF6B00',
        borderColor: '#FF6B00',
        borderWidth: 2,
        fill: false,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString('en-IN')}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        }
      }
    }
  };

  // Revenue source pie chart
  const pieData = {
    labels: ['Rental Revenue', 'Auction Revenue'],
    datasets: [{
      data: [data.totalRentalRevenue, data.totalAuctionRevenue],
      backgroundColor: ['#9C27B0', '#FF6B00'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ₹${context.parsed.toLocaleString('en-IN')} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <>
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="admin-page-header">
          <h1 className="admin-page-title">
            <i className="fas fa-chart-line"></i>
            Earnings Analytics
          </h1>
          <p className="admin-page-subtitle">Track and manage your platform revenue from auctions and rentals</p>
        </div>

        {/* Revenue Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="admin-stat-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="admin-stat-label">Total Revenue</h3>
              <i className="fas fa-rupee-sign text-2xl text-green-500"></i>
            </div>
            <p className="admin-stat-value text-green-500">₹{data.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p className="text-xs mt-2 text-gray-600">{data.stats.totalTransactions} transactions</p>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="admin-stat-label">Auction Revenue</h3>
              <i className="fas fa-gavel text-2xl text-orange-500"></i>
            </div>
            <p className="admin-stat-value text-orange-500">₹{data.totalAuctionRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p className="text-xs mt-2 text-gray-600">{data.stats.totalAuctionTransactions} auctions</p>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="admin-stat-label">Rental Revenue</h3>
              <i className="fas fa-key text-2xl text-purple-500"></i>
            </div>
            <p className="admin-stat-value text-purple-500">₹{data.totalRentalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p className="text-xs mt-2 text-gray-600">{data.stats.totalRentalTransactions} rentals</p>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="admin-stat-label">Avg Transaction</h3>
              <i className="fas fa-chart-bar text-2xl text-blue-500"></i>
            </div>
            <p className="admin-stat-value text-blue-500">₹{data.stats.averageTransactionValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p className="text-xs mt-2 text-gray-600">Per transaction avg</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Trend Chart */}
          <div className="lg:col-span-2 admin-section mb-0">
            <div className="admin-section-header">
              <h2 className="admin-section-title text-xl flex items-center gap-2">
                <i className="fas fa-chart-line text-orange-600"></i>
                Revenue Trend
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPeriod('daily')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedPeriod === 'daily'
                      ? 'admin-btn-primary'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  Daily (30 days)
                </button>
                <button
                  onClick={() => setSelectedPeriod('monthly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedPeriod === 'monthly'
                      ? 'admin-btn-primary'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  Monthly (12 months)
                </button>
              </div>
            </div>
            <div style={{ height: '300px' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Revenue Source Pie Chart */}
          <div className="admin-section mb-0">
            <div className="admin-section-header">
              <h2 className="admin-section-title text-xl flex items-center gap-2">
                <i className="fas fa-chart-pie text-orange-600"></i>
                Revenue Sources
              </h2>
            </div>
            <div style={{ height: '300px' }}>
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>
        </div>

        {/* Auction Transactions Table */}
        <div className="admin-section mb-8">
          <div className="admin-section-header">
            <h2 className="admin-section-title text-xl flex items-center gap-2">
              <i className="fas fa-gavel mr-3"></i>
              Auction Transactions ({auctionTransactions.length})
            </h2>
            <div className="admin-badge admin-badge-primary">
              Platform Fee: 1%
            </div>
          </div>

          {auctionTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left table-fixed border-collapse">
                <thead className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <tr>
                    <th className="w-1/6 p-3 text-xs font-semibold uppercase">Date</th>
                    <th className="w-1/6 p-3 text-xs font-semibold uppercase">Vehicle</th>
                    <th className="w-1/6 p-3 text-xs font-semibold uppercase">Seller</th>
                    <th className="w-1/6 p-3 text-xs font-semibold uppercase">Buyer</th>
                    <th className="w-1/6 p-3 text-xs font-semibold uppercase">Sale Price</th>
                    <th className="w-1/6 p-3 text-xs font-semibold uppercase">Platform Fee (1%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {auctionTransactions.map((transaction, i) => (
                    <tr key={transaction.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-orange-50 transition before:hidden`}>
                      <td className="p-3 text-sm text-gray-700">
                        {new Date(transaction.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-3 text-sm">
                        <div className="font-medium text-gray-900">{transaction.vehicleName}</div>
                        <div className="text-gray-500 text-xs">{transaction.carType}</div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="font-medium text-gray-900">{transaction.sellerName}</div>
                        <div className="text-gray-500 text-xs">{transaction.sellerEmail}</div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="font-medium text-gray-900">{transaction.buyerName}</div>
                        <div className="text-gray-500 text-xs">{transaction.buyerEmail}</div>
                      </td>
                      <td className="p-3 text-sm font-bold text-gray-900">
                        ₹{transaction.salePrice.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-sm font-bold text-gray-900">
                        ₹{transaction.platformRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        <span className="text-xs text-gray-500 ml-1">(1%)</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-600">No auction transactions found.</p>
            </div>
          )}
        </div>

        {/* Rental Transactions Table */}
        <div className="admin-section mb-8">
          <div className="admin-section-header">
            <h2 className="admin-section-title text-xl flex items-center gap-2">
              <i className="fas fa-key mr-3"></i>
              Rental Transactions ({rentalTransactions.length})
            </h2>
            <div className="admin-badge admin-badge-primary">
              Platform Revenue: Full Rental Cost
            </div>
          </div>

          {rentalTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left table-fixed border-collapse">
                <thead className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <tr>
                    <th className="w-1/5 p-3 text-xs font-semibold uppercase">Date</th>
                    <th className="w-1/5 p-3 text-xs font-semibold uppercase">Vehicle</th>
                    <th className="w-1/5 p-3 text-xs font-semibold uppercase">Seller</th>
                    <th className="w-1/5 p-3 text-xs font-semibold uppercase">Renter</th>
                    <th className="w-1/5 p-3 text-xs font-semibold uppercase">Platform Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rentalTransactions.map((transaction, i) => (
                    <tr key={transaction.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-orange-50 transition before:hidden`}>
                      <td className="p-3 text-sm text-gray-700">
                        {new Date(transaction.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-3 text-sm">
                        <div className="font-medium text-gray-900">{transaction.vehicleName}</div>
                        <div className="text-gray-500 text-xs">{transaction.carType}</div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="font-medium text-gray-900">{transaction.sellerName}</div>
                        <div className="text-gray-500 text-xs">{transaction.sellerEmail}</div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="font-medium text-gray-900">{transaction.buyerName}</div>
                        <div className="text-gray-500 text-xs">{transaction.buyerEmail}</div>
                      </td>
                      <td className="p-3 text-sm font-bold text-gray-900">
                        ₹{transaction.platformRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-600">No rental transactions found.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ManageEarnings;
