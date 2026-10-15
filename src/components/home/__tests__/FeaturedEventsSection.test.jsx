import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getFeaturedEvents: vi.fn(),
}));

vi.mock('../../../services/supabase/eventsService', () => ({
  getFeaturedEvents: mocks.getFeaturedEvents,
}));

import FeaturedEventsSection from '../FeaturedEventsSection';

describe('FeaturedEventsSection', () => {
  beforeEach(() => {
    mocks.getFeaturedEvents.mockResolvedValue({
      data: [{
        id: 'featured-event',
        title: 'Published featured webinar',
        event_type: 'webinar',
        event_date: '2026-08-10',
        start_time: '10:00',
        status: 'published',
        featured: true,
        registrationEnabled: false,
        registrationStatus: 'closed',
      }],
      error: null,
    });
  });

  it('displays featured event details and keeps closed registration disabled', async () => {
    render(
      <MemoryRouter>
        <FeaturedEventsSection />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'Published featured webinar' })).toBeInTheDocument();
    expect(screen.getByText('Webinars')).toBeInTheDocument();
    expect(screen.getByRole('article').parentElement).toHaveClass('lg:col-span-2');
    expect(screen.getByRole('link', { name: 'View Details' })).toHaveAttribute(
      'href',
      '/events/featured-event'
    );
    expect(screen.getByRole('link', { name: 'View All Events' })).toHaveAttribute('href', '/events');
    expect(screen.getByRole('button', { name: 'Registration Closed' })).toBeDisabled();
  });

  it('uses a balanced two-column desktop grid for multiple featured events', async () => {
    mocks.getFeaturedEvents.mockResolvedValue({
      data: [
        { id: 'featured-one', title: 'Featured webinar', event_type: 'webinar' },
        { id: 'featured-two', title: 'Featured masterclass', event_type: 'masterclass' },
      ],
      error: null,
    });

    render(
      <MemoryRouter>
        <FeaturedEventsSection />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'Featured masterclass' })).toBeInTheDocument();
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(2);
    expect(articles[0].parentElement).not.toHaveClass('lg:col-span-2');
    expect(articles[0].parentElement.parentElement).toHaveClass('lg:grid-cols-2');
    expect(articles[0].firstElementChild).not.toHaveClass('sm:flex-row');
  });

  it('keeps three or more featured events in the responsive grid without spanning empty columns', async () => {
    mocks.getFeaturedEvents.mockResolvedValue({
      data: [
        { id: 'featured-one', title: 'Featured webinar' },
        { id: 'featured-two', title: 'Featured masterclass' },
        { id: 'featured-three', title: 'Featured outreach' },
      ],
      error: null,
    });

    render(
      <MemoryRouter>
        <FeaturedEventsSection />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'Featured outreach' })).toBeInTheDocument();
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(3);
    expect(articles.every((article) => !article.parentElement.classList.contains('lg:col-span-2'))).toBe(true);
    expect(articles[0].parentElement.parentElement).toHaveClass('lg:grid-cols-2', 'xl:grid-cols-3');
    expect(articles[0].firstElementChild).not.toHaveClass('sm:flex-row');
  });
});
