// client/src/pages/buyer/AuctionsList.jsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import io from 'socket.io-client';
import CarCard from './components/CarCard';
import { getAuctions, getWishlist, addToWishlist, removeFromWishlist } from '../../services/buyer.services';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AuctionsList() {
  const [auctions, setAuctions] = useState([]);
  const [wishlist, setWishlist] = useState({ auctions: [], rentals: [] });
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract filters from URL
  const search = searchParams.get('search') || '';
  const condition = searchParams.get('condition') || '';
  const fuelType = searchParams.get('fuelType') || '';
  const transmission = searchParams.get('transmission') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Debounce state for real-time search
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchAuctions();
    fetchWishlist();

    // Setup Socket.io for real-time bid updates
    const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'https://drivebidrent.onrender.com';
    const socket = io(backendUrl, { withCredentials: true });

    socket.on('global_new_bid', () => {
      fetchAuctions();
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, condition, fuelType, transmission, minPrice, maxPrice]);

  const fetchAuctions = async () => {
    try {
      const filters = {
        search: debouncedSearch,
        condition,
        fuelType,
        transmission,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      };

      const result = await getAuctions(filters);
      setAuctions(result.auctions);
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const data = await getWishlist();
      setWishlist({
        auctions: data.auctions || [],
        rentals: data.rentals || []
      });
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const toggleWishlist = async (id, type) => {
    try {
      const isInWishlist = wishlist.auctions?.some(item => item._id === id);

      if (isInWishlist) {
        await removeFromWishlist(id, type);
      } else {
        await addToWishlist(id, type);
      }

      fetchWishlist();
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newParams = new URLSearchParams(searchParams);

    if (value) {
      newParams.set(name, value);
    } else {
      newParams.delete(name);
    }

    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchParams({});
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section
        className="relative h-96 md:h-[400px] bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center text-center text-white"
        style={{ backgroundImage: "url('/images/auctions-hero.jpg')", backgroundColor: '#1a1a1a' }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 px-6 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            <span className="text-orange-500">Available</span> Auctions
          </h1>
          <p className="mt-6 text-xl md:text-2xl font-medium text-gray-200">
            Find your dream car at the best price through our transparent auction system
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent" />
      </section>

      {/* Filters + Results */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-8 sticky top-24">
              <h3 className="text-2xl font-bold text-orange-600 mb-6">Filter Auctions</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Search by Name</label>
                  <input
                    type="text"
                    name="search"
                    value={search}
                    onChange={handleInputChange}
                    placeholder="e.g. Honda Civic"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Condition</label>
                  <select
                    name="condition"
                    value={condition}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Conditions</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fuel Type</label>
                  <select
                    name="fuelType"
                    value={fuelType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Types</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Transmission</label>
                  <select
                    name="transmission"
                    value={transmission}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Types</option>
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Min Price</label>
                    <input
                      type="number"
                      name="minPrice"
                      value={minPrice}
                      onChange={handleInputChange}
                      placeholder="₹0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Max Price</label>
                    <input
                      type="number"
                      name="maxPrice"
                      value={maxPrice}
                      onChange={handleInputChange}
                      placeholder="₹50L"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <button
                  onClick={resetFilters}
                  className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Auctions Grid */}
          <div className="lg:col-span-3">
            <div className="mb-8 flex justify-between items-center">
              <p className="text-xl font-semibold text-gray-700">
                {auctions.length} {auctions.length === 1 ? 'auction' : 'auctions'} found
              </p>
            </div>

            {auctions.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl">
                <p className="text-2xl text-gray-600 mb-6">No auctions found matching your criteria.</p>
                <button
                  onClick={resetFilters}
                  className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg"
                >
                  Clear Filters & Show All
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {auctions.map(auction => (
                  <CarCard
                    key={auction._id}
                    item={auction}
                    type="auction"
                    isInWishlist={wishlist.auctions?.some(item => item._id === auction._id)}
                    onToggleWishlist={() => toggleWishlist(auction._id, 'auction')}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}