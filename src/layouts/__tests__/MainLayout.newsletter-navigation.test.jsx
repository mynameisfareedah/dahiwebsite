import { afterEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { useEffect, useState } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Link, MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../MainLayout';

vi.mock('../../lib/analytics', () => ({ trackPageView: vi.fn() }));

function DelayedNewsletter() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsVisible(true), 50);
    return () => window.clearTimeout(timeout);
  }, []);

  return isVisible ? (
    <section id="newsletter" tabIndex={-1} className="scroll-mt-24">
      <h1>Newsletter subscription</h1>
    </section>
  ) : null;
}

function renderLayout(initialPath = '/blog', delayedNewsletter = false) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/blog" element={<h1>Blog</h1>} />
          <Route path="/voices" element={<h1>DAHI Voices</h1>} />
          <Route path="/testimonials" element={<Navigate to="/voices" replace />} />
          <Route path="/team" element={<section id="founder" tabIndex={-1} className="scroll-mt-24"><h1>Meet the Founder</h1></section>} />
          <Route path="/about" element={<section id="mission-vision-values" tabIndex={-1} className="scroll-mt-24"><h1>Our Mission, Vision and Core Values</h1></section>} />
          <Route path="/" element={delayedNewsletter ? <DelayedNewsletter /> : (
            <>
              <Link to="/team#founder">Read Her Story</Link>
              <Link to="/about#mission-vision-values">Explore Our Mission &amp; Values</Link>
              <a href="#newsletter">Subscribe for Updates</a>
              <a href="https://chat.whatsapp.com/EF4piOoqYOSIEXlJ6eKX4T" data-whatsapp-action>Join WhatsApp Group</a>
              <a href="https://whatsapp.com/channel/0029VbBdF4hLI8YZRabyWF0j" data-whatsapp-action>Follow WhatsApp Channel</a>
              <section id="newsletter" tabIndex={-1} className="scroll-mt-24">
                <h1>Newsletter subscription</h1>
                <form>
                  <button type="submit">Subscribe</button>
                </form>
              </section>
            </>
          )} />
          <Route path="/contact" element={(
            <form id="contact-form">
              <button type="submit">Send Message</button>
            </form>
          )} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('MainLayout newsletter navigation', () => {
  let originalScrollIntoViewDescriptor;
  let originalMatchMediaDescriptor;
  let originalIntersectionObserverDescriptor;

  afterEach(() => {
    if (originalScrollIntoViewDescriptor) {
      Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
        ...originalScrollIntoViewDescriptor,
      });
      originalScrollIntoViewDescriptor = undefined;
    } else {
      delete window.HTMLElement.prototype.scrollIntoView;
    }
    if (originalMatchMediaDescriptor) {
      Object.defineProperty(window, 'matchMedia', originalMatchMediaDescriptor);
      originalMatchMediaDescriptor = undefined;
    }
    if (originalIntersectionObserverDescriptor) {
      Object.defineProperty(window, 'IntersectionObserver', originalIntersectionObserverDescriptor);
      originalIntersectionObserverDescriptor = undefined;
    } else {
      delete window.IntersectionObserver;
    }
  });

  it('omits the outreach promotional callout on the homepage but retains it on other routes', () => {
    const { unmount } = renderLayout('/');

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Read About Outreach' })).not.toBeInTheDocument();
    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Newsletter' })).toBeInTheDocument();

    unmount();
    renderLayout('/blog');

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read About Outreach' })).toHaveAttribute('href', '/outreach');
  });

  it('shows primary links and the newsletter action at desktop widths while retaining the mobile drawer', () => {
    renderLayout();

    const primaryNavigation = screen.getByRole('navigation', { name: 'Primary navigation' });
    expect(primaryNavigation).toHaveClass('min-[1280px]:flex');
    expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toHaveClass('flex-1');
    expect(screen.getByRole('button', { name: 'Toggle navigation' })).toHaveClass('min-[1280px]:hidden');
    expect(screen.getByRole('button', { name: 'Toggle navigation' })).toHaveAttribute('aria-controls', 'mobile-sidebar');
    const primaryLinks = within(primaryNavigation).getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(primaryLinks).toEqual([
      '/',
      '/about',
      '/team',
      '/blog',
      '/events',
      '/outreach',
      '/voices',
      '/resources',
      '/volunteer',
      '/contact',
      '/#newsletter',
    ]);
    expect(within(primaryNavigation).getByRole('link', { name: 'DAHI Voices' })).toHaveAttribute('href', '/voices');
    expect(screen.getAllByRole('link', { name: 'Join Us' }).some((link) => (
      link.classList.contains('min-[1280px]:inline-flex')
    ))).toBe(true);
  });

  it('navigates to DAHI Voices from the mobile drawer and marks it as the active page', async () => {
    const user = userEvent.setup();
    renderLayout('/');

    await user.click(screen.getByRole('button', { name: 'Toggle navigation' }));
    const mobileNavigation = screen.getByRole('navigation', { name: 'Mobile navigation' });
    const mobileLinks = within(mobileNavigation).getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(mobileLinks).toContain('/voices');
    const voicesLink = within(mobileNavigation).getByRole('link', { name: 'DAHI Voices' });
    voicesLink.focus();
    await user.keyboard('{Enter}');

    expect(await screen.findByRole('heading', { name: 'DAHI Voices' })).toBeInTheDocument();
    expect(within(screen.getByRole('navigation', { name: 'Mobile navigation' }))
      .getByRole('link', { name: 'DAHI Voices' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Toggle navigation' })).toHaveAttribute('aria-expanded', 'false');
    expect(within(screen.getByRole('navigation', { name: 'Primary navigation' }))
      .getByRole('link', { name: 'DAHI Voices' })).toHaveAttribute('aria-current', 'page');
  });

  it('navigates from another route, scrolls to the section, and moves focus', async () => {
    const scrollIntoView = vi.fn();
    originalScrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, 'scrollIntoView');
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    renderLayout();

    fireEvent.click(screen.getByRole('link', { name: 'Subscribe' }));

    const newsletterSection = await screen.findByRole('heading', { name: 'Newsletter subscription' });
    await waitFor(() => expect(document.activeElement).toBe(newsletterSection.parentElement));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('closes the drawer when Newsletter is selected and respects reduced motion', async () => {
    const scrollIntoView = vi.fn();
    originalScrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, 'scrollIntoView');
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    originalMatchMediaDescriptor = Object.getOwnPropertyDescriptor(window, 'matchMedia');
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    renderLayout();

    fireEvent.click(screen.getByRole('button', { name: 'Toggle navigation' }));
    expect(screen.getByRole('button', { name: 'Toggle navigation' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('floating-subscribe-cta')).toHaveAttribute('hidden');
    fireEvent.click(
      within(screen.getByRole('navigation', { name: 'Mobile navigation' }))
        .getByRole('link', { name: 'Newsletter' })
    );

    await screen.findByRole('heading', { name: 'Newsletter subscription' });
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' }));
    expect(screen.getByRole('button', { name: 'Toggle navigation' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('navigates from the footer to the newsletter section', async () => {
    const scrollIntoView = vi.fn();
    originalScrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, 'scrollIntoView');
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    renderLayout();

    fireEvent.click(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Newsletter' }));

    const newsletterHeading = await screen.findByRole('heading', { name: 'Newsletter subscription' });
    await waitFor(() => expect(document.activeElement).toBe(newsletterHeading.parentElement));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('waits for the section to render before scrolling after navigation', async () => {
    const scrollIntoView = vi.fn();
    originalScrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, 'scrollIntoView');
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    renderLayout('/blog', true);

    fireEvent.click(screen.getByRole('link', { name: 'Subscribe' }));

    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' }));
  });

  it('hides the floating Subscribe CTA while it overlaps a form action and restores it afterward', async () => {
    renderLayout('/contact');

    const subscribeLink = screen.getByTestId('floating-subscribe-cta');
    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    const ctaRect = {
      top: 700, bottom: 748, left: 800, right: 936, width: 136, height: 48,
    };
    const overlappingRect = {
      top: 710, bottom: 740, left: 820, right: 890, width: 70, height: 30,
    };
    const clearRect = {
      top: 100, bottom: 140, left: 20, right: 120, width: 100, height: 40,
    };
    vi.spyOn(subscribeLink, 'getBoundingClientRect').mockReturnValue(ctaRect);
    const submitRect = vi.spyOn(submitButton, 'getBoundingClientRect').mockReturnValue(overlappingRect);

    act(() => fireEvent.scroll(window));
    await waitFor(() => expect(subscribeLink).toHaveAttribute('hidden'));

    submitRect.mockReturnValue(clearRect);
    act(() => fireEvent.scroll(window));
    await waitFor(() => expect(subscribeLink).not.toHaveAttribute('hidden'));
  });

  it('hides Share and Back to Top while they overlap a page control', async () => {
    renderLayout('/contact');

    const floatingControls = document.querySelector('.share-progress-controls');
    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    const floatingRect = {
      top: 648, bottom: 752, left: 16, right: 64, width: 48, height: 104,
    };
    const overlappingRect = {
      top: 660, bottom: 690, left: 20, right: 52, width: 32, height: 30,
    };
    const clearRect = {
      top: 100, bottom: 140, left: 20, right: 120, width: 100, height: 40,
    };

    vi.spyOn(floatingControls, 'getBoundingClientRect').mockReturnValue(floatingRect);
    const submitRect = vi.spyOn(submitButton, 'getBoundingClientRect').mockReturnValue(overlappingRect);

    act(() => fireEvent.scroll(window));
    await waitFor(() => expect(floatingControls).toHaveAttribute('hidden'));

    submitRect.mockReturnValue(clearRect);
    act(() => fireEvent.scroll(window));
    await waitFor(() => expect(floatingControls).not.toHaveAttribute('hidden'));
  });

  it('scrolls to the founder section after direct navigation to /team#founder', async () => {
    const scrollIntoView = vi.fn();
    originalScrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, 'scrollIntoView');
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    renderLayout('/team#founder');

    const founderSection = await screen.findByRole('heading', { name: 'Meet the Founder' });
    await waitFor(() => {
      expect(document.activeElement).toBe(founderSection.parentElement);
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    });
  });

  it('scrolls to the founder section when navigating there from the homepage', async () => {
    const scrollIntoView = vi.fn();
    originalScrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, 'scrollIntoView');
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    renderLayout('/');

    fireEvent.click(screen.getByRole('link', { name: 'Read Her Story' }));

    const founderHeading = await screen.findByRole('heading', { name: 'Meet the Founder' });
    await waitFor(() => {
      expect(document.activeElement).toBe(founderHeading.parentElement);
      expect(founderHeading.parentElement).toHaveClass('scroll-mt-24');
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    });
  });

  it('scrolls to the mission and values section from the homepage with the header offset', async () => {
    const scrollIntoView = vi.fn();
    originalScrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, 'scrollIntoView');
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    renderLayout('/');

    fireEvent.click(screen.getByRole('link', { name: 'Explore Our Mission & Values' }));

    const sectionHeading = await screen.findByRole('heading', { name: 'Our Mission, Vision and Core Values' });
    await waitFor(() => {
      expect(document.activeElement).toBe(sectionHeading.parentElement);
      expect(sectionHeading.parentElement).toHaveClass('scroll-mt-24');
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    });
  });

  it.each(['/', '/blog'])('routes Join Us from %s to the community section and closes the drawer', async (initialPath) => {
    const scrollIntoView = vi.fn();
    originalScrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, 'scrollIntoView');
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    renderLayout(initialPath);

    fireEvent.click(screen.getByRole('button', { name: 'Toggle navigation' }));
    expect(screen.getByRole('button', { name: 'Toggle navigation' })).toHaveAttribute('aria-expanded', 'true');

    const joinUsLink = within(document.getElementById('mobile-sidebar'))
      .getByRole('link', { name: 'Join Us' });
    expect(joinUsLink).toHaveAttribute('href', '/#newsletter');
    expect(joinUsLink).not.toHaveAttribute('target');
    expect(joinUsLink.getAttribute('href')).not.toMatch(/^https:/);
    fireEvent.click(joinUsLink);

    const newsletterHeading = await screen.findByRole('heading', { name: 'Newsletter subscription' });
    expect(newsletterHeading.parentElement).toHaveClass('scroll-mt-24');
    await waitFor(() => {
      expect(document.activeElement).toBe(newsletterHeading.parentElement);
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
      expect(screen.getByRole('button', { name: 'Toggle navigation' })).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('hides the floating CTA when the newsletter section enters and leaves view', async () => {
    const observers = [];
    originalIntersectionObserverDescriptor = Object.getOwnPropertyDescriptor(window, 'IntersectionObserver');
    window.IntersectionObserver = class {
      constructor(callback) {
        this.callback = callback;
        observers.push(this);
      }

      observe(target) {
        (this.targets ||= []).push(target);
      }

      disconnect() {}

      setVisible(isIntersecting, target = this.targets[0], intersectionRatio = isIntersecting ? 1 : 0) {
        this.callback([{ isIntersecting, intersectionRatio, target }]);
      }
    };
    renderLayout('/');

    await waitFor(() => expect(observers).toHaveLength(1));
    const subscribeLink = screen.getByTestId('floating-subscribe-cta');
    expect(observers[0].targets[0]).toBe(screen.getByRole('button', { name: 'Subscribe' }));
    observers[0].setVisible(false);
    await waitFor(() => expect(subscribeLink).not.toHaveAttribute('hidden'));
    expect(subscribeLink).not.toHaveStyle({ display: 'none' });

    observers[0].setVisible(true, observers[0].targets[0], 0.25);
    await waitFor(() => expect(subscribeLink).not.toHaveAttribute('hidden'));

    observers[0].setVisible(true, observers[0].targets[0], 1);
    await waitFor(() => expect(subscribeLink).toHaveAttribute('hidden'));
    expect(subscribeLink).toHaveStyle({ display: 'none' });

    observers[0].setVisible(false);
    await waitFor(() => expect(subscribeLink).not.toHaveAttribute('hidden'));
    expect(subscribeLink).not.toHaveStyle({ display: 'none' });
  });

  it('keeps Subscribe available when IntersectionObserver is unsupported', async () => {
    originalIntersectionObserverDescriptor = Object.getOwnPropertyDescriptor(window, 'IntersectionObserver');
    delete window.IntersectionObserver;
    renderLayout('/');

    await waitFor(() => {
      expect(screen.getByTestId('floating-subscribe-cta')).not.toHaveAttribute('hidden');
    });
  });

  it('hides the floating CTA while either WhatsApp action is visible', async () => {
    const observers = [];
    originalIntersectionObserverDescriptor = Object.getOwnPropertyDescriptor(window, 'IntersectionObserver');
    window.IntersectionObserver = class {
      constructor(callback) {
        this.callback = callback;
        observers.push(this);
      }

      observe(target) {
        (this.targets ||= []).push(target);
      }

      disconnect() {}

      setVisible(isIntersecting, target, intersectionRatio = isIntersecting ? 1 : 0) {
        this.callback([{ isIntersecting, intersectionRatio, target }]);
      }
    };
    renderLayout('/');

    await waitFor(() => expect(observers).toHaveLength(1));
    const subscribeLink = screen.getByTestId('floating-subscribe-cta');
    const groupLink = screen.getByRole('link', { name: 'Join WhatsApp Group' });
    const channelLink = screen.getByRole('link', { name: 'Follow WhatsApp Channel' });
    expect(observers[0].targets).toContain(groupLink);
    expect(observers[0].targets).toContain(channelLink);
    act(() => observers[0].setVisible(false, observers[0].targets[0], 0));
    await waitFor(() => expect(subscribeLink).not.toHaveAttribute('hidden'));

    act(() => observers[0].setVisible(true, groupLink, 0.1));
    await waitFor(() => expect(subscribeLink).toHaveAttribute('hidden'));

    act(() => observers[0].setVisible(false, groupLink, 0));
    await waitFor(() => expect(subscribeLink).not.toHaveAttribute('hidden'));

    act(() => observers[0].setVisible(true, channelLink, 0.1));
    await waitFor(() => expect(subscribeLink).toHaveAttribute('hidden'));
  });

  it('restores the original header layout and keeps the floating CTA accessible', () => {
    renderLayout('/');

    const header = document.querySelector('.fixed.top-0.left-0.right-0');
    expect(header).toHaveClass('px-4');
    expect(within(header).queryByRole('link', { name: 'Subscribe' })).not.toBeInTheDocument();
    expect(within(header).getByRole('button', { name: 'Toggle navigation' })).toBeInTheDocument();
    expect(screen.getByTestId('floating-subscribe-cta')).toHaveAttribute('href', '/#newsletter');
  });

  it('hides the floating CTA while the Contact form submit button is visible', async () => {
    const observers = [];
    originalIntersectionObserverDescriptor = Object.getOwnPropertyDescriptor(window, 'IntersectionObserver');
    window.IntersectionObserver = class {
      constructor(callback) {
        this.callback = callback;
        observers.push(this);
      }

      observe(target) {
        (this.targets ||= []).push(target);
      }

      disconnect() {}

      setVisible(isIntersecting, target = this.targets[0], intersectionRatio = isIntersecting ? 1 : 0) {
        this.callback([{ isIntersecting, intersectionRatio, target }]);
      }
    };

    renderLayout('/contact');

    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    const subscribeLink = screen.getByTestId('floating-subscribe-cta');
    await waitFor(() => expect(observers).toHaveLength(1));
    expect(observers[0].targets).toContain(submitButton);
    expect(subscribeLink).not.toHaveAttribute('hidden');

    act(() => observers[0].setVisible(true));
    expect(subscribeLink).toHaveAttribute('hidden');

    act(() => observers[0].setVisible(false));
    expect(subscribeLink).not.toHaveAttribute('hidden');
  });
});
