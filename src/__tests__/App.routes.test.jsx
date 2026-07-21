import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

function renderAppAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe('App Router - Real Routes', () => {
  it('renders a public route (/privacy)', async () => {
    renderAppAt('/privacy');

    expect(await screen.findByRole('heading', { name: /privacy policy/i })).toBeInTheDocument();
  });

  it('renders admin login route', async () => {
    renderAppAt('/admin/login');

    // Depending on env config, route may show login form or setup notice.
    await waitFor(() => {
      const loginHeading = screen.queryByRole('heading', { name: /admin login/i });
      const setupHeading = screen.queryByRole('heading', { name: /admin system not configured/i });
      expect(loginHeading || setupHeading).not.toBeNull();
    });
  });

  it('renders 404 page for unknown routes', async () => {
    renderAppAt('/this-route-does-not-exist');

    expect(await screen.findByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  });

  it('protects /admin route and redirects to login/setup when unauthenticated', async () => {
    renderAppAt('/admin');

    await waitFor(() => {
      const loginHeading = screen.queryByRole('heading', { name: /admin login/i });
      const setupHeading = screen.queryByRole('heading', { name: /admin system not configured/i });
      expect(loginHeading || setupHeading).not.toBeNull();
    });
  });
});
