import SupabaseContent from '../common/SupabaseContent';

function FeaturedPrograms() {
  return (
    <section id="our-focus-areas" className="section-shell mx-auto max-w-7xl">
      <div className="mb-8 max-w-3xl">
        <span className="eyebrow">Our Focus Areas</span>
        <h2 className="mt-4 section-title">Our Focus Areas</h2>
        <p className="mt-4 text-lg leading-8 text-slate-600">DAHI helps women and young girls understand their bodies, make informed health decisions, and navigate every stage of life with confidence through trusted education and community engagement.</p>
      </div>

      <SupabaseContent
        table="programs"
        emptyMessage="Programs will appear here once content is published."
        render={(items) => (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="soft-card p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-dahiPrimary/10 text-xl text-dahiPrimary"><i className="fa-solid fa-heart-pulse"></i></div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        )}
      />
    </section>
  );
}

export default FeaturedPrograms;
