import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance.util';

// Determine endpoint by userType for GET operations
const profileEndpointFor = (userType) => {
  const map = {
    buyer: '/buyer/profile',
    seller: '/seller/profile',
    mechanic: '/mechanic/profile',
    driver: '/driver/profile',
    auction_manager: '/auctionmanager/profile',
    auctionmanager: '/auctionmanager/profile',
    admin: '/admin/admin-profile',
  };
  return map[userType] || '/auth/profile';
};

// Determine UPDATE endpoint by userType
const profileUpdateEndpointFor = (userType) => {
  const map = {
    buyer: '/buyer/profile',
    seller: '/seller/update-profile',
    mechanic: '/mechanic/profile', // Uses PATCH on /profile
    driver: '/driver/profile',
    auction_manager: '/auctionmanager/profile', // Uses PATCH on /profile
    auctionmanager: '/auctionmanager/profile', // Uses PATCH on /profile
    admin: '/admin/admin-profile', // No update endpoint currently
  };
  return map[userType] || '/auth/profile';
};

export const fetchMyProfile = createAsyncThunk('profile/fetchMyProfile', async (_, { getState, rejectWithValue }) => {
  try {
    const userType = getState().auth?.userType;
    const user = getState().auth?.user;
    
    // If no userType but we have user object, use it directly
    if (!userType && user) {
      return user;
    }
    
    // If no userType at all, reject
    if (!userType) {
      return rejectWithValue('User type not found. Please log in again.');
    }
    
    const endpoint = profileEndpointFor(userType);
    const res = await axiosInstance.get(endpoint);
    // Handle both formats: { data: { user: {...} } } and { data: {...} }
    const data = res.data?.data || res.data;
    return data.user || data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch profile');
  }
});

export const fetchUserById = createAsyncThunk('profile/fetchUserById', async (userId, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/users/${userId}`);
    return res.data?.data || res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch user');
  }
});

export const updateMyProfile = createAsyncThunk('profile/updateMyProfile', async (payload, { getState, rejectWithValue }) => {
  try {
    const userType = getState().auth?.userType;
    const updateEndpoint = profileUpdateEndpointFor(userType);
    const fetchEndpoint = profileEndpointFor(userType);
    
    // Use POST for seller only; PATCH for buyer, mechanic, auctionmanager, admin
    const usePost = userType?.toLowerCase() === 'seller';
    const res = usePost 
      ? await axiosInstance.post(updateEndpoint, payload)
      : await axiosInstance.patch(updateEndpoint, payload);
    
    // Handle response - if only message returned, fetch fresh profile
    let updatedData = res.data?.data || res.data;
    if (!updatedData || typeof updatedData === 'string') {
      // Response was just a message, need to fetch fresh data
      const fetchRes = await axiosInstance.get(fetchEndpoint);
      updatedData = fetchRes.data?.data || fetchRes.data;
    }
    
    return updatedData.user || updatedData;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update profile');
  }
});

const initialState = {
  me: null,
  byId: {},
  loading: false,
  error: null,
  success: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError(state) {
      state.error = null;
    },
    clearProfileSuccess(state) {
      state.success = null;
    },
    setProfile(state, action) {
      state.me = action.payload;
    },
    clearProfile(state) {
      state.me = null;
      state.byId = {};
      state.loading = false;
      state.error = null;
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.me = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      })

      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        const user = action.payload;
        if (user && user._id) state.byId[user._id] = user;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      })

      .addCase(updateMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.me = action.payload;
        state.success = 'Profile updated';
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      });
  }
});

export const { clearProfileError, clearProfileSuccess, setProfile, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
