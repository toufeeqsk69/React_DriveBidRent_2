import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getRentals, 
  getRentalById, 
  addRental, 
  updateRental, 
  markRentalAsReturned,
  getRentalReviews 
} from '../../services/seller.services';

// Async thunks
export const fetchRentals = createAsyncThunk(
  'sellerRentals/fetchRentals',
  async (_, { rejectWithValue }) => {
    try {
      return await getRentals();
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch rentals');
    }
  }
);

export const fetchRentalById = createAsyncThunk(
  'sellerRentals/fetchRentalById',
  async (id, { rejectWithValue }) => {
    try {
      return await getRentalById(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch rental');
    }
  }
);

export const createRental = createAsyncThunk(
  'sellerRentals/createRental',
  async (rentalData, { rejectWithValue }) => {
    try {
      await addRental(rentalData);
      return rentalData;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to add rental');
    }
  }
);

export const editRental = createAsyncThunk(
  'sellerRentals/editRental',
  async ({ id, rentalData }, { rejectWithValue }) => {
    try {
      await updateRental(id, rentalData);
      return { id, rentalData };
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to update rental');
    }
  }
);

export const markAsReturned = createAsyncThunk(
  'sellerRentals/markAsReturned',
  async (id, { rejectWithValue }) => {
    try {
      await markRentalAsReturned(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to mark as returned');
    }
  }
);

export const fetchReviews = createAsyncThunk(
  'sellerRentals/fetchReviews',
  async (rentalId, { rejectWithValue }) => {
    try {
      return await getRentalReviews(rentalId);
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch reviews');
    }
  }
);

const initialState = {
  rentals: [],
  currentRental: null,
  reviews: [],
  loading: false,
  error: null,
  reviewsLoading: false,
  reviewsError: null,
};

const sellerRentalsSlice = createSlice({
  name: 'sellerRentals',
  initialState,
  reducers: {
    clearCurrentRental: (state) => {
      state.currentRental = null;
    },
    clearReviews: (state) => {
      state.reviews = [];
    },
    clearError: (state) => {
      state.error = null;
      state.reviewsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all rentals
      .addCase(fetchRentals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRentals.fulfilled, (state, action) => {
        state.loading = false;
        state.rentals = action.payload;
      })
      .addCase(fetchRentals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch rentals';
      })
      
      // Fetch rental by ID
      .addCase(fetchRentalById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRentalById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRental = action.payload;
      })
      .addCase(fetchRentalById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch rental';
      })
      
      // Create rental
      .addCase(createRental.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRental.fulfilled, (state) => {
        state.loading = false;
        // Refetch rentals recommended after create
      })
      .addCase(createRental.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add rental';
      })
      
      // Edit rental
      .addCase(editRental.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editRental.fulfilled, (state, action) => {
        state.loading = false;
        // Update current rental if it's the one being edited
        if (state.currentRental?._id === action.payload.id) {
          state.currentRental = { ...state.currentRental, ...action.payload.rentalData };
        }
      })
      .addCase(editRental.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update rental';
      })
      
      // Mark as returned
      .addCase(markAsReturned.fulfilled, (state, action) => {
        // Update rental in list
        const rental = state.rentals.find(r => r._id === action.payload);
        if (rental) {
          rental.status = 'available';
          rental.buyerId = null;
          rental.pickupDate = null;
          rental.dropDate = null;
        }
        // Update current rental
        if (state.currentRental?._id === action.payload) {
          state.currentRental = {
            ...state.currentRental,
            status: 'available',
            buyerId: null,
            pickupDate: null,
            dropDate: null
          };
        }
      })
      
      // Fetch reviews
      .addCase(fetchReviews.pending, (state) => {
        state.reviewsLoading = true;
        state.reviewsError = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.reviewsLoading = false;
        state.reviewsError = action.payload || 'Failed to fetch reviews';
      });
  },
});

export const { clearCurrentRental, clearReviews, clearError } = sellerRentalsSlice.actions;
export default sellerRentalsSlice.reducer;
