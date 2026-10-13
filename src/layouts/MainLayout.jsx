import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import FloatingSubscribeCTA from '../components/layout/FloatingSubscribeCTA';
import Footer from '../components/layout/Footer';
import { trackPageView } from '../lib/analytics';

function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newsletterVisibility, setNewsletterVisibility] = useState(null);
  const [contactFormVisibility, setContactFormVisibility] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const isHomepage = location.pathname === '/';
    const isContactPage = location.pathname === '/contact';
    if ((!isHomepage && !isContactPage) || !('IntersectionObserver' in window)) {
      return undefined;
    }

    let intersectionObserver;
    const observeSubmitControl = () => {
      const selector = isHomepage
        ? '#newsletter button[type="submit"]'
        : '#contact-form button[type="submit"]';
      const visibilityTargets = [document.querySelector(selector)].filter(Boolean);
      if (visibilityTargets.length === 0) return false;

      const visibleTargets = new Set();
      intersectionObserver = new window.IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) visibleTargets.add(entry.target);
          else visibleTargets.delete(entry.target);
        });
        const visibility = { pathname: location.pathname, visible: visibleTargets.size > 0 };
        if (isHomepage) setNewsletterVisibility(visibility);
        else setContactFormVisibility(visibility);
      });
      visibilityTargets.forEach((target) => intersectionObserver.observe(target));
      return true;
    };

    const mutationObserver = new window.MutationObserver(() => {
      if (observeSubmitControl()) mutationObserver.disconnect();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    if (observeSubmitControl()) mutationObserver.disconnect();

    return () => {
      mutationObserver.disconnect();
      intersectionObserver?.disconnect();
    };
  }, [location.pathname]);

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== '/' || location.hash !== '#newsletter') return undefined;

    let mutationObserver;
    let layoutObserver;
    let layoutObserverTimeout;
    const scrollToNewsletter = () => {
      const newsletterSection = document.getElementById('newsletter');
      if (!newsletterSection) return;

      mutationObserver.disconnect();
      if (!layoutObserver) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          let previousHeight = mainContent.getBoundingClientRect().height;
          layoutObserver = new window.ResizeObserver(([entry]) => {
            if (entry.contentRect.height === previousHeight) return;
            previousHeight = entry.contentRect.height;
            newsletterSection.scrollIntoView({
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
              block: 'start',
            });
          });
          layoutObserver.observe(mainContent);
          layoutObserverTimeout = window.setTimeout(() => layoutObserver.disconnect(), 3000);
        }
      }

      newsletterSection.focus({ preventScroll: true });
      newsletterSection.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    };
    mutationObserver = new window.MutationObserver(scrollToNewsletter);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    const animationFrame = window.requestAnimationFrame(scrollToNewsletter);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      mutationObserver.disconnect();
      layoutObserver?.disconnect();
      window.clearTimeout(layoutObserverTimeout);
    };
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-700 flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        
        {/* Main Content */}
        <main id="main-content" className="flex-1 w-full pt-20 overflow-hidden" tabIndex="-1">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
      <FloatingSubscribeCTA
        hidden={
          mobileOpen
          || (location.pathname === '/' && (
            newsletterVisibility?.pathname !== location.pathname || newsletterVisibility.visible
          ))
          || (location.pathname === '/contact' && contactFormVisibility?.visible)
        }
      />
    </div>
  );
}

export default MainLayout;
