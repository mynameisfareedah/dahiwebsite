import { testimonials } from '../../data/siteContent';

function Testimonials() {
  return (
    <section className="section-shell max-w-7xl">
      <div className="mb-8 max-w-3xl">
        <span className="eyebrow">Testimonials</span>
        <h2 className="mt-4 section-title">What participants say about DAHI events</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {testimonials.map((item, index) => (
          <article key={index} className="soft-card p-7">
            <div className="text-dahiAccent"><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i></div>
            <p className="mt-4 text-lg leading-8 text-slate-600">"{item.quote}"</p>
            <p className="mt-5 font-semibold text-slate-900">{item.name || 'DAHI Participant'}</p>
            {item.role && <p className="text-sm text-slate-500">{item.role}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
