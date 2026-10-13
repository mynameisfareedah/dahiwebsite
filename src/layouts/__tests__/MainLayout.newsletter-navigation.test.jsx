import { afterEach, describe, expect, it, vi } from 'vitest';
import { useEffect, useState } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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
          <Route path="/" element={delayedNewsletter ? <DelayedNewsletter /> : (
            <>
              <a href="#newsletter">Subscribe for Updates</a>
              <section id="newsletter" tabIndex={-1} className="scroll-mt-24">
                <h1>Newsletter subscription</h1>
                <form>
                  <button type="submit">Subscribe</button>
                </form>
              </section>
            </>
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
    fireEvent.click(within(screen.getByRole('navigation')).getByRole('link', { name: 'Newsletter' }));

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

    const joinUsLink = screen.getByRole('link', { name: 'Join Us' });
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

  it('restores the original header layout and keeps the floating CTA accessible', () => {
    renderLayout('/');

    const header = document.querySelector('.fixed.top-0.left-0.right-0');
    expect(header).toHaveClass('px-4');
    expect(within(header).queryByRole('link', { name: 'Subscribe' })).not.toBeInTheDocument();
    expect(within(header).getByRole('button', { name: 'Toggle navigation' })).toBeInTheDocument();
    expect(screen.getByTestId('floating-subscribe-cta')).toHaveAttribute('href', '/#newsletter');
  });
});
