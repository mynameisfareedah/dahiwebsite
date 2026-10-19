import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import OutreachPhotoLoop, { outreachPhotos } from '../OutreachPhotoLoop';
import UpcomingOutreachSection from '../UpcomingOutreachSection';

const styles = readFileSync(resolve('src', 'styles', 'index.css'), 'utf8');

describe('OutreachPhotoLoop', () => {
  it('features one photograph between two secondary photographs and includes all 17 optimized images', () => {
    render(<OutreachPhotoLoop />);

    expect(outreachPhotos).toHaveLength(17);
    expect(new Set(outreachPhotos.map((image) => image.source)).size).toBe(17);
    expect(new Set(outreachPhotos.map((image) => image.src)).size).toBe(17);

    outreachPhotos.forEach((image) => {
      expect(existsSync(resolve('public', image.source.slice(1)))).toBe(true);
      expect(existsSync(resolve('public', image.src.slice(1)))).toBe(true);
    });

    expect(document.querySelectorAll('.outreach-photo-loop__card')).toHaveLength(3);
    expect(document.querySelector('.outreach-photo-loop__card--side-left')).toHaveAccessibleName(`Open larger view: ${outreachPhotos[16].caption}`);
    expect(document.querySelector('.outreach-photo-loop__card--featured')).toHaveAccessibleName(`Open larger view: ${outreachPhotos[0].caption}`);
    expect(document.querySelector('.outreach-photo-loop__card--featured')).toHaveAttribute('aria-current', 'true');
    expect(document.querySelector('.outreach-photo-loop__card--side-right')).toHaveAccessibleName(`Open larger view: ${outreachPhotos[1].caption}`);
    expect(document.querySelector('.outreach-photo-loop__track')).toHaveAttribute('data-paused', 'false');
    expect(outreachPhotos.map((image) => image.caption)).toContain('Outreach Educational Materials');
    expect(outreachPhotos.map((image) => image.caption)).toContain('Prepared Outreach Care Packages');
    expect(styles).toContain('.outreach-photo-loop__card--featured');
    expect(styles).toContain('.outreach-photo-loop__card--side-left');
    expect(styles).toContain('transition:');
    expect(styles).toContain('object-fit: contain');
  });

  it('automatically advances the featured photograph and supports manual navigation', () => {
    vi.useFakeTimers();
    const { unmount } = render(<OutreachPhotoLoop />);

    try {
      const incomingCard = document.querySelector('.outreach-photo-loop__card--side-right');
      expect(document.querySelector('.outreach-photo-loop__card--featured')).toHaveAccessibleName(`Open larger view: ${outreachPhotos[0].caption}`);
      act(() => vi.advanceTimersByTime(5000));
      expect(document.querySelector('.outreach-photo-loop__card--featured')).toHaveAccessibleName(`Open larger view: ${outreachPhotos[1].caption}`);
      expect(document.querySelector('.outreach-photo-loop__card--featured')).toBe(incomingCard);

      fireEvent.click(screen.getByRole('button', { name: 'Show next outreach photograph' }));
      expect(document.querySelector('.outreach-photo-loop__card--featured')).toHaveAccessibleName(`Open larger view: ${outreachPhotos[2].caption}`);
      fireEvent.click(screen.getByRole('button', { name: 'Show previous outreach photograph' }));
      expect(document.querySelector('.outreach-photo-loop__card--featured')).toHaveAccessibleName(`Open larger view: ${outreachPhotos[1].caption}`);
    } finally {
      unmount();
      vi.useRealTimers();
    }
  });

  it('pauses and resumes automatic advancement using the accessible control', () => {
    vi.useFakeTimers();
    const { unmount } = render(<OutreachPhotoLoop />);

    try {
      fireEvent.click(screen.getByRole('button', { name: 'Pause photo animation' }));
      expect(screen.getByRole('button', { name: 'Resume photo animation' })).toHaveAttribute('aria-pressed', 'true');
      expect(document.querySelector('.outreach-photo-loop__track')).toHaveAttribute('data-paused', 'true');
      act(() => vi.advanceTimersByTime(10000));
      expect(document.querySelector('.outreach-photo-loop__card--featured')).toHaveAccessibleName(`Open larger view: ${outreachPhotos[0].caption}`);

      fireEvent.click(screen.getByRole('button', { name: 'Resume photo animation' }));
      expect(screen.getByRole('button', { name: 'Pause photo animation' })).toHaveAttribute('aria-pressed', 'false');
      act(() => vi.advanceTimersByTime(5000));
      expect(document.querySelector('.outreach-photo-loop__card--featured')).toHaveAccessibleName(`Open larger view: ${outreachPhotos[1].caption}`);
    } finally {
      unmount();
      vi.useRealTimers();
    }
  });

  it('opens a larger image and closes with the close control or Escape', async () => {
    const user = userEvent.setup();
    render(<OutreachPhotoLoop />);

    await user.click(screen.getByRole('button', { name: `Open larger view: ${outreachPhotos[0].caption}` }));
    const dialog = screen.getByRole('dialog', { name: outreachPhotos[0].caption });
    expect(within(dialog).getByRole('img', { name: outreachPhotos[0].alt })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(document.activeElement).toHaveAccessibleName(`Open larger view: ${outreachPhotos[0].caption}`);

    await user.click(screen.getByRole('button', { name: `Open larger view: ${outreachPhotos[0].caption}` }));
    await user.click(screen.getByRole('button', { name: 'Close expanded outreach photograph' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('removes images that fail to load and shows an explicit empty state if all are unavailable', () => {
    render(<OutreachPhotoLoop />);

    outreachPhotos.forEach(() => {
      const imageElement = document.querySelector('.outreach-photo-loop__card--featured img');
      fireEvent.error(imageElement);
    });

    expect(screen.getByRole('status')).toHaveTextContent('Outreach photographs are temporarily unavailable.');
    expect(document.querySelector('.outreach-photo-loop__track')).not.toBeInTheDocument();
  });

  it('disables automatic transitions for reduced-motion users', () => {
    render(<OutreachPhotoLoop />);

    expect(styles).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.outreach-photo-loop__card\s*\{[^}]*transition:\s*none/);
    expect(styles).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.outreach-photo-loop__card--side-left,[\s\S]*?visibility:\s*hidden/);
    expect(document.querySelector('.outreach-photo-loop__viewport')).toHaveAttribute('role', 'region');
  });

  it('stops automatic advancement and keeps manual navigation when reduced motion is requested', () => {
    vi.useFakeTimers();
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn(() => ({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    const { unmount } = render(<OutreachPhotoLoop />);

    try {
      expect(screen.queryByRole('button', { name: 'Pause photo animation' })).not.toBeInTheDocument();
      act(() => vi.advanceTimersByTime(10000));
      expect(document.querySelector('.outreach-photo-loop__card--featured')).toHaveAccessibleName(`Open larger view: ${outreachPhotos[0].caption}`);
      fireEvent.click(screen.getByRole('button', { name: 'Show next outreach photograph' }));
      expect(document.querySelector('.outreach-photo-loop__card--featured')).toHaveAccessibleName(`Open larger view: ${outreachPhotos[1].caption}`);
    } finally {
      unmount();
      window.matchMedia = originalMatchMedia;
      vi.useRealTimers();
    }
  });

  it('keeps the existing outreach description, date, location, and calls to action', () => {
    render(
      <MemoryRouter>
        <UpcomingOutreachSection />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Our First Community Health Outreach' })).toBeInTheDocument();
    expect(screen.getByText(/successfully held its first community health outreach in Gwagwalada/)).toBeInTheDocument();
    expect(screen.getByText('August 15, 2026')).toBeInTheDocument();
    expect(screen.getByText('Gwagwalada, Abuja')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read About Our Outreach' })).toHaveAttribute('href', '/outreach');
    expect(screen.getByRole('link', { name: 'Support Future Outreach' })).toHaveAttribute('href', '/contact');
  });
});
