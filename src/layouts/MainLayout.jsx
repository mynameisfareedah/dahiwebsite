import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import FloatingSubscribeCTA from '../components/layout/FloatingSubscribeCTA';
import ShareProgressControls from '../components/layout/ShareProgressControls';
import Footer from '../components/layout/Footer';
import { trackPageView } from '../lib/analytics';

function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newsletterVisibility, setNewsletterVisibility] = useState(null);
  const [communityActionsVisibility, setCommunityActionsVisibility] = useState(null);
  const [contactFormVisibility, setContactFormVisibility] = useState(null);
  const [floatingSubscribeCollision, setFloatingSubscribeCollision] = useState(false);
  const [shareProgressCollision, setShareProgressCollision] = useState(false);
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
      const newsletterTarget = document.querySelector(selector);
      const communityTargets = isHomepage
        ? Array.from(document.querySelectorAll('[data-whatsapp-action]'))
        : [];
      const visibilityTargets = [newsletterTarget, ...communityTargets].filter(Boolean);
      if (visibilityTargets.length === 0) return false;

      const visibleTargets = new Set();
      intersectionObserver = new window.IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const isCommunityAction = communityTargets.includes(entry.target);
          const isVisible = entry.isIntersecting
            && (isCommunityAction ? entry.intersectionRatio > 0 : entry.intersectionRatio >= 0.5);
          if (isVisible) visibleTargets.add(entry.target);
          else visibleTargets.delete(entry.target);
        });
        if (isHomepage) {
          setNewsletterVisibility({
            pathname: location.pathname,
            visible: visibleTargets.has(newsletterTarget),
          });
          setCommunityActionsVisibility({
            pathname: location.pathname,
            visible: communityTargets.some((target) => visibleTargets.has(target)),
          });
        } else {
          setContactFormVisibility({
            pathname: location.pathname,
            visible: visibleTargets.has(newsletterTarget),
          });
        }
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
    const intersects = (first, second) => (
      first.left < second.right
      && first.right > second.left
      && first.top < second.bottom
      && first.bottom > second.top
    );

    const updateCollision = () => {
      const subscribe = document.querySelector('[data-floating-subscribe-cta]');
      const shareProgress = document.querySelector('.share-progress-controls');
      const fixedRect = (element, { width, height, side }) => {
        if (!element) return null;

        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        const resolvedWidth = rect.width || width;
        const resolvedHeight = rect.height || height;
        const left = Number.parseFloat(style.left);
        const right = Number.parseFloat(style.right);
        const bottom = Number.parseFloat(style.bottom);
        const x = Number.isFinite(left)
          ? left
          : Number.isFinite(right)
            ? window.innerWidth - right - resolvedWidth
            : side === 'left' ? 16 : window.innerWidth - 16 - resolvedWidth;
        const y = window.innerHeight - (Number.isFinite(bottom) ? bottom : 16) - resolvedHeight;

        return {
          left: rect.width ? rect.left : x,
          right: rect.width ? rect.right : x + resolvedWidth,
          top: rect.height ? rect.top : y,
          bottom: rect.height ? rect.bottom : y + resolvedHeight,
          width: resolvedWidth,
          height: resolvedHeight,
        };
      };
      const subscribeRect = fixedRect(subscribe, { width: 136, height: 48, side: 'right' });
      const shareProgressRect = fixedRect(shareProgress, { width: 48, height: 104, side: 'left' });
      if (!subscribeRect || !shareProgressRect) return;

      const footerRect = document.querySelector('footer')?.getBoundingClientRect();
      const controls = Array.from(document.querySelectorAll(
        'main a[href], main button, main input:not([type="hidden"]), main select, main textarea, header a[href], header button, [role="navigation"] a[href], [role="navigation"] button, button[aria-label="Toggle navigation"]',
      ));
      const controlRects = controls
        .map((control) => control.getBoundingClientRect())
        .filter((rect) => rect.width > 0 && rect.height > 0);
      const overlapsFooter = footerRect
        && footerRect.width > 0
        && footerRect.height > 0
        && intersects(footerRect, subscribeRect);
      const overlapsControl = controlRects.some((rect) => intersects(rect, subscribeRect));
      const shareOverFooter = footerRect
        && footerRect.width > 0
        && footerRect.height > 0
        && intersects(footerRect, shareProgressRect);
      const shareOverControl = controlRects.some((rect) => intersects(rect, shareProgressRect));
      const shareOverSubscribe = intersects(subscribeRect, shareProgressRect);

      setFloatingSubscribeCollision(Boolean(overlapsFooter || overlapsControl));
      setShareProgressCollision(Boolean(shareOverFooter || shareOverControl || shareOverSubscribe));
    };

    let animationFrame = 0;
    const scheduleCollisionUpdate = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updateCollision);
    };
    const mutationObserver = new window.MutationObserver(updateCollision);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    updateCollision();
    window.addEventListener('scroll', scheduleCollisionUpdate, { passive: true });
    window.addEventListener('resize', scheduleCollisionUpdate);

    return () => {
      mutationObserver.disconnect();
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', scheduleCollisionUpdate);
      window.removeEventListener('resize', scheduleCollisionUpdate);
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

  useEffect(() => {
    const anchorRoutes = {
      '/team': '#founder',
      '/about': '#mission-vision-values',
    };
    if (location.hash !== anchorRoutes[location.pathname]) return undefined;

    let mutationObserver;
    const scrollToAnchor = () => {
      const anchorSection = document.querySelector(location.hash);
      if (!anchorSection) return;

      mutationObserver.disconnect();
      anchorSection.focus({ preventScroll: true });
      anchorSection.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    };
    mutationObserver = new window.MutationObserver(scrollToAnchor);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    const animationFrame = window.requestAnimationFrame(scrollToAnchor);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      mutationObserver.disconnect();
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
      <ShareProgressControls hidden={mobileOpen || shareProgressCollision} />
      <FloatingSubscribeCTA
        hidden={
          mobileOpen
          || (location.pathname === '/'
            && newsletterVisibility?.pathname === location.pathname
            && newsletterVisibility.visible)
          || (location.pathname === '/' && communityActionsVisibility?.visible)
          || (location.pathname === '/contact'
            && contactFormVisibility?.pathname === location.pathname
            && contactFormVisibility.visible)
          || floatingSubscribeCollision
        }
      />
    </div>
  );
}

export default MainLayout;
