import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { 
  fetchRentals, 
  fetchRentalById, 
  createRental, 
  editRental, 
  markAsReturned,
  fetchReviews,
  clearCurrentRental,
  clearReviews,
  clearError
} from '../redux/slices/sellerRentalsSlice';

export default function useSellerRentals() {
  const dispatch = useDispatch();
  const { 
    rentals, 
    currentRental, 
    reviews,
    loading, 
    error, 
    reviewsLoading, 
    reviewsError 
  } = useSelector((state) => state.sellerRentals);

  const loadRentals = useCallback(() => {
    dispatch(fetchRentals());
  }, [dispatch]);

  const loadRentalById = useCallback((id) => {
    dispatch(fetchRentalById(id));
  }, [dispatch]);

  const addRental = useCallback((rentalData) => {
    return dispatch(createRental(rentalData)).then(() => {
      dispatch(fetchRentals());
    });
  }, [dispatch]);

  const updateRental = useCallback((id, rentalData) => {
    return dispatch(editRental({ id, rentalData }));
  }, [dispatch]);

  const markRentalAsReturned = useCallback((id) => {
    return dispatch(markAsReturned(id));
  }, [dispatch]);

  const loadReviews = useCallback((rentalId) => {
    dispatch(fetchReviews(rentalId));
  }, [dispatch]);

  const clearRental = useCallback(() => {
    dispatch(clearCurrentRental());
  }, [dispatch]);

  const clearRentalReviews = useCallback(() => {
    dispatch(clearReviews());
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    rentals,
    currentRental,
    reviews,
    loading,
    error,
    reviewsLoading,
    reviewsError,
    loadRentals,
    loadRentalById,
    addRental,
    updateRental,
    markRentalAsReturned,
    loadReviews,
    clearRental,
    clearRentalReviews,
    clearErrors,
  };
}
