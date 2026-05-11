import { describe, it, expect } from 'vitest';
import wishlistReducer from '../redux/slices/wishlistSlice';

const initialState = {
  auctions: [],
  rentals: [],
  loading: false,
  error: null,
};

describe('wishlistSlice', () => {
  // ─── Initial State ───────────────────────────────────────
  it('should return the initial state', () => {
    const state = wishlistReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialState);
  });

  // ─── fetchWishlist ───────────────────────────────────────
  it('fetchWishlist.pending should set loading true', () => {
    const state = wishlistReducer(initialState, { type: 'wishlist/fetchWishlist/pending' });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('fetchWishlist.fulfilled should populate auctions and rentals', () => {
    const payload = {
      auctions: [{ _id: 'a1', title: 'Car1' }],
      rentals: [{ _id: 'r1', title: 'Car2' }],
    };
    const state = wishlistReducer(initialState, {
      type: 'wishlist/fetchWishlist/fulfilled',
      payload,
    });
    expect(state.loading).toBe(false);
    expect(state.auctions).toEqual(payload.auctions);
    expect(state.rentals).toEqual(payload.rentals);
  });

  it('fetchWishlist.rejected should set error', () => {
    const state = wishlistReducer(initialState, {
      type: 'wishlist/fetchWishlist/rejected',
      payload: 'Network error',
    });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Network error');
  });

  // ─── addWishlistItem ─────────────────────────────────────
  it('addWishlistItem.fulfilled should add an auction item', () => {
    const state = wishlistReducer(initialState, {
      type: 'wishlist/addWishlistItem/fulfilled',
      payload: { id: 'a1', type: 'auction' },
    });
    expect(state.auctions).toHaveLength(1);
    expect(state.auctions[0]._id).toBe('a1');
  });

  it('addWishlistItem.fulfilled should add a rental item', () => {
    const state = wishlistReducer(initialState, {
      type: 'wishlist/addWishlistItem/fulfilled',
      payload: { id: 'r1', type: 'rental' },
    });
    expect(state.rentals).toHaveLength(1);
    expect(state.rentals[0]._id).toBe('r1');
  });

  it('addWishlistItem.fulfilled should not duplicate existing items', () => {
    const prev = {
      ...initialState,
      auctions: [{ _id: 'a1', type: 'auction' }],
    };
    const state = wishlistReducer(prev, {
      type: 'wishlist/addWishlistItem/fulfilled',
      payload: { id: 'a1', type: 'auction' },
    });
    expect(state.auctions).toHaveLength(1);
  });

  // ─── removeWishlistItem ──────────────────────────────────
  it('removeWishlistItem.fulfilled should remove an auction item', () => {
    const prev = {
      ...initialState,
      auctions: [{ _id: 'a1', type: 'auction' }, { _id: 'a2', type: 'auction' }],
    };
    const state = wishlistReducer(prev, {
      type: 'wishlist/removeWishlistItem/fulfilled',
      payload: { id: 'a1', type: 'auction' },
    });
    expect(state.auctions).toHaveLength(1);
    expect(state.auctions[0]._id).toBe('a2');
  });

  it('removeWishlistItem.fulfilled should remove a rental item', () => {
    const prev = {
      ...initialState,
      rentals: [{ _id: 'r1', type: 'rental' }],
    };
    const state = wishlistReducer(prev, {
      type: 'wishlist/removeWishlistItem/fulfilled',
      payload: { id: 'r1', type: 'rental' },
    });
    expect(state.rentals).toHaveLength(0);
  });

  it('addWishlistItem.rejected should set error', () => {
    const state = wishlistReducer(initialState, {
      type: 'wishlist/addWishlistItem/rejected',
      payload: 'Failed to add',
    });
    expect(state.error).toBe('Failed to add');
  });

  it('removeWishlistItem.rejected should set error', () => {
    const state = wishlistReducer(initialState, {
      type: 'wishlist/removeWishlistItem/rejected',
      payload: 'Failed to remove',
    });
    expect(state.error).toBe('Failed to remove');
  });
});
