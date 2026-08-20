import { testimonials } from '../../data/siteContent';

function Testimonials() {
  return (
    <section className="section-shell max-w-7xl">
      <div className="mb-8 max-w-3xl">
        <span className="eyebrow">Testimonials</span>
        <h2 className="mt-4 section-title">What participants say about DAHI events</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {testimonials.slice(0, 3).map((item, index) => (
          <article key={index} className="border-t border-slate-200 pt-5">
            <p className="text-base leading-7 text-slate-600">&quot;{item.quote}&quot;</p>
            {item.name || item.role ? <p className="mt-5 text-sm font-semibold text-slate-900">{item.name || item.role}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
