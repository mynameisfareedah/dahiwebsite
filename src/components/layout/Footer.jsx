import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="mt-12 text-slate-300">
      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-dahiAccent/90 to-dahiPrimary/90 py-6">
        <div className="flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-3xl">📅</span>
            <div>
              <div className="font-bold text-white">August Community Health Outreach 2026</div>
              <div className="text-xs text-white/90 sm:text-sm">Registration opening soon. Join us for health education & community engagement.</div>
            </div>
          </div>
          <Link
            to="/outreach"
            className="flex-shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold text-dahiPrimary transition hover:bg-white/90 sm:text-sm"
          >
            Learn More About Outreach
          </Link>
        </div>
      </div>

      {/* Footer Content */}
      <div className="border-t border-slate-200 bg-slate-900 py-10">
        <div className="flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:justify-between lg:px-0">
          <div className="max-w-xl">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="DAHI logo" loading="lazy" className="h-16 w-auto rounded-lg" />
              <span className="text-3xl font-extrabold text-white">DAHI</span>
            </Link>
            <p className="mt-4 text-slate-400">Empowering Muslim women through trusted health education, community, and evidence-based resources.</p>
          </div>
          <div className="space-y-3">
            <div className="font-semibold text-white">Connect with us</div>
            <div className="flex flex-wrap gap-3">
              <a href="mailto:docadi.healthinitiative@gmail.com" className="text-slate-300 transition hover:text-white">Email</a>
              <a href="https://whatsapp.com/channel/0029VbBdF4hLI8YZRabyWF0j" target="_blank" rel="noopener noreferrer" className="text-slate-300 transition hover:text-white">WhatsApp</a>
              <a href="https://www.facebook.com/share/1A8VVfnJyr" target="_blank" rel="noopener noreferrer" className="text-slate-300 transition hover:text-white">Facebook</a>
              <a href="https://www.instagram.com/docadihealthintiative_?igsh=YmtnbW1hZnp6MWFz" target="_blank" rel="noopener noreferrer" className="text-slate-300 transition hover:text-white">Instagram</a>
              <a href="https://youtube.com/@dahi-01?si=b54Rt5TiEc5Yvb7q" target="_blank" rel="noopener noreferrer" className="text-slate-300 transition hover:text-white">YouTube</a>
              <Link to="/volunteer" className="text-slate-300 transition hover:text-white">Volunteer</Link>
              <Link to="/contact" className="text-slate-300 transition hover:text-white">Contact</Link>
            </div>
            <p className="text-sm text-slate-300">© 2026 Doc Adi Health Initiative. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
