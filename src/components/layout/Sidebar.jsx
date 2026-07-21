import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const sidebarLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/events', label: 'Events' },
  { to: '/resources', label: 'Resources' },
  { to: '/donate', label: 'Donate' },
  { to: '/volunteer', label: 'Volunteer' },
  { to: '/contact', label: 'Contact' },
];

const externalLinks = [
  { href: 'https://forms.gle/joTjf3VYW9anCA9MA', label: 'Join Us', icon: 'fa-arrow-right' },
];

function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close sidebar when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Hamburger Button */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur px-4 py-4">
        <NavLink to="/" className="flex items-center gap-2">
          <img src="/logo.jpeg" alt="DAHI logo" loading="lazy" className="h-10 w-auto rounded-lg" />
          <div className="leading-tight">
            <div className="text-lg font-black text-dahiPrimary">DAHI</div>
            <div className="text-xs font-medium text-slate-500">Health Initiative</div>
          </div>
        </NavLink>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Content */}
        <div className="flex flex-col h-full pt-20">
          {/* Logo Section */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-200">
            <img src="/logo.jpeg" alt="DAHI logo" loading="lazy" className="h-12 w-auto rounded-lg" />
            <div className="leading-tight">
              <div className="text-lg font-black text-dahiPrimary">DAHI</div>
              <div className="text-xs font-medium text-slate-500">Doc Adi Health Initiative</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 md:px-4">
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
            </ul>
          </nav>

          {/* External Links & CTA Section */}
          <div className="border-t border-slate-200 px-4 py-4 space-y-3">
            {externalLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg bg-dahiPrimary px-4 py-3 font-semibold text-white transition hover:bg-dahiSecondary"
              >
                {link.label}
                <i className={`fa-solid ${link.icon}`}></i>
              </a>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
