import { impactThemes } from '../../data/siteContent';

function Impact() {
  return (
    <section id="our-impact" className="section-shell max-w-7xl">
      <div className="mb-8 max-w-3xl">
        <span className="eyebrow">Our Impact</span>
        <h2 className="mt-4 section-title">Making women’s health information more accessible, practical, and actionable.</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {impactThemes.map((item) => (
          <article key={item.title} className="border-l-2 border-dahiPrimary/30 py-3 pl-5">
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-dahiSecondary">{item.title}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Impact;
