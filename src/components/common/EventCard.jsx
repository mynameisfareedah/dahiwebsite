import { Link } from 'react-router-dom';
import { resolveRegistrationState } from '../../utils/registration';
import { getEventTypeLabel } from '../../constants/eventTypes';

function EventCard({
  eventId,
  title,
  eventType,
  date,
  time,
  speaker,
  description,
  image,
  buttonLabel = 'Register Now',
  buttonHref = null,
  registrationEnabled,
  registrationStatus,
  registrationUrl,
  registrationButtonText,
}) {
  const registrationState = resolveRegistrationState(
    {
      registrationEnabled,
      registrationStatus,
      registrationUrl: registrationUrl || buttonHref,
      registrationButtonText: registrationButtonText || buttonLabel,
    },
    'Register Now'
  );
  const normalizedHref = typeof registrationState.href === 'string' ? registrationState.href.trim() : '';
  const isInternalLink = normalizedHref.startsWith('/');
  const detailsHref = eventId == null || eventId === '' ? null : `/events/${encodeURIComponent(eventId)}`;
  const eventTypeLabel = eventType ? getEventTypeLabel(eventType) : null;

  return (
    <article className="soft-card overflow-hidden">
      <div className="flex flex-col gap-6 p-4 sm:flex-row sm:items-center sm:p-6">
        <div className="w-full shrink-0 overflow-hidden rounded-[1.25rem] border border-dahiPrimary/20 bg-slate-50 p-2 shadow-sm sm:w-[280px] lg:w-[320px]">
          <img src={image} alt={title} loading="lazy" className="h-56 w-full rounded-[1rem] object-contain bg-white sm:h-72" />
        </div>
        <div className="min-w-0 flex-1 p-2 sm:p-0">
          {eventTypeLabel && eventTypeLabel !== 'Not assigned' ? (
            <span className="inline-flex rounded-full bg-dahiPrimary/10 px-3 py-1 text-xs font-semibold text-dahiPrimary">
              {eventTypeLabel}
            </span>
          ) : null}
          <div className="flex flex-wrap gap-2 text-sm font-semibold text-dahiSecondary">
            <span>{date}</span>
            <span>•</span>
            <span className="min-w-0 break-words">{time}</span>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-dahiPrimary">{speaker}</p>
          <p className="mt-3 text-slate-600">{description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {registrationState.enabled && isInternalLink ? (
              <Link to={normalizedHref} data-event-card-action className="inline-flex rounded-full bg-dahiPrimary px-4 py-2 text-sm font-semibold text-white transition hover:bg-dahiSecondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dahiPrimary">{registrationState.label}</Link>
            ) : registrationState.enabled ? (
              <a href={normalizedHref} target="_blank" rel="noopener noreferrer" data-event-card-action className="inline-flex rounded-full bg-dahiPrimary px-4 py-2 text-sm font-semibold text-white transition hover:bg-dahiSecondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dahiPrimary">{registrationState.label}</a>
            ) : (
              <button
                type="button"
                disabled
                data-event-card-action
                className="inline-flex cursor-not-allowed rounded-full bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-600"
              >
                {registrationState.label}
              </button>
            )}
            {detailsHref && (
              <Link
                to={detailsHref}
                data-event-card-action
                className="inline-flex rounded-full border border-dahiPrimary px-4 py-2 text-sm font-semibold text-dahiPrimary transition hover:bg-dahiPrimary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dahiPrimary"
              >
                View Details
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default EventCard;
