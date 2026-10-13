import { testimonials } from '../../data/siteContent';

function Testimonials() {
  return (
    <section className="section-shell home-section-band home-section-band--teal max-w-7xl">
      <div className="mb-8 max-w-3xl">
        <span className="eyebrow">Testimonials</span>
        <h2 className="mt-4 section-title">What participants say about DAHI events</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {testimonials.slice(0, 3).map((item, index) => (
          <article key={index} className="home-testimonial-card home-scroll-reveal rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7">
            <span aria-hidden="true" className="home-testimonial-quote">“</span>
            <blockquote className="mt-3 text-base leading-7 text-slate-600">{item.quote}</blockquote>
            {item.name || item.role ? <p className="mt-5 text-sm font-semibold text-slate-900">{item.name || item.role}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
