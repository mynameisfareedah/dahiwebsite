import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';

vi.mock('../../hooks/useAdminAuth', () => ({
  useAdminAuth: vi.fn(),
}));

vi.mock('../../../components/common/LoadingState', () => ({
  default: ({ message }) => <div>{message}</div>,
}));

import { useAdminAuth } from '../../hooks/useAdminAuth';

function renderProtectedRoute(initialPath = '/admin/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<div>Protected Content</div>} />
        </Route>
        <Route path="/admin/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute - Real Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children for authenticated admin', () => {
    vi.mocked(useAdminAuth).mockReturnValue({
      user: { id: '1', email: 'admin@example.com' },
      isAdmin: true,
      loading: false,
    });

    renderProtectedRoute();

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated user to login', () => {
    vi.mocked(useAdminAuth).mockReturnValue({
      user: null,
      isAdmin: false,
      loading: false,
    });

    renderProtectedRoute();

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows loading state while auth is checking', () => {
    vi.mocked(useAdminAuth).mockReturnValue({
      user: null,
      isAdmin: false,
      loading: true,
    });

    renderProtectedRoute();

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects authenticated non-admin user to login', () => {
    vi.mocked(useAdminAuth).mockReturnValue({
      user: { id: '2', email: 'user@example.com' },
      isAdmin: false,
      loading: false,
    });

    renderProtectedRoute();

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
