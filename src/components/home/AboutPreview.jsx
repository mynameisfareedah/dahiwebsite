import { Link } from 'react-router-dom';

function AboutPreview() {
  return (
    <section id="about" className="section-shell max-w-7xl">
      <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100 shadow-sm">
          <picture>
            <source srcSet="/community-480.webp 480w, /community-768.webp 768w, /community-1200.webp 1200w" sizes="(max-width: 1024px) 100vw, 40vw" type="image/webp" />
            <img src="/community-768.jpg" alt="DAHI community members in discussion" width="768" height="437" loading="lazy" className="h-full min-h-[280px] w-full object-cover" />
          </picture>
        </div>
        <div>
          <span className="eyebrow">About DAHI</span>
          <h2 className="mt-4 section-title">Health education rooted in evidence, compassion, and faith.</h2>
          <div className="mt-6 space-y-4 text-lg leading-8 text-slate-600">
            <p>Doc Adi Health Initiative (DAHI) is a women&apos;s health education and empowerment initiative providing accessible, evidence-based health information to Muslim women and young girls.</p>
            <p>Many women and young girls grow up without clear, reliable education about their own bodies. Questions about menstrual health, fertility, pregnancy, menopause, and emotional wellbeing can be surrounded by confusion or stigma.</p>
            <p>DAHI exists to make trusted health information easier to understand and act on. We combine evidence-based health education with community engagement to help women make informed decisions about their wellbeing.</p>
            <p>In August 2026, DAHI expanded this mission into community-based health outreach, beginning with its first outreach programme in Gwagwalada, Abuja.</p>
          </div>
          <p className="mt-6 border-l-2 border-dahiAccent pl-4 text-base font-medium italic text-slate-700">To educate, empower, and support women and young girls by providing accessible and trustworthy health knowledge across all stages of life.</p>
          <Link to="/about" className="mt-7 inline-flex items-center justify-center rounded-full bg-dahiPrimary px-6 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary">Learn More About DAHI</Link>
        </div>
      </div>
    </section>
  );
}

export default AboutPreview;
