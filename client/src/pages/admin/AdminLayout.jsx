import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from '../components/Footer';
import './AdminDashboard.css';

const AdminLayout = () => {
  return (
    <div className="admin-layout" style={{ fontWeight: '500' }}>
      <style>{`
        .admin-layout h1, .admin-layout h2, .admin-layout h3, .admin-layout h4, .admin-layout h5, .admin-layout h6 {
          font-weight: 700 !important;
        }
        .admin-layout label {
          font-weight: 600 !important;
        }
        .admin-layout button {
          font-weight: 600 !important;
        }
        .admin-layout .font-medium {
          font-weight: 600 !important;
        }
        .admin-layout .font-semibold {
          font-weight: 700 !important;
        }
        .admin-layout .font-bold {
          font-weight: 800 !important;
        }
        .admin-layout input, .admin-layout select, .admin-layout textarea {
          font-weight: 500 !important;
        }
        .admin-layout table th {
          font-weight: 700 !important;
        }
        .admin-layout table td {
          font-weight: 500 !important;
        }
      `}</style>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default AdminLayout;