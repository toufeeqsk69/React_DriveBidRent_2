/**
 * Auth Persistence Middleware
 * Saves auth state to localStorage whenever it changes
 */
export const authPersistMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Save auth state to localStorage after any auth-related action
  if (action.type.startsWith('auth/')) {
    const authState = store.getState().auth;
    if (authState.user) {
      localStorage.setItem('authState', JSON.stringify({
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        userType: authState.userType,
        approved_status: authState.approved_status
      }));
    } else {
      // Clear localStorage if user logs out
      localStorage.removeItem('authState');
    }
  }
  
  return result;
};
