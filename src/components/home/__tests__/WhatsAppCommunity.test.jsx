import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Footer from '../../layout/Footer';
import GetInvolved from '../GetInvolved';

const whatsappGroupUrl = 'https://chat.whatsapp.com/EF4piOoqYOSIEXlJ6eKX4T';
const whatsappChannelUrl = 'https://whatsapp.com/channel/0029VbBdF4hLI8YZRabyWF0j';

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('WhatsApp community links', () => {
  it('provides distinct, safely opened Group and Channel actions in Get Involved', () => {
    renderWithRouter(<GetInvolved />);

    const section = screen.getByRole('heading', { name: 'Get Involved with DAHI' }).closest('section');
    const groupLink = within(section).getByRole('link', { name: 'Join WhatsApp Group' });
    const channelLink = within(section).getByRole('link', { name: 'Follow WhatsApp Channel' });

    expect(groupLink).toHaveAttribute('href', whatsappGroupUrl);
    expect(groupLink).toHaveAttribute('target', '_blank');
    expect(groupLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(channelLink).toHaveAttribute('href', whatsappChannelUrl);
    expect(channelLink).toHaveAttribute('target', '_blank');
    expect(channelLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(groupLink).not.toBe(channelLink);
    expect(within(section).getAllByRole('link', { name: 'Join WhatsApp Group' })).toHaveLength(1);
  });

  it('includes separate Group and Channel destinations in the footer', () => {
    renderWithRouter(<Footer />);

    const footer = screen.getByRole('contentinfo');
    const groupLink = within(footer).getByRole('link', { name: 'WhatsApp Group' });
    const channelLink = within(footer).getByRole('link', { name: 'WhatsApp Channel' });

    expect(groupLink).toHaveAttribute('href', whatsappGroupUrl);
    expect(groupLink).toHaveAttribute('target', '_blank');
    expect(groupLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(channelLink).toHaveAttribute('href', whatsappChannelUrl);
    expect(channelLink).toHaveAttribute('target', '_blank');
    expect(channelLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(within(footer).getByRole('link', { name: 'Newsletter' })).toHaveAttribute('href', '/#newsletter');
    expect(within(footer).getAllByRole('link', { name: 'WhatsApp Group' })).toHaveLength(1);
  });
});
