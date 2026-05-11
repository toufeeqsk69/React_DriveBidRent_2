// client/src/pages/superadmin/SuperAdminLayout.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import './SuperAdminDashboard.css';

const SuperAdminLayout = () => {
  return (
    <div className="superadmin-layout" style={{ fontWeight: '500' }}>
      <style>{`
        .superadmin-layout h1, .superadmin-layout h2, .superadmin-layout h3, .superadmin-layout h4, .superadmin-layout h5, .superadmin-layout h6 {
          font-weight: 700 !important;
        }
        .superadmin-layout label {
          font-weight: 600 !important;
        }
        .superadmin-layout button {
          font-weight: 600 !important;
        }
        .superadmin-layout .font-medium {
          font-weight: 600 !important;
        }
        .superadmin-layout .font-semibold {
          font-weight: 700 !important;
        }
        .superadmin-layout .font-bold {
          font-weight: 800 !important;
        }
        .superadmin-layout input, .superadmin-layout select, .superadmin-layout textarea {
          font-weight: 500 !important;
        }
        .superadmin-layout table th {
          font-weight: 700 !important;
        }
        .superadmin-layout table td {
          font-weight: 500 !important;
        }
      `}</style>
      <Sidebar />
      <main className="superadmin-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default SuperAdminLayout;
