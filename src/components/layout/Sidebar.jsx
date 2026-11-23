import { useCallback, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import NewsletterLink from './NewsletterLink';
import { lockBodyScroll } from '../../utils/bodyScrollLock';

const sidebarLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/team', label: 'Our Story & Team' },
  { to: '/blog', label: 'Blog' },
  { to: '/events', label: 'Events' },
  { to: '/outreach', label: 'Outreach' },
  { to: '/voices', label: 'DAHI Voices' },
  { to: '/resources', label: 'Resources' },
  { to: '/volunteer', label: 'Volunteer' },
  { to: '/contact', label: 'Contact' },
];

function Sidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const toggleButtonRef = useRef(null);
  const sidebarRef = useRef(null);
  const previousPathnameRef = useRef(location.pathname);

  const closeMobileMenu = useCallback(({ restoreFocus = false } = {}) => {
    if (restoreFocus) {
      toggleButtonRef.current?.focus();
    } else if (sidebarRef.current?.contains(document.activeElement)) {
      const mainContent = document.getElementById('main-content');
      if (mainContent) mainContent.focus({ preventScroll: true });
      else toggleButtonRef.current?.focus();
    }

    setMobileOpen(false);
  }, [setMobileOpen]);

  useEffect(() => {
    if (previousPathnameRef.current === location.pathname) return;

    previousPathnameRef.current = location.pathname;
    if (mobileOpen) closeMobileMenu();
  }, [closeMobileMenu, location.pathname, mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;

      closeMobileMenu({ restoreFocus: true });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeMobileMenu, mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const desktopBreakpoint = window.matchMedia('(min-width: 1280px)');
    const closeAtDesktopBreakpoint = (event) => {
      if (!event.matches) return;

      const activeElement = document.activeElement;
      if (activeElement === toggleButtonRef.current || sidebarRef.current?.contains(activeElement)) {
        const activeHref = activeElement.closest('a[href]')?.getAttribute('href');
        const desktopLinks = Array.from(
          document.querySelectorAll('nav[aria-label="Primary navigation"] a[href]'),
        );
        const desktopLink = desktopLinks.find((link) => link.getAttribute('href') === activeHref)
          || desktopLinks.find((link) => link.getAttribute('aria-current') === 'page')
          || desktopLinks[0];

        if (desktopLink) desktopLink.focus({ preventScroll: true });
        else document.getElementById('main-content')?.focus({ preventScroll: true });
      }

      setMobileOpen(false);
    };

    let removeBreakpointListener;
    if (
      typeof desktopBreakpoint.addEventListener === 'function'
      && typeof desktopBreakpoint.removeEventListener === 'function'
    ) {
      desktopBreakpoint.addEventListener('change', closeAtDesktopBreakpoint);
      removeBreakpointListener = () => {
        desktopBreakpoint.removeEventListener('change', closeAtDesktopBreakpoint);
      };
    } else if (
      typeof desktopBreakpoint.addListener === 'function'
      && typeof desktopBreakpoint.removeListener === 'function'
    ) {
      desktopBreakpoint.addListener(closeAtDesktopBreakpoint);
      removeBreakpointListener = () => {
        desktopBreakpoint.removeListener(closeAtDesktopBreakpoint);
      };
    } else {
      const handleResize = () => {
        closeAtDesktopBreakpoint({
          matches: window.matchMedia('(min-width: 1280px)').matches,
        });
      };
      window.addEventListener('resize', handleResize);
      removeBreakpointListener = () => window.removeEventListener('resize', handleResize);
    }

    if (desktopBreakpoint.matches) closeAtDesktopBreakpoint(desktopBreakpoint);

    return removeBreakpointListener;
  }, [mobileOpen, setMobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    return lockBodyScroll();
  }, [mobileOpen]);

  return (
    <>
      {/* Hamburger Button */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
        <NavLink to="/" className="flex shrink-0 items-center gap-3">
          <img src="/logo.jpeg" alt="DAHI logo" loading="lazy" className="h-14 w-auto rounded-lg" />
          <div className="leading-tight">
            <div className="text-2xl font-extrabold text-dahiPrimary">DAHI</div>
            <div className="text-sm font-semibold text-slate-500">Doc Adi Health Initiative</div>
          </div>
        </NavLink>
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 min-[1280px]:flex" aria-label="Primary navigation">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-2 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'text-dahiPrimary'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-dahiPrimary'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <NewsletterLink className="whitespace-nowrap rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-dahiPrimary">
            Newsletter
          </NewsletterLink>
        </nav>
        <NewsletterLink className="hidden shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-dahiPrimary px-4 py-2 text-sm font-semibold text-white transition hover:bg-dahiSecondary min-[1280px]:inline-flex">
          Join Us
        </NewsletterLink>
        <button
          ref={toggleButtonRef}
          onClick={() => {
            if (mobileOpen) closeMobileMenu({ restoreFocus: true });
            else setMobileOpen(true);
          }}
          className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dahiPrimary min-[1280px]:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-sidebar"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 min-[1280px]:hidden"
          onClick={() => closeMobileMenu({ restoreFocus: true })}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        id="mobile-sidebar"
        aria-hidden={!mobileOpen}
        inert={mobileOpen ? undefined : ''}
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 transform border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out min-[1280px]:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Content */}
        <div className="flex flex-col h-full pt-20">
          {/* Logo Section */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-200">
            <img src="/logo.jpeg" alt="DAHI logo" loading="lazy" className="h-14 w-auto rounded-lg" />
            <div className="leading-tight">
              <div className="text-2xl font-extrabold text-dahiPrimary">DAHI</div>
              <div className="text-sm font-medium text-slate-500">Doc Adi Health Initiative</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-4 py-6 md:px-4">
            <ul className="space-y-2">
              {sidebarLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    onClick={() => closeMobileMenu({ restoreFocus: location.pathname === link.to })}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-lg font-semibold text-sm transition ${
                        isActive
                          ? 'bg-dahiPrimary/10 text-dahiPrimary'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <NewsletterLink
                  onClick={() => closeMobileMenu({ restoreFocus: true })}
                  className="block rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-dahiPrimary"
                >
                  Newsletter
                </NewsletterLink>
              </li>
            </ul>
          </nav>

          {/* External Links & CTA Section */}
          <div className="border-t border-slate-200 px-4 py-4 space-y-3">
            <NewsletterLink
              onClick={() => closeMobileMenu({ restoreFocus: true })}
              className="flex items-center justify-center gap-2 rounded-lg bg-dahiPrimary px-4 py-3 font-semibold text-white transition hover:bg-dahiSecondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dahiPrimary"
            >
              Join Us
              <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </NewsletterLink>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
