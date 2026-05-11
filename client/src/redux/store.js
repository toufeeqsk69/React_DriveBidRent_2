import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import wishlistReducer from './slices/wishlistSlice';
import sellerAuctionsReducer from './slices/sellerAuctionsSlice';
import sellerRentalsReducer from './slices/sellerRentalsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    wishlist: wishlistReducer,
    sellerAuctions: sellerAuctionsReducer,
    sellerRentals: sellerRentalsReducer,
  }
});

export default store;
