import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from './redux/slices/authSlice';
import { Toaster } from 'react-hot-toast';
import App from './App';


function AppInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Restore auth state from localStorage on app initialization
    const savedAuthState = localStorage.getItem('authState');
    if (savedAuthState) {
      try {
        const authData = JSON.parse(savedAuthState);
        dispatch(setUser(authData.user));
      } catch (err) {
        console.error('Failed to restore auth state:', err);
      }
    }
  }, [dispatch]);

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            maxWidth: '500px',
          },
          success: {
            duration: 2500,
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
            style: {
              background: '#10c31c',
              color: '#fff',
              fontWeight: '700',
            },
          },
          error: {
            duration: 3500,
            iconTheme: {
              primary: '#fff',
              secondary: '#f80000',
            },
            style: {
              background: '#ef4444',
              color: '#fff',
              fontWeight: '700',
            },
          },
        }}
      />
      <App />
    </>
  );
}

export default AppInitializer;
