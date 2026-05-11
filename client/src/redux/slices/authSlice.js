import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authServices } from '../../services/auth.services';

// Helper to save auth state to localStorage
const saveAuthState = (user) => {
  if (user) {
    localStorage.setItem('authState', JSON.stringify({
      user,
      userType: user.userType,
      approved_status: user.approved_status
    }));
  } else {
    localStorage.removeItem('authState');
  }
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authServices.login(credentials);
      if (response.success) {
        // Save auth state to localStorage
        saveAuthState(response.user);
        if (response.token) localStorage.setItem('token', response.token);
        return {
          user: response.user,
          redirect: response.redirect,
          message: response.message
        };
      } else {
        return rejectWithValue(response.message || 'Login failed');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login error');
    }
  }
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (credential, { rejectWithValue }) => {
    try {
      const response = await authServices.googleLogin(credential);
      if (response.success) {
        // If OTP is required, return the OTP flag without saving auth state
        if (response.otpRequired) {
          return {
            otpRequired: true,
            message: response.message,
            email: response.email,
          };
        }
        // Save auth state to localStorage
        saveAuthState(response.user);
        if (response.token) localStorage.setItem('token', response.token);
        return {
          user: response.user,
          redirect: response.redirect,
          message: response.message
        };
      } else {
        return rejectWithValue(response.message || 'Google login failed');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Google login error');
    }
  }
);

export const verifySignupOtp = createAsyncThunk(
  'auth/verifySignupOtp',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authServices.verifySignupOtp(data);
      if (response.success) {
        saveAuthState(response.user);
        return {
          user: response.user,
          redirect: response.redirect,
          message: response.message
        };
      } else {
        return rejectWithValue(response.message || 'OTP verification failed');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification error');
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authServices.signup(data);
      if (response.success) {
        if (response.otpRequired) {
          return {
            otpRequired: true,
            email: response.email,
            message: response.message
          };
        }
        
        const user = response.data?.user || response.user;
        saveAuthState(user);
        return {
          user,
          message: response.message,
          redirect: response.redirect
        };
      } else {
        return rejectWithValue(response.message || 'Signup failed');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Signup error');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authServices.logout();
      // Clear auth state from localStorage
      localStorage.removeItem('authState');
      localStorage.removeItem('token');
      return { message: 'Logged out successfully' };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout error');
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  success: null,
  redirect: null,
  userType: null,
  approved_status: null,
  requireSignupOtpUI: false,
  signupEmail: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear errors
    clearError: (state) => {
      state.error = null;
    },
    // Clear success
    clearSuccess: (state) => {
      state.success = null;
    },
    // Clear redirect
    clearRedirect: (state) => {
      state.redirect = null;
    },
    // Set user from localStorage or session
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        state.userType = action.payload.userType;
        state.approved_status = action.payload.approved_status;
        // Save to localStorage when setting user
        saveAuthState(action.payload);
      }
    },
    // Clear auth on logout
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.userType = null;
      state.approved_status = null;
      state.redirect = null;
      state.requireSignupOtpUI = false;
      state.signupEmail = null;
      // Clear from localStorage
      localStorage.removeItem('authState');
      localStorage.removeItem('token');
    },
    cancelSignupOtp: (state) => {
      state.requireSignupOtpUI = false;
      state.signupEmail = null;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.userType = action.payload.user?.userType;
        state.approved_status = action.payload.user?.approved_status;
        state.redirect = action.payload.redirect;
        state.success = action.payload.message;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    // Signup
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.otpRequired) {
          state.success = action.payload.message;
          state.requireSignupOtpUI = true;
          state.signupEmail = action.payload.email;
        } else {
          state.success = action.payload.message;
          state.redirect = action.payload.redirect || '/login';
        }
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Verify Signup OTP
    builder
      .addCase(verifySignupOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifySignupOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        state.redirect = action.payload.redirect || '/login';
        state.requireSignupOtpUI = false;
        state.signupEmail = null;
      })
      .addCase(verifySignupOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.userType = null;
        state.approved_status = null;
        state.redirect = '/';
        state.success = 'Logged out successfully';
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Google Login
    builder
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.userType = action.payload.user?.userType;
        state.approved_status = action.payload.user?.approved_status;
        state.redirect = action.payload.redirect;
        state.success = action.payload.message;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  }
});

export const { clearError, clearSuccess, clearRedirect, setUser, clearAuth, cancelSignupOtp } = authSlice.actions;
export default authSlice.reducer;
