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
    expect(screen.getByRole('link', { name: 'View Details' })).toHaveAttribute(
      'href',
      '/events/featured-event'
    );
    expect(screen.getByRole('link', { name: 'View All Events' })).toHaveAttribute('href', '/events');
    expect(screen.getByRole('button', { name: 'Registration Closed' })).toBeDisabled();
  });
});
