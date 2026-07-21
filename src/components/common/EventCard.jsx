import { Link } from 'react-router-dom';
import { resolveRegistrationState } from '../../utils/registration';

function EventCard({
  title,
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

  return (
    <article className="soft-card overflow-hidden">
      <div className="flex flex-col gap-6 p-4 sm:flex-row sm:items-center sm:p-6">
        <div className="w-full shrink-0 overflow-hidden rounded-[1.25rem] border border-dahiPrimary/20 bg-slate-50 p-2 shadow-sm sm:w-[280px] lg:w-[320px]">
          <img src={image} alt={title} loading="lazy" className="h-56 w-full rounded-[1rem] object-contain bg-white sm:h-72" />
        </div>
        <div className="min-w-0 flex-1 p-2 sm:p-0">
          <div className="flex flex-wrap gap-2 text-sm font-semibold text-dahiSecondary">
            <span>{date}</span>
            <span>•</span>
            <span>{time}</span>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-dahiPrimary">{speaker}</p>
          <p className="mt-3 text-slate-600">{description}</p>
          {registrationState.enabled && isInternalLink ? (
            <Link to={normalizedHref} className="mt-6 inline-flex rounded-full bg-dahiPrimary px-4 py-2 text-sm font-semibold text-white transition hover:bg-dahiSecondary">{registrationState.label}</Link>
          ) : registrationState.enabled ? (
            <a href={normalizedHref} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex rounded-full bg-dahiPrimary px-4 py-2 text-sm font-semibold text-white transition hover:bg-dahiSecondary">{registrationState.label}</a>
          ) : (
            <div className="mt-6">
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed rounded-full bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-600"
              >
                {registrationState.label}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default EventCard;
