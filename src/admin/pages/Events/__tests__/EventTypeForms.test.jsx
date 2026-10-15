import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  addToast: vi.fn(),
  createEvent: vi.fn(),
  getEventById: vi.fn(),
  updateEvent: vi.fn(),
}));

vi.mock('../../../hooks/useDataManagement', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useToast: () => ({ addToast: mocks.addToast }),
  };
});

vi.mock('../../../services/eventService', () => ({
  eventService: {
    createEvent: mocks.createEvent,
    getEventById: mocks.getEventById,
    updateEvent: mocks.updateEvent,
    uploadPoster: vi.fn(),
  },
  getEventImageUrl: vi.fn(() => null),
}));

vi.mock('../../../components/events/EventImageUploader', () => ({
  EventImageUploader: () => null,
}));

import CreateEvent from '../CreateEvent';
import EditEvent from '../EditEvent';

const changeField = (container, name, value) => {
  fireEvent.change(container.querySelector(`[name="${name}"]`), {
    target: { value },
  });
};

function renderCreateEvent() {
  return render(
    <MemoryRouter initialEntries={['/admin/events/create']}>
      <Routes>
        <Route path="/admin/events/create" element={<CreateEvent />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderEditEvent() {
  return render(
    <MemoryRouter initialEntries={['/admin/events/edit/event-1']}>
      <Routes>
        <Route path="/admin/events/edit/:id" element={<EditEvent />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('admin Event Type forms', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SUPABASE_EVENT_TYPE_SCHEMA_READY', 'true');
    mocks.createEvent.mockResolvedValue({ success: true, data: { id: 'created-1' } });
    mocks.getEventById.mockResolvedValue({
      success: true,
      data: {
        id: 'event-1',
        title: 'Existing health event',
        description: 'Historical event',
        category: 'wellness',
        event_type: 'masterclass',
        date: '2026-11-10',
        time: '10:00',
        location: 'DAHI',
        capacity: 25,
        status: 'published',
        registrationEnabled: false,
        registrationStatus: 'closed',
        featured: false,
      },
    });
    mocks.updateEvent.mockResolvedValue({ success: true, data: { id: 'event-1' } });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('creates with a required Event Type and no Category form value', async () => {
    const { container } = renderCreateEvent();
    const eventType = container.querySelector('[name="eventType"]');

    expect(eventType).toBeRequired();
    expect(screen.getByRole('option', { name: 'Webinars' })).toHaveValue('webinar');
    expect(screen.getByRole('option', { name: 'Masterclasses' })).toHaveValue('masterclass');
    expect(screen.getByRole('option', { name: 'Outreach & Community' })).toHaveValue('outreach_community');
    expect(screen.getByRole('option', { name: 'Quizzes & Challenges' })).toHaveValue('quiz_challenge');
    expect(container.querySelector('[name="category"]')).toBeNull();

    changeField(container, 'title', 'New webinar');
    changeField(container, 'eventType', 'webinar');
    changeField(container, 'date', '2026-11-10');
    changeField(container, 'time', '10:00');
    changeField(container, 'location', 'DAHI');
    changeField(container, 'capacity', '25');
    fireEvent.click(container.querySelector('[name="featured"]'));
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => expect(mocks.createEvent).toHaveBeenCalledOnce());
    expect(mocks.createEvent.mock.calls[0][0]).toMatchObject({
      eventType: 'webinar',
      featured: true,
    });
    expect(mocks.createEvent.mock.calls[0][0]).not.toHaveProperty('category');
  });

  it('creates a quiz announcement with its participation URL and featured status', async () => {
    const { container } = renderCreateEvent();

    changeField(container, 'title', 'DAHI Educational Quiz');
    changeField(container, 'eventType', 'quiz_challenge');
    changeField(container, 'date', '2026-11-10');
    changeField(container, 'time', '10:00');
    changeField(container, 'location', 'Online');
    changeField(container, 'capacity', '25');
    changeField(container, 'registrationUrl', 'https://example.com/quiz');
    fireEvent.click(container.querySelector('[name="featured"]'));
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => expect(mocks.createEvent).toHaveBeenCalledOnce());
    expect(mocks.createEvent.mock.calls[0][0]).toMatchObject({
      eventType: 'quiz_challenge',
      date: '2026-11-10',
      time: '10:00',
      registrationUrl: 'https://example.com/quiz',
      featured: true,
      status: 'draft',
    });
  });

  it('rejects a create form without an Event Type', async () => {
    const { container } = renderCreateEvent();

    changeField(container, 'title', 'Event without a type');
    changeField(container, 'date', '2026-11-10');
    changeField(container, 'time', '10:00');
    changeField(container, 'location', 'DAHI');
    changeField(container, 'capacity', '25');
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => expect(screen.getByText('Event Type is required')).toBeInTheDocument());
    expect(mocks.createEvent).not.toHaveBeenCalled();
  });

  it('loads and safely updates the existing Event Type without a Category form value', async () => {
    const { container } = renderEditEvent();
    await waitFor(() => expect(container.querySelector('[name="eventType"]')).not.toBeNull());
    const eventType = container.querySelector('[name="eventType"]');

    expect(mocks.getEventById).toHaveBeenCalledWith('event-1');
    await waitFor(() => expect(eventType).toHaveValue('masterclass'));
    expect(container.querySelector('[name="category"]')).toBeNull();

    changeField(container, 'eventType', 'outreach_community');
    fireEvent.click(container.querySelector('[name="featured"]'));
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => expect(mocks.updateEvent).toHaveBeenCalledOnce());
    expect(mocks.updateEvent.mock.calls[0][1]).toMatchObject({
      eventType: 'outreach_community',
      featured: true,
    });
    expect(mocks.updateEvent.mock.calls[0][1]).not.toHaveProperty('category');
  });

  it('edits an existing event to the quiz type', async () => {
    const { container } = renderEditEvent();
    await waitFor(() => expect(container.querySelector('[name="eventType"]')).not.toBeNull());

    changeField(container, 'eventType', 'quiz_challenge');
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => expect(mocks.updateEvent).toHaveBeenCalledOnce());
    expect(mocks.updateEvent.mock.calls[0][1]).toMatchObject({
      eventType: 'quiz_challenge',
      featured: false,
    });
    expect(mocks.updateEvent.mock.calls[0][1]).not.toHaveProperty('category');
  });

  it('rejects clearing Event Type while editing when the schema is ready', async () => {
    const { container } = renderEditEvent();
    await waitFor(() => expect(container.querySelector('[name="eventType"]')).toHaveValue('masterclass'));

    changeField(container, 'eventType', '');
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => expect(screen.getByText('Event Type is required')).toBeInTheDocument());
    expect(mocks.updateEvent).not.toHaveBeenCalled();
  });
});
