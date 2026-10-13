import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ContactPage from '../ContactPage';
import Footer from '../../../components/layout/Footer';

function renderInRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('public contact destinations', () => {
  it('uses the approved official email and phone on the Contact page', () => {
    renderInRouter(<ContactPage />);

    const emailLink = screen.getByRole('link', { name: /email us/i });
    const phoneLink = screen.getByRole('link', { name: /call now/i });

    expect(emailLink).toHaveAttribute('href', 'mailto:Docadi.healthintiative@gmail.com');
    expect(emailLink).not.toHaveAttribute('target');
    expect(phoneLink).toHaveAttribute('href', 'tel:+447726558809');
    expect(phoneLink).not.toHaveAttribute('target');
    expect(screen.getByText('Phone: +44 7726 558809')).toBeInTheDocument();

    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    expect(emailLinks.length).toBeGreaterThan(1);
    emailLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', 'mailto:Docadi.healthintiative@gmail.com');
      expect(link).not.toHaveAttribute('target');
    });
  });

  it('keeps footer Contact internal and Footer Email pointed to the official address', () => {
    renderInRouter(<Footer />);

    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute(
      'href',
      'mailto:Docadi.healthintiative@gmail.com',
    );
  });

  it('keeps external contact-card destinations in a safe new tab', () => {
    renderInRouter(<ContactPage />);

    const whatsappLink = screen.getByRole('link', { name: /join channel/i });

    expect(whatsappLink).toHaveAttribute(
      'href',
      'https://whatsapp.com/channel/0029VbBdF4hLI8YZRabyWF0j',
    );
    expect(whatsappLink).toHaveAttribute('target', '_blank');
    expect(whatsappLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.queryByRole('link', { name: /linkedin/i })).not.toBeInTheDocument();
  });
});
