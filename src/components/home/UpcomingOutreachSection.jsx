import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Sparkles } from 'lucide-react';
import SectionHeading from '../common/SectionHeading';
import { upcomingOutreach } from '../../data/siteContent';
import { useEffect, useState } from 'react';
import { getUpcomingEvents } from '../../services/supabase/eventsService';
import LoadingState from '../common/LoadingState';
import { resolveRegistrationState } from '../../utils/registration';

function UpcomingOutreachSection() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getUpcomingEvents(1)
      .then((res) => {
        if (!mounted) return;
        if (res.error) {
          setEvent(null);
          return;
        }
        setEvent((res.data && res.data[0]) || null);
      })
      .catch(() => setEvent(null))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const source = event || upcomingOutreach;
  const registrationState = resolveRegistrationState(source, 'Register Now');

  if (loading) {
    return <LoadingState />;
  }

  return (
    <section className="section-shell max-w-7xl space-y-8">
      <div className="flex flex-col gap-6 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 sm:flex-row sm:items-stretch sm:gap-8 sm:p-8">
        <div className="relative min-h-[280px] w-full shrink-0 overflow-hidden rounded-[1.25rem] border border-dahiPrimary/20 bg-slate-50 p-2 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:w-[48%] sm:min-h-[360px]">
          <picture>
            <source
              srcSet="/outreach-poster-640.webp 640w, /outreach-poster-960.webp 960w"
              sizes="(max-width: 640px) calc(100vw - 48px), (max-width: 1024px) 48vw, 542px"
              type="image/webp"
            />
            <img
              src={upcomingOutreach.bannerImage}
              alt="August Community Health Outreach"
              width="905"
              height="1280"
              loading="lazy"
              className="h-[300px] w-full rounded-[1.25rem] object-contain bg-white sm:h-[400px]"
            />
          </picture>
          {!registrationState.enabled && (
            <div className="absolute right-4 top-4 rounded-full bg-dahiPrimary px-4 py-2 text-center backdrop-blur">
              <div className="text-sm font-bold text-white">Registration</div>
              <div className="text-xs font-semibold text-white">{registrationState.label}</div>
            </div>
          )}
        </div>

        <div className="flex w-full min-w-0 flex-col justify-between space-y-6 sm:w-[52%]">
          <SectionHeading
            eyebrow="Coming This August"
            title="Upcoming Community Outreach"
          />

          <div className="flex-1 space-y-4 rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 flex-shrink-0 text-dahiPrimary" />
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">{upcomingOutreach.theme}</p>
            </div>

            <div className="space-y-3 text-slate-700">
              <div className="flex items-start gap-3 rounded-[1rem] bg-slate-50 p-3">
                <CalendarDays className="mt-1 h-5 w-5 flex-shrink-0 text-dahiPrimary" />
                <div>
                  <div className="font-semibold text-slate-900">Saturday, 15 August 2026</div>
                  <div className="text-sm text-slate-600">Event Date</div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-[1rem] bg-slate-50 p-3">
                <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-dahiPrimary" />
                <div>
                  <div className="font-semibold text-slate-900">Gwagwalada, Abuja, Nigeria</div>
                  <div className="text-sm text-slate-600">Venue</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/outreach"
                className="inline-flex items-center justify-center rounded-full bg-dahiPrimary px-6 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary"
                aria-label="Learn more about the upcoming community outreach event"
              >
                Learn More About the Outreach Event
              </Link>
              {registrationState.enabled ? (
                <a
                  href={registrationState.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-dahiSecondary px-6 py-3 text-sm font-semibold text-white transition hover:bg-dahiPrimary"
                >
                  {registrationState.label}
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex cursor-not-allowed items-center justify-center rounded-full bg-slate-300 px-6 py-3 text-sm font-semibold text-slate-600"
                >
                  {registrationState.label}
                </button>
              )}
              <button
                type="button"
                onClick={() => document.getElementById('support-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center rounded-full border border-dahiPrimary px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:bg-dahiPrimary/5"
              >
                Support This Outreach
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UpcomingOutreachSection;
