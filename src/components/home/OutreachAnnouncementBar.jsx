import { useState } from 'react';
import { X } from 'lucide-react';

function OutreachAnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="w-full relative overflow-hidden bg-gradient-to-r from-dahiPrimary/90 to-dahiSecondary/90">
      <div className="flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-0">
        <div className="flex flex-1 items-center gap-3">
          <span className="text-2xl">📢</span>
          <div>
            <p className="text-sm font-bold text-white">Registration Opening Soon – DAHI August Community Health Outreach 2026</p>
            <p className="hidden text-xs text-white/90 sm:block">Join us this August for a community outreach dedicated to promoting women's health through education, awareness, and preventive healthcare.</p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          <a href="/outreach" className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-dahiPrimary transition hover:bg-white/90 sm:text-sm">
            Learn More About Outreach
          </a>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-full p-1.5 text-white transition hover:bg-white/20"
            aria-label="Dismiss announcement"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default OutreachAnnouncementBar;
