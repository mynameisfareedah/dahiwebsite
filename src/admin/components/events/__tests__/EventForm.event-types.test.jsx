import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EventForm } from '../EventForm';

describe('EventForm Event Type field', () => {
  it('offers only the approved Event Types without a Category field', () => {
    render(
      <EventForm
        values={{
          title: 'Health event',
          eventType: '',
          description: '',
          date: '',
          endDate: '',
          scheduleMode: 'shared',
          timeStatus: 'tba',
          time: '',
          sessions: [],
          location: '',
          registrationUrl: '',
          registrationButtonText: '',
          registrationEnabled: true,
          registrationStatus: 'open',
          status: 'draft',
          featured: false,
        }}
        errors={{}}
        touched={{}}
        onChange={vi.fn()}
        onBlur={vi.fn()}
        onSubmit={vi.fn()}
        eventTypes={[
          { value: '', label: 'Select Event Type' },
          { value: 'webinar', label: 'Webinars' },
          { value: 'masterclass', label: 'Masterclasses' },
          { value: 'outreach_community', label: 'Outreach & Community' },
          { value: 'quiz_challenge', label: 'Quizzes & Challenges' },
        ]}
        statuses={[{ value: 'draft', label: 'Draft' }]}
        isSubmitting={false}
      />
    );

    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).toHaveValue('');
    expect(document.querySelector('[name="capacity"]')).not.toBeInTheDocument();
    expect(screen.queryByText('Category')).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Webinars' })).toHaveValue('webinar');
    expect(screen.getByRole('option', { name: 'Masterclasses' })).toHaveValue('masterclass');
    expect(screen.getByRole('option', { name: 'Outreach & Community' })).toHaveValue('outreach_community');
    expect(screen.getByRole('option', { name: 'Quizzes & Challenges' })).toHaveValue('quiz_challenge');
  });
});
