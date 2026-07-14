import SectionHeading from '../common/SectionHeading';

function TimelineSection() {
  const milestones = [
    { year: 'November 2025', title: 'DAHI was established', description: 'With the vision of improving women’s health awareness through education and community engagement.' },
    { year: '2025', title: 'Early initiatives began', description: 'DAHI started developing women’s health education initiatives and outreach programmes.' },
    { year: '2026', title: 'Expert-led learning grew', description: 'DAHI hosted health webinars and educational discussions designed to make information practical and relatable.' },
    { year: '2026', title: 'Digital resources expanded', description: 'DAHI created accessible digital materials to make health information easier to find and understand.' },
    { year: 'Future Vision', title: 'Continuing to grow impact', description: 'DAHI continues to expand programmes, resources, collaborations, and community impact.' },
  ];

  return (
    <section className="section-shell mx-auto max-w-7xl">
      <div className="soft-card p-8 sm:p-10">
        <SectionHeading eyebrow="Our journey" title="The path behind DAHI" description="DAHI’s story has grown from a clear need for trusted, practical education into a wider movement for women’s health awareness and support." />
        <div className="mt-10 space-y-6">
          {milestones.map((item, index) => (
            <div key={`${item.year}-${index}`} className="relative pl-10">
              <div className="absolute left-0 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-dahiPrimary text-sm font-black text-white">{index + 1}</div>
              <div className="rounded-[1.25rem] border border-slate-200 p-5 transition hover:border-dahiPrimary/40 hover:shadow-md">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">{item.year}</div>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-slate-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TimelineSection;
