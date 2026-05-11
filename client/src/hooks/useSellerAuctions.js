import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { 
  fetchAuctions, 
  fetchAuctionById, 
  createAuction, 
  removeAuction, 
  fetchBids,
  clearCurrentAuction,
  clearBids,
  clearError
} from '../redux/slices/sellerAuctionsSlice';

export default function useSellerAuctions() {
  const dispatch = useDispatch();
  const { 
    auctions, 
    currentAuction, 
    bids, 
    loading, 
    error, 
    bidsLoading, 
    bidsError 
  } = useSelector((state) => state.sellerAuctions);

  const loadAuctions = useCallback(() => {
    dispatch(fetchAuctions());
  }, [dispatch]);

  const loadAuctionById = useCallback((id) => {
    dispatch(fetchAuctionById(id));
  }, [dispatch]);

  const addAuction = useCallback((auctionData) => {
    return dispatch(createAuction(auctionData)).then(() => {
      dispatch(fetchAuctions());
    });
  }, [dispatch]);

  const deleteAuction = useCallback((id) => {
    return dispatch(removeAuction(id));
  }, [dispatch]);

  const loadBids = useCallback((auctionId) => {
    dispatch(fetchBids(auctionId));
  }, [dispatch]);

  const clearAuction = useCallback(() => {
    dispatch(clearCurrentAuction());
  }, [dispatch]);

  const clearAuctionBids = useCallback(() => {
    dispatch(clearBids());
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    auctions,
    currentAuction,
    bids,
    loading,
    error,
    bidsLoading,
    bidsError,
    loadAuctions,
    loadAuctionById,
    addAuction,
    deleteAuction,
    loadBids,
    clearAuction,
    clearAuctionBids,
    clearErrors,
  };
}
