import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  addToast: vi.fn(),
  getEventById: vi.fn(),
}));

vi.mock('../../../hooks/useDataManagement', () => ({
  useToast: () => ({ addToast: mocks.addToast }),
}));

vi.mock('../../../services/eventService', () => ({
  eventService: {
    getEventById: mocks.getEventById,
  },
  getEventImageUrl: vi.fn(() => null),
}));

import EventDetails from '../EventDetails';

describe('admin EventDetails', () => {
  beforeEach(() => {
    mocks.getEventById.mockResolvedValue({
      success: true,
      data: {
        id: 'fibroids-event',
        title: 'Uterine Fibroids: Understanding Your Options',
        event_type: 'masterclass',
        category: null,
        event_date: '2026-12-06',
        start_time: '11:00',
        event_schedule: [
          { date: '2026-12-06', time: '11:00', end_time: '13:00' },
        ],
        location: 'ONLINE',
        status: 'draft',
        featured: false,
        poster_url: null,
      },
    });
  });

  it('uses the saved Event Type as the empty Category display and shows session time ranges', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/events/fibroids-event']}>
        <Routes>
          <Route path="/admin/events/:id" element={<EventDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Masterclasses')).toBeInTheDocument();
    expect(screen.getByText('11:00 AM–1:00 PM')).toBeInTheDocument();
  });
});
