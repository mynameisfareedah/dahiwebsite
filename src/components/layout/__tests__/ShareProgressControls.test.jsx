import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ShareProgressControls from '../ShareProgressControls';

function replaceProperty(target, property, value) {
  const descriptor = Object.getOwnPropertyDescriptor(target, property);
  Object.defineProperty(target, property, { configurable: true, writable: true, value });
  return () => {
    if (descriptor) Object.defineProperty(target, property, descriptor);
    else delete target[property];
  };
}

describe('ShareProgressControls', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses native sharing when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const clipboardWriteText = vi.fn();
    const restoreShare = replaceProperty(window.navigator, 'share', share);
    const restoreClipboard = replaceProperty(window.navigator, 'clipboard', { writeText: clipboardWriteText });

    try {
      render(<ShareProgressControls />);
      fireEvent.click(screen.getByRole('button', { name: 'Share this page' }));

      await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Page shared.'));
      expect(share).toHaveBeenCalledWith({ title: document.title, url: window.location.href });
      expect(clipboardWriteText).not.toHaveBeenCalled();
    } finally {
      restoreShare();
      restoreClipboard();
    }
  });

  it('copies the current URL when native sharing is unavailable', async () => {
    const clipboardWriteText = vi.fn().mockResolvedValue(undefined);
    const restoreShare = replaceProperty(window.navigator, 'share', undefined);
    const restoreClipboard = replaceProperty(window.navigator, 'clipboard', { writeText: clipboardWriteText });

    try {
      render(<ShareProgressControls />);
      fireEvent.click(screen.getByRole('button', { name: 'Share this page' }));

      await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Page link copied.'));
      expect(clipboardWriteText).toHaveBeenCalledWith(window.location.href);
    } finally {
      restoreShare();
      restoreClipboard();
    }
  });

  it('falls back to the legacy clipboard when clipboard permission is denied', async () => {
    const clipboardWriteText = vi.fn().mockRejectedValue(new Error('Clipboard permission denied'));
    const execCommand = vi.fn(() => true);
    const restoreShare = replaceProperty(window.navigator, 'share', undefined);
    const restoreClipboard = replaceProperty(window.navigator, 'clipboard', { writeText: clipboardWriteText });
    const restoreExecCommand = replaceProperty(document, 'execCommand', execCommand);

    try {
      render(<ShareProgressControls />);
      fireEvent.click(screen.getByRole('button', { name: 'Share this page' }));

      await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Page link copied.'));
      expect(execCommand).toHaveBeenCalledWith('copy');
    } finally {
      restoreShare();
      restoreClipboard();
      restoreExecCommand();
    }
  });

  it('scrolls back to the top and respects reduced motion', () => {
    const restoreMatchMedia = replaceProperty(window, 'matchMedia', vi.fn(() => ({ matches: true })));
    const scrollTo = vi.fn();
    const restoreScrollTo = replaceProperty(window, 'scrollTo', scrollTo);

    try {
      render(<ShareProgressControls />);
      fireEvent.click(screen.getByRole('button', { name: /Back to top/ }));
      expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    } finally {
      restoreMatchMedia();
      restoreScrollTo();
    }
  });

  it('supports keyboard activation for Share and Back to Top', async () => {
    const user = userEvent.setup();
    const share = vi.fn().mockResolvedValue(undefined);
    const restoreShare = replaceProperty(window.navigator, 'share', share);
    const restoreMatchMedia = replaceProperty(window, 'matchMedia', vi.fn(() => ({ matches: false })));
    const scrollTo = vi.fn();
    const restoreScrollTo = replaceProperty(window, 'scrollTo', scrollTo);

    try {
      render(<ShareProgressControls />);

      await user.tab();
      expect(screen.getByRole('button', { name: 'Share this page' })).toHaveFocus();
      await user.keyboard('{Enter}');
      await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Page shared.'));

      await user.tab();
      expect(screen.getByRole('button', { name: /Back to top/ })).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    } finally {
      restoreShare();
      restoreMatchMedia();
      restoreScrollTo();
    }
  });
});
