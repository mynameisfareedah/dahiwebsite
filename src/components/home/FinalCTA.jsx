import { Link } from 'react-router-dom';

function FinalCTA() {
  return (
    <section className="section-shell mx-auto max-w-7xl">
      <div className="soft-card overflow-hidden bg-gradient-to-r from-dahiPrimary to-dahiSecondary p-8 text-white sm:p-10">
        <div className="max-w-3xl">
          <span className="eyebrow bg-white/15 text-white">Continue the journey</span>
          <h2 className="mt-4 text-3xl font-black">Explore more of DAHI</h2>
          <p className="mt-4 text-lg leading-8 text-white/90">Whether you want to learn more about our mission, join an event, browse resources, or support our work, there is a place for you in the DAHI community.</p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/about" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">Learn More</Link>
          <Link to="/events" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Register for Upcoming Events</Link>
          <Link to="/resources" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Explore Resources</Link>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
