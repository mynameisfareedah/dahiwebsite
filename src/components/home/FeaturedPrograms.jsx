import { focusAreas } from '../../data/siteContent';

function FeaturedPrograms() {
  return (
    <section id="our-focus-areas" className="section-shell max-w-7xl">
      <div className="mb-8 w-full max-w-full">
        <span className="eyebrow">What We Cover</span>
        <h2 className="mt-4 section-title">Our Focus Areas</h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">Trusted health education to help women understand their bodies, make informed decisions, and navigate every stage of life with confidence.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {focusAreas.map((item) => (
          <article key={item.title} className="soft-card p-7">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${item.accent || 'bg-dahiPrimary/10 text-dahiPrimary'}`}><i className={item.icon || 'fa-solid fa-heart-pulse'}></i></div>
            <h3 className="mt-5 text-xl font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-3 text-slate-600">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FeaturedPrograms;
