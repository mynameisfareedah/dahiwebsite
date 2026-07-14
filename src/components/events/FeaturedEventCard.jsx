import EventPoster from './EventPoster';
import EventDetails from './EventDetails';
import EventCTAButton from './EventCTAButton';

function FeaturedEventCard({ event, reverse = false, showSecondary = false }) {
  const details = (
    <EventDetails
      title={event.title}
      category={event.category}
      date={event.date}
      venue={event.venue || event.location || event.time}
      description={event.description}
      buttonLabel={event.buttonLabel}
      buttonHref={event.buttonHref}
      secondaryLabel={showSecondary ? 'Learn More' : undefined}
      secondaryHref={showSecondary ? '/outreach' : undefined}
      onSecondaryClick={showSecondary ? () => window.location.assign('/outreach') : undefined}
    />
  );

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-6">
      <div className={`grid gap-6 lg:grid-cols-2 lg:items-center ${reverse ? 'lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1' : ''}`}>
        <div className="flex h-full items-center">
          <EventPoster image={event.image} alt={event.title} className="w-full" />
        </div>
        <div className="flex h-full items-center">{details}</div>
      </div>
    </article>
  );
}

export default FeaturedEventCard;
