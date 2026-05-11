import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getWishlist, addToWishlist, removeFromWishlist } from '../../services/buyer.services';

// Async thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      return await getWishlist();
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch wishlist');
    }
  }
);

export const addWishlistItem = createAsyncThunk(
  'wishlist/addWishlistItem',
  async ({ id, type }, { rejectWithValue }) => {
    try {
      await addToWishlist(id, type);
      return { id, type };
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to add to wishlist');
    }
  }
);

export const removeWishlistItem = createAsyncThunk(
  'wishlist/removeWishlistItem',
  async ({ id, type }, { rejectWithValue }) => {
    try {
      await removeFromWishlist(id, type);
      return { id, type };
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to remove from wishlist');
    }
  }
);

const initialState = {
  auctions: [],
  rentals: [],
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.auctions = action.payload.auctions || [];
        state.rentals = action.payload.rentals || [];
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch wishlist';
      })
      .addCase(addWishlistItem.pending, (state) => {
        state.error = null;
      })
      .addCase(addWishlistItem.fulfilled, (state, action) => {
        const { id, type } = action.payload;
        if (type === 'auction') {
          if (!state.auctions.some(item => item._id === id)) {
            state.auctions.push({ _id: id, type: 'auction' });
          }
        } else if (type === 'rental') {
          if (!state.rentals.some(item => item._id === id)) {
            state.rentals.push({ _id: id, type: 'rental' });
          }
        }
      })
      .addCase(addWishlistItem.rejected, (state, action) => {
        state.error = action.payload || 'Failed to add to wishlist';
      })
      .addCase(removeWishlistItem.pending, (state) => {
        state.error = null;
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        const { id, type } = action.payload;
        if (type === 'auction') {
          state.auctions = state.auctions.filter(item => (item._id || item.id) !== id);
        } else if (type === 'rental') {
          state.rentals = state.rentals.filter(item => (item._id || item.id) !== id);
        }
      })
      .addCase(removeWishlistItem.rejected, (state, action) => {
        state.error = action.payload || 'Failed to remove from wishlist';
      });
  },
});

export default wishlistSlice.reducer;