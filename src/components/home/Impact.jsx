import { impactStats } from '../../data/siteContent';

function Impact() {
  return (
    <section id="our-impact" className="section-shell max-w-7xl">
      <div className="mb-8 max-w-3xl">
        <span className="eyebrow">Our Impact</span>
        <h2 className="mt-4 section-title">Growing a strong, informed community of Muslim women</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {impactStats.map((item) => (
          <article key={item.title} className="stat-card soft-card p-7">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-dahiPrimary/10 text-2xl text-dahiPrimary"><i className="fa-solid fa-users"></i></div>
            <h3 className="mt-5 text-3xl font-black text-dahiPrimary">{item.value}</h3>
            <p className="mt-2 text-lg font-semibold text-slate-900">{item.title}</p>
            <p className="mt-2 text-slate-600">{item.description}</p>
          </article>
        ))}
      </div>

      <p className="mt-8 w-full text-lg leading-8 text-slate-600">Through educational webinars, interactive Q&A sessions, community quizzes, and digital health resources, DAHI continues to equip women with practical, evidence-based knowledge while fostering a supportive learning community.</p>
    </section>
  );
}

export default Impact;
