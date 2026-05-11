import { useSelector, useDispatch } from 'react-redux';
import { loginUser, logoutUser, signupUser } from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  return {
    ...auth,
    login: (credentials) => dispatch(loginUser(credentials)),
    logout: () => dispatch(logoutUser()),
    signup: (data) => dispatch(signupUser(data))
  };
};
