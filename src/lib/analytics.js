export const analyticsEnabled = Boolean(import.meta.env.VITE_GA_ID || import.meta.env.VITE_CLARITY_ID);

export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return;

  if (window.gtag) {
    window.gtag('event', eventName, params);
  }

  if (window.clarity) {
    window.clarity('event', eventName);
  }
}

export function trackPageView(pathname = window.location.pathname) {
  if (typeof window === 'undefined') return;

  if (window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_ID, {
      page_path: pathname,
    });
  }
}
