import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getEventById = vi.hoisted(() => vi.fn());

vi.mock('../../../services/supabase/eventsService', () => ({
  getEventById,
}));

import EventDetailsPage from '../EventDetailsPage';

describe('EventDetailsPage scheduling display', () => {
  beforeEach(() => {
    getEventById.mockResolvedValue({
      data: {
        id: 'quiz-event',
        title: 'DAHI Online Quiz',
        description: 'A two-day educational quiz.',
        event_date: '2026-10-17',
        event_end_date: '2026-10-18',
        event_schedule: [
          { date: '2026-10-17', time: null },
          { date: '2026-10-18', time: '15:30:00' },
        ],
        status: 'published',
        registration_enabled: false,
      },
      error: null,
    });
  });

  it('shows the date range and each session time, including TBA', async () => {
    render(
      <MemoryRouter initialEntries={['/events/quiz-event']}>
        <Routes>
          <Route path="/events/:id" element={<EventDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('DAHI Online Quiz')).toBeInTheDocument();
    expect(screen.getByText('17–18 October 2026')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('TBA')).toBeInTheDocument();
      expect(screen.getByText('15:30')).toBeInTheDocument();
    });
    expect(screen.getByText('17 October 2026:')).toBeInTheDocument();
    expect(screen.getByText('18 October 2026:')).toBeInTheDocument();
  });
});
