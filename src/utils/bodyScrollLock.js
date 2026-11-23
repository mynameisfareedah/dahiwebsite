const activeLocks = new Set();
let originalOverflow;

export function lockBodyScroll() {
  const lockToken = Symbol('body-scroll-lock');

  if (activeLocks.size === 0) {
    originalOverflow = document.body.style.overflow;
  }

  activeLocks.add(lockToken);
  document.body.style.overflow = 'hidden';

  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeLocks.delete(lockToken);

    if (activeLocks.size === 0) {
      document.body.style.overflow = originalOverflow;
      originalOverflow = undefined;
    }
  };
}
