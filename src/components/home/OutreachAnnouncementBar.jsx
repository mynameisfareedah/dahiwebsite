import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

function getTimeRemaining(dateString) {
  const now = new Date();
  const targetDate = new Date(`${dateString}T00:00:00`);
  let diff = targetDate.getTime() - now.getTime();
  if (diff < 0) diff = 0;

  const totalSeconds = Math.floor(diff / 1000);
  const weeks = Math.floor(totalSeconds / (7 * 24 * 60 * 60));
  const days = Math.floor((totalSeconds % (7 * 24 * 60 * 60)) / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { weeks, days, hours, minutes, seconds };
}

function formatNumber(value) {
  return value.toString().padStart(2, '0');
}

function OutreachAnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  const [countdown, setCountdown] = useState(getTimeRemaining('2026-08-15'));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getTimeRemaining('2026-08-15'));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (dismissed) return null;

  return (
    <div className="w-full relative overflow-hidden bg-gradient-to-r from-dahiPrimary/90 to-dahiSecondary/90">
      <div className="max-w-7xl px-4 py-3 sm:px-6 lg:px-0">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📢</span>
              <div>
                <p className="text-base font-bold text-white sm:text-lg">DAHI August Community Health Outreach 2026</p>
                <p className="text-sm text-white/90 sm:text-base">Join us this August for a community outreach dedicated to promoting women's health through education, awareness, and preventive healthcare.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-5">
              <div className="rounded-3xl border border-white/20 bg-white/10 p-3 text-center text-white shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5">
                <div className="text-3xl font-black">{formatNumber(countdown.weeks)}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/70">weeks</div>
              </div>
              <div className="rounded-3xl border border-white/20 bg-white/10 p-3 text-center text-white shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5">
                <div className="text-3xl font-black">{formatNumber(countdown.days)}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/70">days</div>
              </div>
              <div className="rounded-3xl border border-white/20 bg-white/10 p-3 text-center text-white shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5">
                <div className="text-3xl font-black">{formatNumber(countdown.hours)}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/70">hours</div>
              </div>
              <div className="rounded-3xl border border-white/20 bg-white/10 p-3 text-center text-white shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5">
                <div className="text-3xl font-black">{formatNumber(countdown.minutes)}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/70">minutes</div>
              </div>
              <div className="rounded-3xl border border-white/20 bg-white/10 p-3 text-center text-white shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5">
                <div className="text-3xl font-black">{formatNumber(countdown.seconds)}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/70">seconds</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <a href="/outreach" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:bg-white/90">
              Learn More About Outreach
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OutreachAnnouncementBar;
