import SectionHeading from '../common/SectionHeading';

function DonationSection({ donationImpact }) {
  return (
    <section id="support-section" className="section-shell max-w-7xl space-y-6">
      <SectionHeading
        eyebrow="Make an Impact"
        title="Help Us Reach More Women This August"
        description="Every contribution helps us deliver quality health education and community outreach to women who need it most. Your support will help us provide educational materials, organise community activities, and deliver an impactful outreach experience."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {donationImpact.map((impact, index) => (
          <article key={index} className="soft-card space-y-3 p-6 sm:p-8">
            <div className="text-4xl">{impact.emoji}</div>
            <div>
              <h3 className="font-bold text-slate-900">{impact.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{impact.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default DonationSection;
