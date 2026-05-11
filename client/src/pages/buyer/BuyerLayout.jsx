// client/src/pages/buyer/BuyerLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from '../components/Footer';
import './BuyerDashboard.css';

export default function BuyerLayout() {
  return (
    <div className="buyer-layout min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow relative" style={{ zIndex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}