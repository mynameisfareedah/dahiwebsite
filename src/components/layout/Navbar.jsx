import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/programs', label: 'Programs' },
  { to: '/events', label: 'Events & Activities' },
  { to: '/resources', label: 'Resources' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
];

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="DAHI logo" loading="lazy" className="h-12 w-auto rounded-lg" />
          <div className="leading-tight">
            <div className="text-xl font-black text-dahiPrimary">DAHI</div>
            <div className="text-xs font-medium text-slate-500">Doc Adi Health Initiative</div>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link text-sm font-semibold text-slate-700 transition hover:text-dahiPrimary ${isActive ? 'text-dahiPrimary' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex md:items-center md:gap-4">
          <NavLink
            to="/outreach"
            className="rounded-full border border-dahiAccent px-4 py-2 text-sm font-semibold text-dahiAccent transition hover:bg-dahiAccent/10"
          >
            <i className="fa-solid fa-heart mr-1.5"></i>
            Support Outreach
          </NavLink>
          <a href="https://forms.gle/joTjf3VYW9anCA9MA" target="_blank" rel="noopener" className="inline-flex items-center justify-center rounded-full bg-dahiPrimary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-dahiSecondary">Join Our Community</a>
        </div>

        <button
          id="nav-toggle"
          className="rounded-full border border-slate-200 p-2 text-slate-700 md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label="Open menu"
          onClick={() => setMobileOpen((value) => !value)}
        >
          <i className="fa-solid fa-bars text-lg"></i>
        </button>
      </div>

      <div id="mobile-menu" className={`${mobileOpen ? 'block' : 'hidden'} border-t border-slate-200 bg-white/95 md:hidden`}>
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 ${isActive ? 'bg-slate-100 text-dahiPrimary' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/outreach"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-dahiAccent hover:bg-dahiAccent/10"
            onClick={() => setMobileOpen(false)}
          >
            <i className="fa-solid fa-heart mr-1.5"></i>
            Support Outreach
          </NavLink>
          <a href="https://forms.gle/joTjf3VYW9anCA9MA" target="_blank" rel="noopener" className="mt-2 inline-flex items-center justify-center rounded-full bg-dahiPrimary px-5 py-2.5 text-sm font-semibold text-white">Join Our Community</a>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
