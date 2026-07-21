import { Link, useLocation, useParams } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import LoadingState from '../../components/common/LoadingState';
import SectionHeading from '../../components/common/SectionHeading';
import { useEffect, useState } from 'react';
import { getEventById } from '../../services/supabase/eventsService';
import { resolveRegistrationState } from '../../utils/registration';

function EventDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const seoTitle = event?.title || 'Event Details';
  const seoDescription = event?.description || 'DAHI event details';
  const registrationState = resolveRegistrationState(event, 'Register Now');

  useEffect(() => {
    let mounted = true;

    getEventById(id)
      .then((res) => {
        if (!mounted) return;
        setEvent(res?.data || null);
      })
      .catch(() => {
        if (!mounted) return;
        setEvent(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <>
        <SEO title={seoTitle} description={seoDescription} path={location.pathname} />
        <LoadingState message="Loading event details..." />
      </>
    );
  }

  if (!event) {
    return (
      <>
        <SEO title="Event not found" description="This event may have been removed or is not available right now." path={location.pathname} />
        <section className="section-shell max-w-5xl space-y-6">
          <SectionHeading eyebrow="Event" title="Event not found" description="This event may have been removed or is not available right now." />
          <Link to="/events" className="inline-flex items-center justify-center rounded-full bg-dahiPrimary px-6 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary">
            Back to Events
          </Link>
        </section>
      </>
    );
  }

  return (
    <>
      <SEO title={seoTitle} description={seoDescription} path={location.pathname} />
      <section className="section-shell mx-auto max-w-5xl space-y-8">
        <SectionHeading
          eyebrow="Event details"
          title={event.title || 'Event'}
          description={event.description || 'Details for this DAHI event.'}
        />

        <div className="soft-card overflow-hidden">
          <img
            src={event.poster_url || event.image || '/WEBINARS.jpg'}
            alt={event.title || 'Event poster'}
            loading="lazy"
            className="h-72 w-full object-contain bg-slate-50 p-4"
          />
          <div className="space-y-4 p-6 sm:p-8">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-dahiSecondary">Date</div>
                <div className="mt-1 font-semibold text-slate-900">{event.event_date || event.date || 'TBC'}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-dahiSecondary">Time</div>
                <div className="mt-1 font-semibold text-slate-900">{event.start_time || event.time || 'TBC'}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-dahiSecondary">Location</div>
                <div className="mt-1 font-semibold text-slate-900">{event.location || 'To be announced'}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {registrationState.enabled ? (
                <a href={registrationState.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full bg-dahiPrimary px-6 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary">
                  {registrationState.label}
                </a>
              ) : (
                <button type="button" disabled className="inline-flex cursor-not-allowed items-center justify-center rounded-full bg-slate-300 px-6 py-3 text-sm font-semibold text-slate-600">
                  {registrationState.label}
                </button>
              )}
              <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-dahiPrimary hover:text-dahiPrimary">
                Ask a Question
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default EventDetailsPage;
