import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import EventCard from '../EventCard';

function renderEventCard(props = {}) {
  return render(
    <MemoryRouter>
      <EventCard
        title="Women's Health Webinar"
        date="2026-08-01"
        time="10:00"
        speaker="DAHI Team"
        description="A public health event."
        image="/WEBINARS.jpg"
        {...props}
      />
    </MemoryRouter>
  );
}

describe('EventCard', () => {
  it('links to the internal event detail page when an event ID is available', () => {
    renderEventCard({ eventId: 'event 123' });

    expect(screen.getByRole('link', { name: 'View Details' })).toHaveAttribute(
      'href',
      '/events/event%20123'
    );
  });

  it('keeps closed registration disabled while retaining event details navigation', () => {
    renderEventCard({
      eventId: 'event-123',
      registrationEnabled: true,
      registrationStatus: 'closed',
      registrationUrl: 'https://example.com/register',
    });

    expect(screen.getByRole('button', { name: 'Registration Closed' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'View Details' })).toHaveAttribute(
      'href',
      '/events/event-123'
    );
  });
});
