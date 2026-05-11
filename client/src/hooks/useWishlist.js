import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, addWishlistItem, removeWishlistItem } from '../redux/slices/wishlistSlice';
import { useCallback } from 'react';

export default function useWishlist() {
  const dispatch = useDispatch();
  const { auctions, rentals, loading, error } = useSelector((state) => state.wishlist);

  const loadWishlist = useCallback(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const addToWishlist = useCallback((id, type) => {
    dispatch(addWishlistItem({ id, type })).then(() => dispatch(fetchWishlist()));
  }, [dispatch]);

  const removeFromWishlist = useCallback((id, type) => {
    dispatch(removeWishlistItem({ id, type }));
  }, [dispatch]);

  return {
    auctions,
    rentals,
    loading,
    error,
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
  };
}
