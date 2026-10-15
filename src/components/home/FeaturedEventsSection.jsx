import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../common/EventCard';
import SectionHeading from '../common/SectionHeading';
import { getFeaturedEvents } from '../../services/supabase/eventsService';

function FeaturedEventsSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    getFeaturedEvents()
      .then((result) => {
        if (!mounted) return;
        if (result.error) {
          setError(result.error);
          return;
        }
        setEvents(result.data || []);
      })
      .catch((requestError) => {
        if (mounted) setError(requestError);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!loading && !error && events.length === 0) return null;

  return (
    <section className="section-shell max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Featured events"
          title="Featured events at DAHI"
          description="Explore published events selected by DAHI."
        />
        <Link
          to="/events"
          className="inline-flex shrink-0 items-center justify-center rounded-full border border-dahiPrimary px-5 py-2.5 text-sm font-semibold text-dahiPrimary transition hover:bg-dahiPrimary/5"
        >
          View All Events
        </Link>
      </div>

      {loading ? (
        <p role="status" className="rounded-[1.25rem] border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Loading featured events...
        </p>
      ) : error ? (
        <p role="alert" className="rounded-[1.25rem] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          Featured events could not be loaded right now.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {events.map((event) => (
            <EventCard
              key={event.id}
              eventId={event.id}
              title={event.title}
              date={event.date || event.event_date}
              time={event.time || event.start_time}
              speaker={event.speaker || 'DAHI Team'}
              description={event.description}
              image={event.poster_url || event.image || '/WEBINARS.jpg'}
              registrationEnabled={event.registrationEnabled}
              registrationStatus={event.registrationStatus}
              registrationUrl={event.registrationUrl}
              registrationButtonText={event.registrationButtonText}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default FeaturedEventsSection;
