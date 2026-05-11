import { describe, it, expect, beforeEach, vi } from 'vitest';
import authReducer, {
  clearError,
  clearSuccess,
  clearRedirect,
  setUser,
  clearAuth,
  cancelSignupOtp,
} from '../redux/slices/authSlice';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

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

describe('authSlice', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // ─── Initial State ───────────────────────────────────────
  it('should return the initial state', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialState);
  });

  // ─── clearError ──────────────────────────────────────────
  it('clearError should nullify the error field', () => {
    const prev = { ...initialState, error: 'Something went wrong' };
    const state = authReducer(prev, clearError());
    expect(state.error).toBeNull();
  });

  // ─── clearSuccess ────────────────────────────────────────
  it('clearSuccess should nullify the success field', () => {
    const prev = { ...initialState, success: 'Login successful' };
    const state = authReducer(prev, clearSuccess());
    expect(state.success).toBeNull();
  });

  // ─── clearRedirect ───────────────────────────────────────
  it('clearRedirect should nullify the redirect field', () => {
    const prev = { ...initialState, redirect: '/buyer' };
    const state = authReducer(prev, clearRedirect());
    expect(state.redirect).toBeNull();
  });

  // ─── setUser ─────────────────────────────────────────────
  it('setUser should populate user and derived fields', () => {
    const user = { _id: '1', name: 'Test', userType: 'buyer', approved_status: 'approved' };
    const state = authReducer(initialState, setUser(user));

    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
    expect(state.userType).toBe('buyer');
    expect(state.approved_status).toBe('approved');
  });

  it('setUser(null) should mark unauthenticated', () => {
    const prev = { ...initialState, user: { name: 'X' }, isAuthenticated: true };
    const state = authReducer(prev, setUser(null));

    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  // ─── clearAuth ───────────────────────────────────────────
  it('clearAuth should reset all auth state and clear localStorage', () => {
    const prev = {
      ...initialState,
      user: { name: 'X' },
      isAuthenticated: true,
      userType: 'seller',
      approved_status: 'approved',
      redirect: '/seller',
      requireSignupOtpUI: true,
      signupEmail: 'x@y.z',
    };
    const state = authReducer(prev, clearAuth());

    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.userType).toBeNull();
    expect(state.approved_status).toBeNull();
    expect(state.redirect).toBeNull();
    expect(state.requireSignupOtpUI).toBe(false);
    expect(state.signupEmail).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('authState');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });

  // ─── cancelSignupOtp ─────────────────────────────────────
  it('cancelSignupOtp should clear OTP UI flags', () => {
    const prev = { ...initialState, requireSignupOtpUI: true, signupEmail: 'a@b.c' };
    const state = authReducer(prev, cancelSignupOtp());

    expect(state.requireSignupOtpUI).toBe(false);
    expect(state.signupEmail).toBeNull();
  });

  // ─── loginUser extra reducers ────────────────────────────
  it('loginUser.pending should set loading true and clear error', () => {
    const prev = { ...initialState, error: 'old error' };
    const state = authReducer(prev, { type: 'auth/loginUser/pending' });

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('loginUser.fulfilled should authenticate the user', () => {
    const user = { _id: '1', name: 'Test', userType: 'buyer', approved_status: 'approved' };
    const action = {
      type: 'auth/loginUser/fulfilled',
      payload: { user, redirect: '/buyer', message: 'Welcome' },
    };
    const state = authReducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
    expect(state.userType).toBe('buyer');
    expect(state.redirect).toBe('/buyer');
    expect(state.success).toBe('Welcome');
  });

  it('loginUser.rejected should set error and clear auth', () => {
    const action = {
      type: 'auth/loginUser/rejected',
      payload: 'Invalid credentials',
    };
    const state = authReducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe('Invalid credentials');
    expect(state.isAuthenticated).toBe(false);
  });

  // ─── signupUser extra reducers ───────────────────────────
  it('signupUser.fulfilled with OTP should set OTP flags', () => {
    const action = {
      type: 'auth/signupUser/fulfilled',
      payload: { otpRequired: true, email: 'test@test.com', message: 'OTP sent' },
    };
    const state = authReducer(initialState, action);

    expect(state.requireSignupOtpUI).toBe(true);
    expect(state.signupEmail).toBe('test@test.com');
    expect(state.success).toBe('OTP sent');
  });

  it('signupUser.fulfilled without OTP should set redirect', () => {
    const action = {
      type: 'auth/signupUser/fulfilled',
      payload: { message: 'Account created', redirect: '/login' },
    };
    const state = authReducer(initialState, action);

    expect(state.success).toBe('Account created');
    expect(state.redirect).toBe('/login');
    expect(state.requireSignupOtpUI).toBe(false);
  });

  // ─── logoutUser extra reducers ───────────────────────────
  it('logoutUser.fulfilled should clear all auth state', () => {
    const prev = {
      ...initialState,
      user: { name: 'X' },
      isAuthenticated: true,
      userType: 'buyer',
    };
    const state = authReducer(prev, { type: 'auth/logoutUser/fulfilled' });

    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.userType).toBeNull();
    expect(state.redirect).toBe('/');
    expect(state.success).toBe('Logged out successfully');
  });

  // ─── googleLogin extra reducers ──────────────────────────
  it('googleLogin.fulfilled should authenticate the user', () => {
    const user = { _id: '2', name: 'Google User', userType: 'seller', approved_status: 'approved' };
    const action = {
      type: 'auth/googleLogin/fulfilled',
      payload: { user, redirect: '/seller', message: 'Google login success' },
    };
    const state = authReducer(initialState, action);

    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
    expect(state.userType).toBe('seller');
    expect(state.redirect).toBe('/seller');
  });

  it('googleLogin.rejected should set error', () => {
    const action = {
      type: 'auth/googleLogin/rejected',
      payload: 'Google auth failed',
    };
    const state = authReducer(initialState, action);

    expect(state.error).toBe('Google auth failed');
    expect(state.isAuthenticated).toBe(false);
  });
});
