import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Gavel, 
  Users, 
  Wind, 
  Heart, 
  Calendar, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Info,
  Clock
} from 'lucide-react';

export default function CarCard({ item, type, isInWishlist, onToggleWishlist, returnPath }) {
  const isAuction = type === "auction";
  const detailsLink = isAuction ? `/buyer/auctions/${item._id}` : `/buyer/rentals/${item._id}`;
  const theme = isAuction
    ? {
        cardBorder: 'border-amber-200 hover:border-amber-400',
        cardBg: 'bg-amber-50/30',
        badgeBg: 'bg-amber-500',
        badgeShadow: 'shadow-amber-200',
        titleHover: 'group-hover:text-amber-600',
        mutedText: 'text-slate-600',
        specBg: 'bg-amber-50/60',
        specBorder: 'border-amber-100',
        priceLabel: 'text-slate-500',
        priceText: 'text-slate-900',
        detailsBtn: 'text-slate-700 border-slate-300 hover:bg-amber-50 hover:border-amber-300',
        wishlistActive: 'bg-amber-500 text-white shadow-lg shadow-amber-200',
        primaryBtn: 'bg-slate-900 hover:bg-amber-600 shadow-amber-100',
      }
    : {
        cardBorder: 'border-sky-200 hover:border-sky-400',
        cardBg: 'bg-sky-50/30',
        badgeBg: 'bg-sky-600',
        badgeShadow: 'shadow-sky-200',
        titleHover: 'group-hover:text-sky-700',
        mutedText: 'text-slate-600',
        specBg: 'bg-sky-50/60',
        specBorder: 'border-sky-100',
        priceLabel: 'text-slate-500',
        priceText: 'text-slate-900',
        detailsBtn: 'text-slate-700 border-slate-300 hover:bg-sky-50 hover:border-sky-300',
        wishlistActive: 'bg-sky-600 text-white shadow-lg shadow-sky-200',
        primaryBtn: 'bg-sky-600 hover:bg-sky-700 shadow-sky-100',
      };
  
  const rentActionState = !isAuction ? {
    ...(returnPath ? { from: returnPath } : {}),
    openRentModal: true
  } : undefined;

  const currentBid = isAuction ? (Number(item.currentHighestBid ?? item.startingBid) || 0) : 0;

  return (
    <div className={`group relative ${theme.cardBg} rounded-[2rem] overflow-hidden border-2 ${theme.cardBorder} shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full`}>
      
      {/* Dynamic Status Badge */}
      <div className="absolute top-5 left-5 z-10">
        {isAuction ? (
          <div className={`text-white px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg ${theme.badgeBg} ${theme.badgeShadow}`}>
            Live Auction
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-slate-800 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border border-sky-200 shadow-sm">
            <Clock size={12} className="text-sky-600" />
            Available Now
          </div>
        )}
      </div>

      {/* Premium Wishlist Toggle */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onToggleWishlist();
        }}
        className={`absolute top-5 right-5 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md ${
          isInWishlist 
            ? theme.wishlistActive
            : "bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm"
        }`}
      >
        <Heart size={20} fill={isInWishlist ? "currentColor" : "none"} />
      </button>

      {/* Image Container */}
      <div className="relative bg-white/60 p-3 pb-0">
        <div className="relative h-52 overflow-hidden rounded-2xl bg-slate-100">
          <img
            src={item.vehicleImage}
            alt={item.vehicleName}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </div>

        {/* Content Section */}
        <div className="p-7 flex flex-col flex-grow">
          <div className="mb-4">
            <div className="flex justify-between items-start gap-2">
              <h3 className={`text-2xl font-black text-slate-900 line-clamp-1 ${theme.titleHover} transition-colors`}>
                {item.vehicleName} {item.year && `(${item.year})`}
              </h3>
            </div>
            {isAuction ? (
              <p className={`text-sm font-medium mt-1 ${theme.mutedText}`}>
                Ends {new Date(item.auctionDate).toLocaleDateString()}
              </p>
            ) : (
              <div className={`flex items-center gap-2 mt-1 text-sm font-medium ${theme.mutedText}`}>
                <Info size={14} className="text-sky-500" />
                <span>Standard Rental</span>
              </div>
            )}
          </div>

          {/* Specs Grid */}
          {isAuction ? (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className={`p-3 rounded-2xl border ${theme.specBg} ${theme.specBorder}`}>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Fuel Type</p>
                <p className="text-sm font-extrabold text-slate-800 capitalize">{item.fuelType || 'Petrol'}</p>
              </div>
              <div className={`p-3 rounded-2xl border ${theme.specBg} ${theme.specBorder}`}>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Accident History</p>
                <p className={`text-sm font-extrabold capitalize ${item.vehicleDocumentation?.accidentHistory === 'no' ? 'text-green-700' : 'text-orange-700'}`}>
                  {item.vehicleDocumentation?.accidentHistory === 'no' ? 'No Accidents' : 'Has History'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className={`p-3 rounded-2xl border ${theme.specBg} ${theme.specBorder}`}>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Year</p>
                <p className="text-sm font-extrabold text-slate-800">{item.year}</p>
              </div>
              <div className={`p-3 rounded-2xl border ${theme.specBg} ${theme.specBorder}`}>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Capacity</p>
                <div className="flex items-center gap-1.5 text-sm font-extrabold text-slate-800">
                  <Users size={14} />
                  <span>{item.capacity} Seats</span>
                </div>
              </div>
            </div>
          )}


        {/* Pricing & Actions */}
        <div className="mt-auto pt-3 border-t border-slate-200/70">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${theme.priceLabel}`}>
                {isAuction ? "Current Highest Bid" : "Starting At"}
              </p>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black tracking-tight ${theme.priceText}`}>
                  ₹{isAuction ? currentBid.toLocaleString() : Number(item.costPerDay).toLocaleString()}
                </span>
                {!isAuction && <span className="text-slate-500 text-sm font-bold">/day</span>}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to={detailsLink}
              className={`flex-1 flex items-center justify-center font-bold text-sm py-4 rounded-2xl border transition-colors ${theme.detailsBtn}`}
            >
              Details
            </Link>
            <Link
              to={detailsLink}
              state={isAuction ? undefined : rentActionState}
              className={`flex-[1.5] flex items-center justify-center gap-2 text-white font-bold text-sm py-4 rounded-2xl transition-all shadow-lg ${theme.primaryBtn}`}
            >
              {isAuction ? "Place Bid" : "Rent Now"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}