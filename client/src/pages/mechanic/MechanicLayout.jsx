// client/src/pages/mechanic/MechanicLayout.jsx
import { Outlet } from 'react-router-dom';
import MechanicNavbar from './components/MechanicNavbar';
import MechanicFooter from '../components/Footer';
import './MechanicDashboard.css';

export default function MechanicLayout() {
  return (
    <div className="mechanic-layout min-h-screen flex flex-col">
      <MechanicNavbar />
      <main className="flex-grow pt-20">
        <Outlet />   {/* All mechanic pages load here with their own spinners */}
      </main>
      <MechanicFooter />
    </div>
  );
}