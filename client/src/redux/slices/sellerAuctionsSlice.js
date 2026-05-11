import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAuctions, getAuctionById, addAuction, deleteAuction, getBidsByAuction } from '../../services/seller.services';

// Async thunks
export const fetchAuctions = createAsyncThunk(
  'sellerAuctions/fetchAuctions',
  async (_, { rejectWithValue }) => {
    try {
      return await getAuctions();
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch auctions');
    }
  }
);

export const fetchAuctionById = createAsyncThunk(
  'sellerAuctions/fetchAuctionById',
  async (id, { rejectWithValue }) => {
    try {
      return await getAuctionById(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch auction');
    }
  }
);

export const createAuction = createAsyncThunk(
  'sellerAuctions/createAuction',
  async (auctionData, { rejectWithValue }) => {
    try {
      await addAuction(auctionData);
      return auctionData;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to add auction');
    }
  }
);

export const removeAuction = createAsyncThunk(
  'sellerAuctions/removeAuction',
  async (id, { rejectWithValue }) => {
    try {
      await deleteAuction(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to delete auction');
    }
  }
);

export const fetchBids = createAsyncThunk(
  'sellerAuctions/fetchBids',
  async (auctionId, { rejectWithValue }) => {
    try {
      return await getBidsByAuction(auctionId);
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch bids');
    }
  }
);

const initialState = {
  auctions: [],
  currentAuction: null,
  bids: [],
  loading: false,
  error: null,
  bidsLoading: false,
  bidsError: null,
};

const sellerAuctionsSlice = createSlice({
  name: 'sellerAuctions',
  initialState,
  reducers: {
    clearCurrentAuction: (state) => {
      state.currentAuction = null;
    },
    clearBids: (state) => {
      state.bids = [];
    },
    clearError: (state) => {
      state.error = null;
      state.bidsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all auctions
      .addCase(fetchAuctions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuctions.fulfilled, (state, action) => {
        state.loading = false;
        state.auctions = action.payload;
      })
      .addCase(fetchAuctions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch auctions';
      })
      
      // Fetch auction by ID
      .addCase(fetchAuctionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuctionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAuction = action.payload;
      })
      .addCase(fetchAuctionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch auction';
      })
      
      // Create auction
      .addCase(createAuction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAuction.fulfilled, (state, _action) => {
        state.loading = false;
        // Refetch auctions recommended after create
      })
      .addCase(createAuction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add auction';
      })
      
      // Delete auction
      .addCase(removeAuction.fulfilled, (state, action) => {
        state.auctions = state.auctions.filter(a => a._id !== action.payload);
      })
      
      // Fetch bids
      .addCase(fetchBids.pending, (state) => {
        state.bidsLoading = true;
        state.bidsError = null;
      })
      .addCase(fetchBids.fulfilled, (state, action) => {
        state.bidsLoading = false;
        state.bids = action.payload;
      })
      .addCase(fetchBids.rejected, (state, action) => {
        state.bidsLoading = false;
        state.bidsError = action.payload || 'Failed to fetch bids';
      });
  },
});

export const { clearCurrentAuction, clearBids, clearError } = sellerAuctionsSlice.actions;
export default sellerAuctionsSlice.reducer;
