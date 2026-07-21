function WhyVolunteer() {
  const benefits = [
    {
      icon: 'fa-solid fa-heart-pulse',
      title: 'Make a Real Impact',
      description: 'Help empower women with health knowledge that can change their lives and their families\' well-being.',
    },
    {
      icon: 'fa-solid fa-users',
      title: 'Join a Community',
      description: 'Be part of a passionate, values-driven team dedicated to women\'s health and education.',
    },
    {
      icon: 'fa-solid fa-graduation-cap',
      title: 'Develop Skills',
      description: 'Gain experience and knowledge in health education, community engagement, and social impact work.',
    },
    {
      icon: 'fa-solid fa-calendar-flexible',
      title: 'Work Flexibly',
      description: 'Volunteer at your own pace, choosing opportunities that fit your schedule and interests.',
    },
  ];

  return (
    <section className="section-shell max-w-7xl space-y-8">
      <div className="mx-auto max-w-3xl text-center">
        <span className="eyebrow">Why volunteer</span>
        <h2 className="mt-4 section-title">Make a Meaningful Difference</h2>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Volunteering with DAHI is more than just giving your time. It\'s about being part of a community dedicated to empowering women through health education.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {benefits.map((benefit) => (
          <div key={benefit.title} className="soft-card p-8 sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-dahiPrimary/10 text-dahiPrimary text-lg">
              <i className={benefit.icon}></i>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-900">{benefit.title}</h3>
            <p className="mt-3 text-slate-600">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WhyVolunteer;
