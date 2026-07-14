import { CalendarDays, MapPin } from 'lucide-react';

function EventDetails({ title, category, date, venue, description, buttonLabel, buttonHref, secondaryLabel, secondaryHref, onSecondaryClick }) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
          {category ? (
            <span className="rounded-full bg-dahiPrimary/10 px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-dahiPrimary">
              {category}
            </span>
          ) : null}
        </div>

        <div className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3 rounded-[1rem] bg-slate-50 p-3">
            <CalendarDays className="mt-0.5 h-5 w-5 flex-shrink-0 text-dahiPrimary" />
            <div>
              <div className="font-semibold text-slate-900">{date}</div>
              <div className="text-slate-600">Date</div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-[1rem] bg-slate-50 p-3">
            <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-dahiPrimary" />
            <div>
              <div className="font-semibold text-slate-900">{venue}</div>
              <div className="text-slate-600">Venue</div>
            </div>
          </div>
        </div>

        <p className="text-sm leading-7 text-slate-600">{description}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {buttonLabel && buttonHref ? (
          <button type="button" className="inline-flex items-center justify-center rounded-full bg-dahiPrimary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-dahiSecondary">
            {buttonLabel}
          </button>
        ) : null}
        {secondaryLabel ? (
          <button type="button" onClick={onSecondaryClick} className="inline-flex items-center justify-center rounded-full border border-dahiPrimary px-5 py-2.5 text-sm font-semibold text-dahiPrimary transition hover:bg-dahiPrimary/5">
            {secondaryLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default EventDetails;
