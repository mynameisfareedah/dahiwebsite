import SectionHeading from '../common/SectionHeading';

function PostEventHighlights({ highlights, enabled = false }) {
  if (!enabled || !highlights) return null;

  return (
    <section className="section-shell mx-auto max-w-7xl space-y-8">
      <SectionHeading
        eyebrow="Event Completed"
        title="August Outreach 2026 – Highlights"
        description={`Thank you to all who participated in and supported the August Community Health Outreach. Here's a look at what we accomplished.`}
      />

      {/* Stats */}
      {highlights.totalParticipants && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="soft-card space-y-2 p-8">
            <div className="text-4xl font-black text-dahiPrimary">{highlights.totalParticipants}</div>
            <div className="text-sm font-semibold text-slate-600">Women Reached</div>
          </div>
        </div>
      )}

      {/* Event Highlights */}
      {highlights.highlights && highlights.highlights.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-slate-900">Key Highlights</h3>
          <ul className="space-y-3">
            {highlights.highlights.map((highlight, index) => (
              <li key={index} className="flex items-start gap-3">
                <i className="fa-solid fa-check text-lg text-dahiPrimary flex-shrink-0 mt-1"></i>
                <span className="text-slate-700">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Testimonials */}
      {highlights.testimonials && highlights.testimonials.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-slate-900">What Participants Said</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {highlights.testimonials.map((testimonial, index) => (
              <div key={index} className="soft-card p-6 sm:p-8">
                <p className="text-slate-700">{testimonial}</p>
                <div className="mt-4 flex gap-1 text-dahiAccent">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fa-solid fa-star text-sm"></i>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sponsors */}
      {highlights.sponsors && highlights.sponsors.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-slate-900">Thank You to Our Sponsors</h3>
          <p className="text-slate-600">
            We are grateful to our sponsors who made this outreach possible.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {highlights.sponsors.map((sponsor, index) => (
              <div key={index} className="soft-card p-6 text-center">
                <p className="font-semibold text-slate-900">{sponsor}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default PostEventHighlights;
