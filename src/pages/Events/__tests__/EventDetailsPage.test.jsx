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
    expect(screen.queryByRole('heading', { name: 'Beyond the Classroom: A Reflection from Doc Adi' })).not.toBeInTheDocument();
    expect(screen.getByText('17–18 October 2026')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('TBA')).toBeInTheDocument();
      expect(screen.getByText('15:30')).toBeInTheDocument();
    });
    expect(screen.getByText('17 October 2026:')).toBeInTheDocument();
    expect(screen.getByText('18 October 2026:')).toBeInTheDocument();
  });

  it('shows the Event Type label and a saved start/end time range', async () => {
    getEventById.mockResolvedValueOnce({
      data: {
        id: 'fibroids-event',
        title: 'Uterine Fibroids: Understanding Your Options',
        description: 'A two-hour online session.',
        event_type: 'masterclass',
        category: null,
        event_date: '2026-12-06',
        start_time: '11:00',
        event_schedule: [
          { date: '2026-12-06', time: '11:00', end_time: '13:00' },
        ],
        location: 'ONLINE',
        status: 'draft',
      },
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/events/fibroids-event']}>
        <Routes>
          <Route path="/events/:id" element={<EventDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Masterclasses')).toBeInTheDocument();
    expect(screen.getByText('11:00 AM–1:00 PM')).toBeInTheDocument();
  });

  it('shows Doc Adi’s linked reflection only on the Aberdeen event details page', async () => {
    getEventById.mockResolvedValueOnce({
      data: {
        id: 'aberdeen-outreach',
        title: 'Teenage Menstruation Education Outreach',
        description: 'Menstrual health education for teenage Muslim girls.',
        event_date: '2026-11-17',
        start_time: '18:30',
        location: 'Masjid Alhikmah and Community Centre, Aberdeen',
        status: 'published',
        registration_enabled: false,
      },
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/events/aberdeen-outreach']}>
        <Routes>
          <Route path="/events/:id" element={<EventDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    const heading = await screen.findByRole('heading', {
      name: 'Beyond the Classroom: A Reflection from Doc Adi',
    });
    const reflection = heading.closest('article');
    expect(reflection).toHaveClass('p-6', 'sm:p-8', 'lg:p-10');
    expect(reflection.querySelector('footer')).toHaveClass('flex-col', 'sm:flex-row');
    expect(screen.getByText(/receiving health education does not always mean understanding it/)).toBeInTheDocument();
    expect(screen.getByText(/creating safe spaces where girls can ask questions without shame/)).toBeInTheDocument();
    expect(screen.getByText('Dr Adiyat Olamide Dele-Salawu, GP and Founder, Doc Adi Health Initiative.')).toBeInTheDocument();

    const articleLink = screen.getByRole('link', { name: /Read Doc Adi's LinkedIn article/ });
    expect(articleLink).toHaveAttribute('href', 'https://lnkd.in/p/ePtyDdqh');
    expect(articleLink).toHaveAttribute('target', '_blank');
    expect(articleLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
