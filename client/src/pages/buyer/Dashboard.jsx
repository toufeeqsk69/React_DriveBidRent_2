import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import io from 'socket.io-client';
import {
  getDashboardData,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../../services/buyer.services";
import CarCard from "./components/CarCard";
import HeroSlider from "./components/HeroSlider";
import LoadingSpinner from "../components/LoadingSpinner";
import { ChevronRight, LayoutGrid } from "lucide-react";

const Dashboard = () => {
  const [featuredAuctions, setFeaturedAuctions] = useState([]);
  const [featuredRentals, setFeaturedRentals] = useState([]);
  const [wishlist, setWishlist] = useState({ auctions: [], rentals: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        const [dash, wl] = await Promise.all([
          getDashboardData(),
          getWishlist(),
        ]);
        
        setFeaturedAuctions(dash.featuredAuctions || []);
        setFeaturedRentals(dash.featuredRentals || []);
        
        const auctionIds = (wl.auctions || []).map((a) => a._id || a);
        const rentalIds = (wl.rentals || []).map((r) => r._id || r);
        setWishlist({ auctions: auctionIds, rentals: rentalIds });
      } catch (err) {
        console.error("Dashboard failed to load:", err);
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    loadData(true);
    
    // Setup Socket.io for real-time bid updates
    const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'https://drivebidrent.onrender.com';
    const socket = io(backendUrl, { withCredentials: true });
    
    socket.on('global_new_bid', () => {
      loadData(false);
    });
    
    return () => socket.disconnect();
  }, []);

  const handleWishlistToggle = async (id, type) => {
    const key = type === "auction" ? "auctions" : "rentals";
    const isLiked = wishlist[key].includes(id);
    try {
      if (isLiked) {
        await removeFromWishlist(id, type);
        setWishlist((prev) => ({ 
          ...prev, 
          [key]: prev[key].filter((x) => x !== id) 
        }));
      } else {
        await addToWishlist(id, type);
        setWishlist((prev) => ({ 
          ...prev, 
          [key]: [...prev[key], id] 
        }));
      }
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white min-h-screen">
      <HeroSlider />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-12">
        
        <section className="py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                <span className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-ping" />
                Live Opportunities
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-none">
                Featured <span className="text-orange-500 italic">Auctions</span>
              </h2>
            </div>
            <Link
              to="/buyer/auctions"
              className="group flex items-center gap-2 text-gray-900 font-black text-sm uppercase tracking-wider hover:text-orange-600 transition-all border-b-2 border-transparent hover:border-orange-500 pb-1"
            >
              View all listings
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {featuredAuctions.length === 0 ? (
            <EmptyState message="No auctions available right now." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-6 rounded-3xl bg-gradient-to-br from-orange-50/30 via-white to-gray-50/50 shadow-xl shadow-gray-100/50 border border-gray-100/50">
              {featuredAuctions.map((auction) => (
                <CarCard
                  key={auction._id}
                  item={auction}
                  type="auction"
                  isInWishlist={wishlist.auctions.includes(auction._id)}
                  onToggleWishlist={() => handleWishlistToggle(auction._id, "auction")}
                />
              ))}
            </div>
          )}
        </section>

        <div className="max-w-4xl mx-auto h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent my-2" />

        <section className="py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                Available Rentals
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-none">
                Elite <span className="text-orange-500 italic">Rentals</span>
              </h2>
            </div>
            <Link
              to="/buyer/rentals"
              className="group flex items-center gap-2 text-gray-900 font-black text-sm uppercase tracking-wider hover:text-orange-600 transition-all border-b-2 border-transparent hover:border-orange-500 pb-1"
            >
              See all rentals
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {featuredRentals.length === 0 ? (
            <EmptyState message="No rentals available right now." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-6 rounded-3xl bg-gradient-to-br from-blue-50/30 via-white to-gray-50/50 shadow-xl shadow-gray-100/50 border border-gray-100/50">
              {featuredRentals.slice(0, 8).map((rental) => (
                <CarCard
                  key={rental._id}
                  item={rental}
                  type="rental"
                  returnPath="/buyer"
                  isInWishlist={wishlist.rentals.includes(rental._id)}
                  onToggleWishlist={() => handleWishlistToggle(rental._id, "rental")}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-24 px-6 rounded-[3rem] bg-gray-50 border-2 border-dashed border-gray-200">
    <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-sm mb-6">
      <LayoutGrid className="text-gray-200 w-10 h-10" />
    </div>
    <h3 className="text-2xl font-black text-gray-900 mb-2">Inventory Empty</h3>
    <p className="text-gray-400 text-center max-w-xs font-medium">{message}</p>
  </div>
);

export default Dashboard;