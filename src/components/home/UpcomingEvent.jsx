import { Link } from 'react-router-dom';

function UpcomingEvent() {
  return (
    <section id="events" className="section-shell mx-auto max-w-7xl">
      <div className="mb-8 max-w-3xl">
        <span className="eyebrow">Upcoming Event</span>
        <h2 className="mt-4 section-title">Next event at DAHI</h2>
        <p className="mt-4 text-lg leading-8 text-slate-600">Stay connected with our upcoming educational program and community conversation.</p>
      </div>

      <div className="soft-card overflow-hidden">
        <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
          <img src="/WEBINARS.jpg" alt="Upcoming DAHI event" loading="lazy" className="h-72 w-full rounded-[1.25rem] object-cover" />
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-dahiPrimary/10 px-3 py-1 text-sm font-semibold text-dahiPrimary">Live Webinar</span>
              <span className="rounded-full bg-dahiSecondary/10 px-3 py-1 text-sm font-semibold text-dahiSecondary">Community Workshop</span>
            </div>
            <h3 className="mt-4 text-3xl font-black text-slate-900">Women’s Health Education Webinar</h3>
            <p className="mt-3 text-lg leading-8 text-slate-600">Join us for an informative session designed to support women with trusted guidance, practical advice, and meaningful conversation.</p>
            <div className="mt-4 space-y-2 text-slate-600">
              <p><span className="font-semibold text-slate-900">Date:</span> To be announced</p>
              <p><span className="font-semibold text-slate-900">Time:</span> To be announced</p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="https://forms.gle/joTjf3VYW9anCA9MA" target="_blank" rel="noopener" className="inline-flex items-center justify-center rounded-full bg-dahiPrimary px-6 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary">Register</a>
              <Link to="/events" className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-dahiPrimary hover:text-dahiPrimary">View All Events</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UpcomingEvent;
