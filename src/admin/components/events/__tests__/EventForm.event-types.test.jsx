import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EventForm } from '../EventForm';

describe('EventForm Event Type field', () => {
  it('keeps Category separate and offers all approved Event Types', () => {
    render(
      <EventForm
        values={{
          title: 'Health event',
          category: 'health',
          eventType: '',
          description: '',
          date: '',
          time: '',
          capacity: '0',
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
        categories={[{ value: 'health', label: 'Health' }]}
        eventTypes={[
          { value: '', label: 'Select Event Type' },
          { value: 'webinar', label: 'Webinars' },
          { value: 'masterclass', label: 'Masterclasses' },
          { value: 'outreach_community', label: 'Outreach & Community' },
        ]}
        statuses={[{ value: 'draft', label: 'Draft' }]}
        isSubmitting={false}
      />
    );

    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).toHaveValue('health');
    expect(selects[1]).toHaveValue('');
    expect(screen.getByRole('option', { name: 'Webinars' })).toHaveValue('webinar');
    expect(screen.getByRole('option', { name: 'Masterclasses' })).toHaveValue('masterclass');
    expect(screen.getByRole('option', { name: 'Outreach & Community' })).toHaveValue('outreach_community');
  });
});
