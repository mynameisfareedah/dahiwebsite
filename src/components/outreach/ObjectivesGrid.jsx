import SectionHeading from '../common/SectionHeading';

function ObjectivesGrid({ objectives }) {
  return (
    <section className="section-shell mx-auto max-w-7xl space-y-8">
      <SectionHeading
        eyebrow="What We Aim To Do"
        title="Our Objectives"
        description="DAHI is committed to achieving meaningful impact through this community outreach."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {objectives.map((objective, index) => (
          <article
            key={index}
            className="soft-card space-y-4 p-6 sm:p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dahiPrimary/10">
              <i className={`${objective.icon} text-lg text-dahiPrimary`}></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{objective.title}</h3>
              <p className="mt-2 text-slate-600">{objective.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ObjectivesGrid;
