import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { focusAreas, testimonials } from '../../../data/siteContent';
import AboutPreview from '../AboutPreview';
import FeaturedPrograms from '../FeaturedPrograms';
import Hero from '../Hero';
import ResourcesPreview from '../ResourcesPreview';
import Testimonials from '../Testimonials';

vi.mock('../../common/SupabaseContent', () => ({
  default: ({ render: renderContent }) => renderContent([{
    id: 'resource-1',
    title: 'A practical menopause guide',
    category: 'Women’s Health',
    description: 'A trusted, practical guide supports informed health decisions. '.repeat(8),
    author: 'DAHI',
    featured: true,
    status: 'Available',
    image: '/guide.jpg',
    type: 'Ebook',
    price: 1200,
    currency: 'NGN',
    external_url: 'https://selar.com/example',
    button_text: 'View Resource',
  }]),
}));

function renderInRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('homepage visual polish', () => {
  it('keeps one community discussion image after removing the repeated About image', () => {
    const { container } = renderInRouter(
      <>
        <Hero />
        <AboutPreview />
      </>,
    );

    expect(container.querySelector('#about')).toHaveClass('w-full');
    expect(container.querySelector('.home-about-copy')).toHaveClass('w-full', 'min-w-0');
    expect(screen.getAllByAltText('DAHI community members in discussion')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'Health education rooted in evidence, compassion, and faith.' })).toBeInTheDocument();
    expect(screen.getByText(/In August 2026, this mission expanded/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Learn More About DAHI' })).toHaveAttribute('href', '/about');
  });

  it('adds a restrained hero entrance and keeps both existing calls to action', () => {
    renderInRouter(<Hero />);

    expect(screen.getByRole('heading', { name: 'Trusted Health Education for Muslim Women' })).toHaveClass('home-hero-enter--2');
    expect(screen.getByRole('link', { name: 'Explore Resources' })).toHaveAttribute('href', '/resources');
    expect(screen.getByRole('link', { name: 'Learn About DAHI' })).toHaveAttribute('href', '/about');
    expect(screen.getByText('Doc Adi Health Initiative (DAHI)')).toHaveClass('home-hero-enter--1');
  });

  it('preserves focus area content and marks decorative icons as hidden from assistive technology', () => {
    render(<FeaturedPrograms />);

    for (const area of focusAreas) {
      const heading = screen.getByRole('heading', { name: area.title });
      const card = heading.closest('article');
      expect(card).toHaveClass('home-focus-card', 'home-scroll-reveal');
      expect(card.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    }
  });

  it('keeps testimonial wording while presenting each quote in a welcoming card', () => {
    render(<Testimonials />);

    testimonials.slice(0, 3).forEach((item) => {
      expect(screen.getByText(item.quote)).toBeInTheDocument();
    });
    expect(document.querySelectorAll('.home-testimonial-card')).toHaveLength(3);
    expect(document.querySelectorAll('.home-testimonial-quote[aria-hidden="true"]')).toHaveLength(3);
  });

  it('shows a concise excerpt while preserving resource title, price, and purchase link', () => {
    renderInRouter(<ResourcesPreview />);

    expect(screen.getByRole('heading', { name: 'A practical menopause guide' })).toBeInTheDocument();
    const excerpt = screen.getByText(/^A trusted, practical guide/);
    expect(excerpt.textContent.length).toBeLessThan(171);
    expect(excerpt.textContent).toBe('A trusted, practical guide supports informed health decisions. A trusted, practical guide supports informed health decisions.');
    expect(screen.getByText('NGN 1,200')).toBeInTheDocument();
    const purchaseLink = screen.getByRole('link', { name: 'View Resource' });
    expect(purchaseLink).toHaveAttribute('href', 'https://selar.com/example');
    expect(purchaseLink.closest('.home-resource-actions')).toHaveClass('relative', 'z-30');
  });

  it('opens the existing Resources catalogue from Browse All Resources', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<ResourcesPreview />} />
          <Route path="/resources" element={<h1>Resources Catalogue</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('link', { name: 'Browse All Resources' }));

    expect(await screen.findByRole('heading', { name: 'Resources Catalogue' })).toBeInTheDocument();
  });
});
