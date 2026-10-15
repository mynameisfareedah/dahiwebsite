import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import NewsletterLink from './NewsletterLink';

const sidebarLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/team', label: 'Our Story & Team' },
  { to: '/blog', label: 'Blog' },
  { to: '/events', label: 'Events' },
  { to: '/outreach', label: 'Outreach' },
  { to: '/resources', label: 'Resources' },
  { to: '/volunteer', label: 'Volunteer' },
  { to: '/contact', label: 'Contact' },
];

function Sidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation();

  // Close sidebar when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

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
          onClick={() => setMobileOpen(!mobileOpen)}
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
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        id="mobile-sidebar"
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
                  onClick={() => setMobileOpen(false)}
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
              onClick={() => setMobileOpen(false)}
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
