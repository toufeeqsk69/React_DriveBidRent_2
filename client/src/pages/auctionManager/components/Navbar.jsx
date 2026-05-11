// client/src/pages/auctionManager/components/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../../redux/slices/authSlice';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentPath = location.pathname;

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  const isActive = (path) => currentPath.includes(path);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm font-montserrat">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <Link
            to="/auctionmanager/dashboard"
            className="text-2xl font-black tracking-tight flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center group-hover:bg-amber-500 transition-colors duration-300 shadow-sm">
              <span className="text-xl font-black">D</span>
            </div>
            <span className="text-gray-900">
              Drive<span className="text-amber-500">Bid</span>Rent
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            {[
              { path: '/dashboard', label: 'Dashboard' },
              { path: '/requests', label: 'Requests' },
              { path: '/pending', label: 'Pending Cars' },
              { path: '/approved', label: 'Approved Cars' },
              { path: '/chats', label: 'Chats' },
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={`/auctionmanager${path}`}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${isActive(path)
                    ? 'bg-amber-50 text-amber-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/auctionmanager/profile"
              className={`p-2.5 rounded-xl transition-all duration-300 ${isActive('/profile')
                  ? 'bg-amber-50 text-amber-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              title="Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-gray-900 hover:bg-amber-500 text-white rounded-xl text-sm font-bold transition duration-300 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <span>Logout</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}