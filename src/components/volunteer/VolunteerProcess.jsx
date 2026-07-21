function VolunteerProcess() {
  const steps = [
    {
      number: '01',
      title: 'Apply Online',
      description: 'Fill out the volunteer application form with your information, skills, and interests.',
    },
    {
      number: '02',
      title: 'Get Reviewed',
      description: 'Our team reviews your application and learns about what drives your passion for our mission.',
    },
    {
      number: '03',
      title: 'Meet the Team',
      description: 'We\'ll connect with you to discuss available opportunities and answer any questions.',
    },
    {
      number: '04',
      title: 'Start Volunteering',
      description: 'Get started with onboarding and begin making an impact with DAHI.',
    },
  ];

  return (
    <section className="section-shell max-w-7xl space-y-8">
      <div className="mx-auto max-w-3xl text-center">
        <span className="eyebrow">The process</span>
        <h2 className="mt-4 section-title">How to Get Started</h2>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Becoming a DAHI volunteer is simple and straightforward. Here\'s what to expect.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step.number} className="relative">
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="absolute top-20 left-1/2 hidden h-px w-full -translate-x-1/2 transform bg-gradient-to-r from-dahiPrimary/50 to-transparent lg:block"></div>
            )}

            <div className="relative soft-card p-6 sm:p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-dahiPrimary/10 text-2xl font-black text-dahiPrimary">
                {step.number}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-3 text-slate-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default VolunteerProcess;
