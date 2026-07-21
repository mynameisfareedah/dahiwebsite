import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import AdminLoginPage from '../AdminLoginPage';
import { AdminAuthContext } from '../../context/AdminAuthContext';

function TestAuthProvider({ children, initialUser = null, signInImpl, contextError = null, initialLoading = false }) {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(initialLoading);
  const signIn = async (email, password) => {
    const result = await signInImpl(email, password);
    if (!result?.error) {
      setUser({ id: 'admin-1', email });
    }
    return result;
  };

  const value = {
    user,
    loading,
    isAdmin: !!user,
    signIn,
    signOut: vi.fn(),
    isSupabaseConfigured: true,
    error: contextError,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

function renderLogin(options = {}) {
  const {
    initialEntries = ['/admin/login'],
    initialUser = null,
    signInImpl = vi.fn().mockResolvedValue({ error: null }),
    contextError = null,
    initialLoading = false,
  } = options;

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <TestAuthProvider
        initialUser={initialUser}
        signInImpl={signInImpl}
        contextError={contextError}
        initialLoading={initialLoading}
      >
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<div>Admin Dashboard</div>} />
          <Route path="/admin/events" element={<div>Admin Events</div>} />
        </Routes>
      </TestAuthProvider>
    </MemoryRouter>
  );
}

describe('AdminLoginPage - Real Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders login form', () => {
    renderLogin();

    expect(screen.getByRole('heading', { name: /admin login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your@organization.email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('handles valid login and redirects to admin', async () => {
    const user = userEvent.setup();
    const signInImpl = vi.fn().mockResolvedValue({ error: null });

    renderLogin({ signInImpl });

    await user.type(screen.getByPlaceholderText('your@organization.email'), 'admin@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(signInImpl).toHaveBeenCalledWith('admin@example.com', 'password123');
    });

    expect(await screen.findByText(/Login successful! Redirecting/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows invalid login error', async () => {
    const user = userEvent.setup();
    const signInImpl = vi.fn().mockResolvedValue({ error: 'Invalid login credentials' });

    renderLogin({ signInImpl });

    await user.type(screen.getByPlaceholderText('your@organization.email'), 'admin@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(
      await screen.findByText('Invalid credentials. Please check your email and password.')
    ).toBeInTheDocument();
  });

  it('shows loading state while signing in', async () => {
    const user = userEvent.setup();
    let resolveSignIn;
    const signInImpl = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSignIn = resolve;
        })
    );

    renderLogin({ signInImpl });

    await user.type(screen.getByPlaceholderText('your@organization.email'), 'admin@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(screen.getByRole('button', { name: /Signing in.../i })).toBeDisabled();

    resolveSignIn({ error: null });

    await waitFor(() => {
      expect(signInImpl).toHaveBeenCalled();
    });
  });

  it('redirects already authenticated user (session persistence path)', async () => {
    renderLogin({ initialUser: { id: 'admin-1', email: 'admin@example.com' } });

    expect(await screen.findByText(/Login successful! Redirecting/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('redirects to original route after login when location state has from', async () => {
    const user = userEvent.setup();
    const signInImpl = vi.fn().mockResolvedValue({ error: null });

    renderLogin({
      signInImpl,
      initialEntries: [
        {
          pathname: '/admin/login',
          state: { from: { pathname: '/admin/events' } },
        },
      ],
    });

    await user.type(screen.getByPlaceholderText('your@organization.email'), 'admin@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Admin Events')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
