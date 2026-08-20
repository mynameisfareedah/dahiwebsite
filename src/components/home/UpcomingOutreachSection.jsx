import { Link } from 'react-router-dom';
import { CalendarDays, MapPin } from 'lucide-react';
import { completedOutreach } from '../../data/siteContent';

function UpcomingOutreachSection() {
  return (
    <section className="section-shell max-w-7xl">
      <div className="mb-8 max-w-3xl">
        <span className="eyebrow">From Education to Action</span>
        <h2 className="mt-4 section-title">Our First Community Health Outreach</h2>
      </div>
      <div className="grid items-center gap-8 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
        <div className="relative overflow-hidden rounded-[1.25rem] bg-slate-100">
          <img
            src={completedOutreach.bannerImage}
            alt="DAHI community health outreach in Gwagwalada"
            width="1195"
            height="896"
            loading="lazy"
            className="h-full min-h-[280px] w-full object-cover sm:min-h-[360px]"
          />
        </div>
        <div className="space-y-5 p-2 sm:p-4">
          <p className="text-2xl font-semibold leading-tight text-dahiPrimary">{completedOutreach.subtitle}</p>
          <p className="text-lg leading-8 text-slate-600">{completedOutreach.description}</p>
          <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"><CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-dahiPrimary" /><span>August 15, 2026</span></div>
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-dahiPrimary" /><span>Gwagwalada, Abuja</span></div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/outreach" className="inline-flex items-center justify-center rounded-full bg-dahiPrimary px-6 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary">Read About Our Outreach</Link>
            <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-dahiPrimary px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:bg-dahiPrimary/5">Support Future Outreach</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UpcomingOutreachSection;
