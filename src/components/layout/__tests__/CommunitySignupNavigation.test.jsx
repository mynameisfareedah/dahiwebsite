import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Navbar from '../Navbar';
import CallToAction from '../../home/CallToAction';
import GetInvolved from '../../home/GetInvolved';
import BlogPage from '../../../pages/Blog/BlogPage';
import ContactPage from '../../../pages/Contact/ContactPage';

vi.mock('../../../lib/substackFeed', () => ({
  fetchSubstackPosts: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../common/ContactForm', () => ({
  default: () => (
    <form aria-label="Contact form">
      <button type="submit">Send Message</button>
    </form>
  ),
}));

function CurrentLocation() {
  const location = useLocation();
  return <output data-testid="current-location">{`${location.pathname}${location.hash}`}</output>;
}

function renderWithRouter(ui, initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="*" element={<>{ui}<CurrentLocation /></>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('community signup navigation', () => {
  it('routes the desktop Navbar community action to the newsletter', () => {
    renderWithRouter(<Navbar />, '/contact');

    expect(screen.getAllByRole('link', { name: 'Join Our Community' })[0]).toHaveAttribute('href', '/#newsletter');
    expect(document.querySelector('a[href*="forms.gle"]')).toBeNull();
  });

  it('routes the mobile Navbar community action to the newsletter and closes the menu', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Navbar />, '/contact');

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.click(screen.getAllByRole('link', { name: 'Join Our Community' })[1]);

    expect(screen.getByTestId('current-location')).toHaveTextContent('/#newsletter');
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
  });

  it.each([
    ['Homepage Get Involved', GetInvolved],
    ['Homepage community CTA', CallToAction],
    ['Blog CTA', BlogPage],
  ])('%s links Subscribe for Updates to the newsletter', (_, Component) => {
    renderWithRouter(<Component />, '/blog');

    expect(screen.getByRole('link', { name: 'Subscribe for Updates' })).toHaveAttribute('href', '/#newsletter');
    expect(document.querySelector('a[href*="forms.gle"]')).toBeNull();
  });

  it('removes the Contact registration card while preserving contact options and form', () => {
    renderWithRouter(<ContactPage />, '/contact');

    expect(screen.queryByRole('heading', { name: 'Registration', exact: true })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Email', exact: true })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Phone', exact: true })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'WhatsApp Channel', exact: true })).toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'Contact form' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Message' })).toBeInTheDocument();
    expect(document.querySelector('a[href*="forms.gle"]')).toBeNull();
  });
});
