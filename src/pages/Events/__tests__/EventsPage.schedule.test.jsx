import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getEvents: vi.fn(),
}));

vi.mock('../../../services/supabase/eventsService', () => ({
  getEvents: mocks.getEvents,
}));

import EventsPage from '../EventsPage';

describe('EventsPage schedules', () => {
  beforeEach(() => {
    mocks.getEvents.mockResolvedValue({
      data: [{
        id: 'doq',
        title: 'DAHI Online Quiz',
        status: 'published',
        event_date: '2026-10-17',
        event_end_date: '2026-10-18',
        event_schedule: [
          { date: '2026-10-17', time: '15:00', end_time: '18:00' },
          { date: '2026-10-18', time: '15:00', end_time: '18:00' },
        ],
      }],
      error: null,
    });
  });

  it('shows the full event date range and the time range for each session', async () => {
    render(
      <MemoryRouter>
        <EventsPage />
      </MemoryRouter>
    );

    const eventHeading = await screen.findByRole('heading', { name: 'DAHI Online Quiz' });
    const eventCard = eventHeading.closest('article');
    expect(within(eventCard).getByText('17–18 October 2026')).toBeInTheDocument();
    expect(within(eventCard).getByText(
      '17 Oct: 3:00 PM–6:00 PM · 18 Oct: 3:00 PM–6:00 PM'
    )).toBeInTheDocument();
  });
});
