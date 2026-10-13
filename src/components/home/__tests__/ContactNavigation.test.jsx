import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Footer from '../../layout/Footer';
import GetInvolved from '../GetInvolved';

describe('Contact navigation', () => {
  it('opens Contact from the homepage Get in Touch action', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<GetInvolved />} />
          <Route path="/contact" element={<h1>Contact route</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('link', { name: 'Get in Touch' }));

    expect(await screen.findByRole('heading', { name: 'Contact route' })).toBeInTheDocument();
  });

  it('opens Contact from the footer navigation', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Footer />} />
          <Route path="/contact" element={<h1>Contact route</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('link', { name: 'Contact', exact: true }));

    expect(await screen.findByRole('heading', { name: 'Contact route' })).toBeInTheDocument();
  });
});
