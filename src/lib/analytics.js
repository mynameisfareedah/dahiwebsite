import ReactGA from 'react-ga4';

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
let analyticsInitialized = false;

export function initializeAnalytics() {
  if (!measurementId || analyticsInitialized || typeof window === 'undefined') {
    return;
  }

  ReactGA.initialize(measurementId);
  analyticsInitialized = true;
}

export function trackPageView(path = window.location.pathname) {
  if (!measurementId || typeof window === 'undefined') {
    return;
  }

  if (!analyticsInitialized) {
    initializeAnalytics();
  }

  ReactGA.send({ hitType: 'pageview', page: path });
}
