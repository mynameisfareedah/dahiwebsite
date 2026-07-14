function AboutPreview() {
  return (
    <section id="about" className="section-shell mx-auto max-w-7xl">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="soft-card p-8 sm:p-10">
          <h2 className="section-title">About DAHI</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">Many women and young girls grow up without clear, reliable education about their own bodies. Questions about menstrual health, fertility, pregnancy, menopause, and emotional wellbeing are often left unanswered or surrounded by confusion and stigma. DAHI exists to change that.</p>
          <p className="mt-4 text-lg leading-8 text-slate-600">DAHI is a women’s health education and empowerment initiative focused on providing accessible, clear, and supportive health information to women and young girls.</p>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <div className="eyebrow">Mission &amp; Vision</div>
          <h3 className="mt-4 text-2xl font-bold text-slate-900">Mission</h3>
          <p className="mt-3 text-lg italic text-slate-600">“To educate, empower, and support women and young girls by providing accessible and trustworthy health knowledge across all stages of life.”</p>
          <h3 className="mt-6 text-2xl font-bold text-slate-900">Vision</h3>
          <p className="mt-3 text-lg leading-8 text-slate-600">To create a safe, informed, and supportive space where Muslim women can confidently make health decisions rooted in evidence, compassion, and faith.</p>
        </div>
      </div>
    </section>
  );
}

export default AboutPreview;
