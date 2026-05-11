import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { ProtectedRoute, PublicRoute } from '../components/ProtectedRoute';

/**
 * Helper: Create a minimal Redux store with a given auth state.
 */
function createStore(authState) {
  return configureStore({
    reducer: {
      auth: () => authState,
    },
  });
}

/**
 * Helper: Render a component wrapped in Provider + MemoryRouter.
 */
function renderWith(component, store) {
  return render(
    <Provider store={store}>
      <MemoryRouter>{component}</MemoryRouter>
    </Provider>
  );
}

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', () => {
    const store = createStore({ isAuthenticated: true, userType: 'buyer' });
    renderWith(
      <ProtectedRoute><div>Protected Content</div></ProtectedRoute>,
      store
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to /login when user is NOT authenticated', () => {
    const store = createStore({ isAuthenticated: false, userType: null });
    renderWith(
      <ProtectedRoute><div>Protected Content</div></ProtectedRoute>,
      store
    );
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects when authenticated but wrong userType', () => {
    const store = createStore({ isAuthenticated: true, userType: 'buyer' });
    renderWith(
      <ProtectedRoute requiredUserType="admin"><div>Admin Only</div></ProtectedRoute>,
      store
    );
    expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
  });

  it('renders children when userType matches requiredUserType', () => {
    const store = createStore({ isAuthenticated: true, userType: 'admin' });
    renderWith(
      <ProtectedRoute requiredUserType="admin"><div>Admin Only</div></ProtectedRoute>,
      store
    );
    expect(screen.getByText('Admin Only')).toBeInTheDocument();
  });
});

describe('PublicRoute', () => {
  it('renders children when user is NOT authenticated', () => {
    const store = createStore({ isAuthenticated: false });
    renderWith(
      <PublicRoute><div>Public Content</div></PublicRoute>,
      store
    );
    expect(screen.getByText('Public Content')).toBeInTheDocument();
  });

  it('redirects when user IS authenticated', () => {
    const store = createStore({ isAuthenticated: true });
    renderWith(
      <PublicRoute><div>Public Content</div></PublicRoute>,
      store
    );
    expect(screen.queryByText('Public Content')).not.toBeInTheDocument();
  });
});
