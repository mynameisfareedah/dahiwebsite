import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Sparkles } from 'lucide-react';
import SectionHeading from '../common/SectionHeading';
import { completedOutreach } from '../../data/siteContent';

function UpcomingOutreachSection() {
  return (
    <section className="section-shell max-w-7xl space-y-8">
      <div className="flex flex-col gap-6 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 sm:flex-row sm:items-stretch sm:gap-8 sm:p-8">
        <div className="relative w-full shrink-0 self-start overflow-hidden rounded-[1.25rem] border border-dahiPrimary/20 bg-slate-50 p-2 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:w-[55%]">
          <img
            src={completedOutreach.bannerImage}
            alt="August Community Health Outreach"
            width="905"
            height="1280"
            loading="lazy"
            className="w-full max-w-full rounded-[1.25rem] object-contain bg-white h-auto"
          />
          <div className="absolute left-4 bottom-4 rounded-full bg-dahiPrimary px-4 py-2 text-center backdrop-blur">
            <div className="text-sm font-bold text-white">Completed</div>
            <div className="text-xs font-semibold text-white">First DAHI outreach</div>
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-col justify-between space-y-6 sm:w-[52%]">
          <SectionHeading
            eyebrow="Completed August 15, 2026"
            title={completedOutreach.title}
            description={completedOutreach.subtitle}
          />

          <div className="flex-1 space-y-4 rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 flex-shrink-0 text-dahiPrimary" />
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">{completedOutreach.theme}</p>
            </div>

            <p className="text-lg leading-8 text-slate-600">{completedOutreach.description}</p>

            <div className="space-y-3 text-slate-700">
              <div className="flex items-start gap-3 rounded-[1rem] bg-slate-50 p-3">
                <CalendarDays className="mt-1 h-5 w-5 flex-shrink-0 text-dahiPrimary" />
                <div>
                  <div className="font-semibold text-slate-900">{completedOutreach.dateRange}</div>
                  <div className="text-sm text-slate-600">Event Date</div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-[1rem] bg-slate-50 p-3">
                <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-dahiPrimary" />
                <div>
                  <div className="font-semibold text-slate-900">{completedOutreach.location}</div>
                  <div className="text-sm text-slate-600">Venue</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/outreach"
                className="inline-flex items-center justify-center rounded-full bg-dahiPrimary px-6 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary"
                aria-label="Read about DAHI’s completed first community outreach"
              >
                Read About Our Outreach
              </Link>
              <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-dahiPrimary px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:bg-dahiPrimary/5">Support Future Outreach</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UpcomingOutreachSection;
