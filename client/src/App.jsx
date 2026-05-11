// client/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

// === PUBLIC ROUTES ===
import HomePage from './pages/auth/HomePage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import AuctionManagerSignup from './pages/auth/auctionManagersignup';
import AuctionManagerLogin from './pages/auth/auctionManagerLogin';

// === COMPONENTS ===
import PageNotFound from './pages/components/PageNotFound';
import Footer from './pages/components/Footer';

// === ADMIN ===
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import AuctionManagers from './pages/admin/AuctionManagers';
import Analytics from './pages/admin/Analytics';
import ManageEarnings from './pages/admin/ManageEarnings';
import AdminProfile from './pages/admin/AdminProfile';

// === SUPER ADMIN ===
import SuperAdminLayout from './pages/superadmin/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import SuperAdminAnalytics from './pages/superadmin/Analytics';
import SuperAdminUserActivities from './pages/superadmin/UserActivities';
import SuperAdminRevenue from './pages/superadmin/Revenue';
import SuperAdminTrends from './pages/superadmin/Trends';
import SuperAdminProfile from './pages/superadmin/Profile';

// === BUYER ===
import BuyerLayout from './pages/buyer/BuyerLayout';
import BuyerDashboard from './pages/buyer/Dashboard';
import AuctionsList from './pages/buyer/AuctionsList';
import AuctionDetails from './pages/buyer/AuctionDetails';
import CompletedAuctionDetails from './pages/buyer/CompletedAuctionDetails';
import BidPage from './pages/buyer/BidPage';
import RentalsList from './pages/buyer/RentalsList';
import RentalDetails from './pages/buyer/RentalDetails';
import BookRental from './pages/buyer/BookRental';
import LiveAuctionRoom from './pages/buyer/LiveAuctionRoom';
import PurchasesList from './pages/buyer/PurchasesList';
import PurchaseDetails from './pages/buyer/PurchaseDetails';
import MyBids from './pages/buyer/MyBids';
import Wishlist from './pages/buyer/Wishlist';
import BuyerProfile from './pages/buyer/Profile';
import Notifications from './pages/buyer/Notifications';
import AboutUs from './pages/buyer/AboutUs';
import ChatListBuyer from './pages/buyer/ChatListBuyer';
import ChatRoomBuyer from './pages/buyer/ChatRoomBuyer';
import ChatPageBuyer from './pages/buyer/ChatPageBuyer';
import PaymentSuccess from './pages/buyer/PaymentSuccess';
import PaymentCancel from './pages/buyer/PaymentCancel';

// === SELLER ===
import SellerLayout from './pages/seller/SellerLayout';
import SellerDashboard from './pages/seller/Dashboard';
import AddAuction from './pages/seller/AddAuction';
import AddRental from './pages/seller/AddRental';
import SellerProfile from './pages/seller/Profile';
import ViewAuctions from './pages/seller/ViewAuctions';
import ViewBids from './pages/seller/ViewBids';
import ViewEarnings from './pages/seller/ViewEarnings';
import ViewRentals from './pages/seller/ViewRentals';
import UpdateRental from './pages/seller/UpdateRental';
import RentalDetailsAlt from './pages/seller/RentalDetailsAlt';
import AuctionDetailsSeller from './pages/seller/AuctionDetails';
import ChatListSeller from './pages/seller/ChatListSeller';
import ChatRoomSeller from './pages/seller/ChatRoomSeller';
import ChatPageSeller from './pages/seller/ChatPageSeller';
import InspectionChatPageSeller from './pages/seller/InspectionChatPageSeller';

// === AUCTION MANAGER ===
import AuctionManagerLayout from './pages/auctionManager/AuctionManagerLayout';
import AuctionManagerDashboard from './pages/auctionManager/Dashboard';
import ApprovedCars from './pages/auctionManager/ApprovedCars';
import AssignMechanic from './pages/auctionManager/AssignMechanic';
import ManagerProfile from './pages/auctionManager/ManagerProfile';
import PendingCarDetails from './pages/auctionManager/PendingCarDetails';
import PendingCars from './pages/auctionManager/PendingCars';
import Requests from './pages/auctionManager/Requests';
import ViewBidsPage from './pages/auctionManager/ViewBids';
import ChatPageAuctionManager from './pages/auctionManager/ChatPageAuctionManager';

// === MECHANIC ===
import MechanicLayout from './pages/mechanic/MechanicLayout';
import MechanicDashboard from './pages/mechanic/dashboard/Dashboard';
import CurrentTasks from './pages/mechanic/current-tasks/CurrentTasks';
import PastTasks from './pages/mechanic/past-tasks/PastTasks';
import PendingTasks from './pages/mechanic/pending-tasks/PendingTasks';
import CarDetails from './pages/mechanic/car-details/CarDetails';
import MechanicProfile from './pages/mechanic/profile/Profile';
import ChatPageMechanic from './pages/mechanic/ChatPageMechanic';

function App() {
  return (
    <Routes>
      {/* === LEGACY REDIRECTS === */}
      <Route path="/auctionmanager-dashboard" element={<Navigate to="/auctionmanager" replace />} />
      <Route path="/buyer-dashboard" element={<Navigate to="/buyer" replace />} />

      {/* === PUBLIC ROUTES === */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* === HIDDEN AUCTION MANAGER ROUTES === */}
      <Route path="/secret-signup" element={<AuctionManagerSignup />} />
      <Route path="/secret-login" element={<AuctionManagerLogin />} />

      {/* === ADMIN SPA === */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="manage-users" element={<ManageUsers />} />
        <Route path="auction-managers" element={<AuctionManagers />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="manage-earnings" element={<ManageEarnings />} />
        <Route path="admin-profile" element={<AdminProfile />} />
        <Route path="*" element={<PageNotFound homeRoute="/admin" />} />
      </Route>

      {/* === SUPER ADMIN SPA === */}
      <Route path="/superadmin" element={<SuperAdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="analytics" element={<SuperAdminAnalytics />} />
        <Route path="user-activities" element={<SuperAdminUserActivities />} />
        <Route path="revenue" element={<SuperAdminRevenue />} />
        <Route path="trends" element={<SuperAdminTrends />} />
        <Route path="profile" element={<SuperAdminProfile />} />
        <Route path="*" element={<PageNotFound homeRoute="/superadmin" />} />
      </Route>

      {/* === BUYER SPA === */}
      <Route path="/buyer" element={<BuyerLayout />}>
        <Route index element={<BuyerDashboard />} />
        <Route path="dashboard" element={<BuyerDashboard />} />
        <Route path="auctions" element={<AuctionsList />} />
        <Route path="auctions/:id" element={<AuctionDetails />} />
        <Route path="auctions/:id/bid" element={<BidPage />} />
        <Route path="live-auction/:id" element={<LiveAuctionRoom />} />
        <Route path="completed-auction/:id" element={<CompletedAuctionDetails />} />
        <Route path="rentals" element={<RentalsList />} />
        <Route path="rentals/:id" element={<RentalDetails />} />
        <Route path="rentals/:id/book" element={<BookRental />} />
        <Route path="purchases" element={<PurchasesList />} />
        <Route path="purchases/:id" element={<PurchaseDetails />} />
        <Route path="payment-success" element={<PaymentSuccess />} />
        <Route path="payment-cancel" element={<PaymentCancel />} />
        <Route path="my-bids" element={<MyBids />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="profile" element={<BuyerProfile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="about" element={<AboutUs />} />
        <Route path="chats" element={<ChatPageBuyer />} />
        <Route path="chats/:chatId" element={<ChatPageBuyer />} />
        <Route path="*" element={<PageNotFound homeRoute="/buyer" />} />
      </Route>

      {/* === SELLER SPA === */}
      <Route path="/seller" element={<SellerLayout />}>
        <Route index element={<SellerDashboard />} />
        <Route path="dashboard" element={<SellerDashboard />} />
        <Route path="add-auction" element={<AddAuction />} />
        <Route path="add-rental" element={<AddRental />} />
        <Route path="profile" element={<SellerProfile />} />
        <Route path="view-auctions" element={<ViewAuctions />} />
        <Route path="view-bids/:id" element={<ViewBids />} />
        <Route path="view-earnings" element={<ViewEarnings />} />
        <Route path="view-rentals" element={<ViewRentals />} />
        <Route path="update-rental/:id" element={<UpdateRental />} />
        <Route path="rental-details-alt/:id" element={<RentalDetailsAlt />} />
        <Route path="auction-details/:id" element={<AuctionDetailsSeller />} />
        <Route path="chats" element={<ChatPageSeller />} />
        <Route path="chats/:chatId" element={<ChatPageSeller />} />
        <Route path="inspection-chats/:chatId" element={<InspectionChatPageSeller />} />
        <Route path="*" element={<PageNotFound homeRoute="/seller" />} />
      </Route>

      {/* === AUCTION MANAGER SPA === */}
      <Route path="/auctionmanager" element={<AuctionManagerLayout />}>
        <Route index element={<AuctionManagerDashboard />} />
        <Route path="dashboard" element={<AuctionManagerDashboard />} />
        <Route path="requests" element={<Requests />} />
        <Route path="pending" element={<PendingCars />} />
        <Route path="pending-car-details/:id" element={<PendingCarDetails />} />
        <Route path="approved" element={<ApprovedCars />} />
        <Route path="assign-mechanic/:id" element={<AssignMechanic />} />
        <Route path="view-bids/:id" element={<ViewBidsPage />} />
        <Route path="profile" element={<ManagerProfile />} />
        <Route path="chats" element={<ChatPageAuctionManager />} />
        <Route path="chats/:chatId" element={<ChatPageAuctionManager />} />
        <Route path="*" element={<PageNotFound homeRoute="/auctionmanager" />} />
      </Route>

      {/* === MECHANIC SPA === */}
      <Route path="/mechanic" element={<MechanicLayout />}>
        <Route index element={<MechanicDashboard />} />
        <Route path="dashboard" element={<MechanicDashboard />} />
        <Route path="current-tasks" element={<CurrentTasks />} />
        <Route path="past-tasks" element={<PastTasks />} />
        <Route path="pending-tasks" element={<PendingTasks />} />
        <Route path="car-details/:id" element={<CarDetails />} />
        <Route path="profile" element={<MechanicProfile />} />
        <Route path="chats" element={<ChatPageMechanic />} />
        <Route path="chats/:chatId" element={<ChatPageMechanic />} />
        <Route path="*" element={<PageNotFound homeRoute="/mechanic" />} />
      </Route>

      {/* === 404 NOT FOUND === */}
      <Route
        path="*"
        element={(
          <div className="min-h-screen flex flex-col" style={{ background: '#0f172a', margin: 0 }}>
            <main className="flex-grow flex items-center justify-center" style={{ width: '100%', margin: 0, padding: 0 }}>
              <PageNotFound homeRoute="/" />
            </main>
            <Footer />
          </div>
        )}
      />
    </Routes>
  );
}

export default App;