import { afterEach, describe, expect, it } from 'vitest';
import { lockBodyScroll } from '../bodyScrollLock';

describe('lockBodyScroll', () => {
  let previousOverflow;

  afterEach(() => {
    document.body.style.overflow = previousOverflow;
  });

  it.each([[0, 1], [1, 0]])(
    'restores the original overflow only after both locks release in order %i, %i',
    (firstRelease, secondRelease) => {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'auto';
      const unlock = [lockBodyScroll(), lockBodyScroll()];

      try {
        expect(document.body.style.overflow).toBe('hidden');

        unlock[firstRelease]();
        expect(document.body.style.overflow).toBe('hidden');

        unlock[secondRelease]();
        expect(document.body.style.overflow).toBe('auto');
      } finally {
        unlock.forEach((release) => release());
      }
    },
  );

  it('makes each release idempotent and preserves the pre-existing inline value', () => {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'scroll';
    const release = lockBodyScroll();

    try {
      release();
      release();

      expect(document.body.style.overflow).toBe('scroll');
    } finally {
      release();
    }
  });
});
