import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProfile } from '../redux/slices/profileSlice';

export const useProfile = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.profile?.me);
  const loading = useSelector((state) => state.profile?.loading);
  const error = useSelector((state) => state.profile?.error);
  const userType = useSelector((state) => state.auth?.userType);

  // Fetch profile on mount or when userType changes
  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch, userType]);

  return { profile, loading, error, refresh: () => dispatch(fetchMyProfile()) };
};

export default useProfile;
