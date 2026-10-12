import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import NewsletterSection from '../NewsletterSection';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('NewsletterSection community preferences', () => {
  it('submits selected preferences as separate arrays and keeps both groups optional', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ accepted: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter>
        <NewsletterSection />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Join the DAHI Community' })).toBeInTheDocument();

    const updatesDisclosure = screen.getByText('Updates and activities').closest('details');
    const healthDisclosure = screen.getByText('Health interests').closest('details');
    expect(updatesDisclosure).not.toHaveAttribute('open');
    expect(healthDisclosure).not.toHaveAttribute('open');

    await user.click(updatesDisclosure.querySelector('summary'));
    await user.click(healthDisclosure.querySelector('summary'));
    await user.click(screen.getByLabelText('Webinars and events'));
    await user.click(screen.getByLabelText('Community outreach updates'));
    await user.click(screen.getByLabelText('Menstrual health'));
    await user.click(screen.getByLabelText('Nutrition and healthy living'));
    await user.type(screen.getByLabelText(/Email address/), 'reader@example.com');
    await user.click(screen.getByLabelText(/I agree to receive DAHI/));
    fireEvent.submit(screen.getByRole('button', { name: 'Subscribe' }).closest('form'));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      email: 'reader@example.com',
      consent: true,
      updateCategories: ['Webinars and events', 'Community outreach updates'],
      healthInterests: ['Menstrual health', 'Nutrition and healthy living'],
    });
    expect(screen.getByRole('status')).toHaveTextContent('Thank you.');
  });
});
