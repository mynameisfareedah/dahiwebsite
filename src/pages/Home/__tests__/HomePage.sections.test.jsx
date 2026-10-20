import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import HomePage from '../HomePage';

vi.mock('../../../components/common/SEO', () => ({ default: () => null }));
vi.mock('../../../components/home/Hero', () => ({ default: () => <div data-testid="hero" /> }));
vi.mock('../../../components/home/AboutPreview', () => ({ default: () => <div data-testid="about" /> }));
vi.mock('../../../components/home/FeaturedPrograms', () => ({ default: () => <div data-testid="focus-areas" /> }));
vi.mock('../../../components/home/MeetDocAdi', () => ({ default: () => <div data-testid="founder" /> }));
vi.mock('../../../components/home/FeaturedSubstackArticle', () => ({ default: () => <div data-testid="featured-blog" /> }));
vi.mock('../../../components/home/FeaturedEventsSection', () => ({ default: () => <div data-testid="featured-events" /> }));
vi.mock('../../../components/home/OutreachPhotoLoop', () => ({ default: () => <div data-testid="outreach-carousel" /> }));
vi.mock('../../../components/home/ResourcesPreview', () => ({ default: () => <div data-testid="resources" /> }));
vi.mock('../../../components/home/Testimonials', () => ({ default: () => <div data-testid="testimonials" /> }));
vi.mock('../../../components/home/GetInvolved', () => ({ default: () => <div data-testid="get-involved" /> }));
vi.mock('../../../components/home/NewsletterSection', () => ({ default: () => <div data-testid="newsletter" /> }));
vi.mock('../../../components/home/FAQ', () => ({ default: () => <div data-testid="faq" /> }));

describe('HomePage section composition', () => {
  it('omits Our Impact while keeping the Founder immediately before Featured Blog', () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    const founder = screen.getByTestId('founder');
    const featuredBlog = screen.getByTestId('featured-blog');

    expect(screen.queryByText('Our Impact')).not.toBeInTheDocument();
    expect(founder.nextElementSibling).toBe(featuredBlog);
    expect([
      'hero',
      'about',
      'focus-areas',
      'founder',
      'featured-blog',
      'featured-events',
      'outreach-carousel',
      'resources',
      'testimonials',
      'get-involved',
      'newsletter',
      'faq',
    ].every((section) => container.querySelector(`[data-testid="${section}"]`))).toBe(true);
  });
});
