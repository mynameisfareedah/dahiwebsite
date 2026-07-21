function UpcomingEvents() {
  return (
    <section id="events" className="section-shell max-w-7xl">
      <div className="mb-8 max-w-3xl">
        <span className="eyebrow">Events &amp; Activities</span>
        <h2 className="mt-4 section-title">Connecting women through education, conversation, and community</h2>
        <p className="mt-4 text-lg leading-8 text-slate-600">We regularly organize educational webinars, interactive Q&amp;A sessions, quiz competitions, and awareness campaigns to provide reliable health education and encourage meaningful community engagement.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="soft-card p-7">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-dahiPrimary/10 px-3 py-1 text-sm font-semibold text-dahiPrimary">Webinar</span>
            <span className="rounded-full bg-dahiSecondary/10 px-3 py-1 text-sm font-semibold text-dahiSecondary">Community Event</span>
          </div>
          <h3 className="mt-4 text-2xl font-bold text-slate-900">Educational Webinars</h3>
          <ul className="mt-4 space-y-3 text-slate-600">
            <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">Contraception &amp; Family Planning for Muslim Women</li>
            <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">Menopause Webinar</li>
            <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">Menstrual Health Masterclass</li>
            <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">Joint Webinar for Muslim Women and Women of Faith</li>
            <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">Women's Health Q&amp;A Webinar</li>
          </ul>
        </div>

        <div className="soft-card p-7">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-dahiAccent/20 px-3 py-1 text-sm font-semibold text-dahiAccent">Quiz</span>
            <span className="rounded-full bg-dahiSecondary/10 px-3 py-1 text-sm font-semibold text-dahiSecondary">Community Event</span>
          </div>
          <h3 className="mt-4 text-2xl font-bold text-slate-900">Community Engagement</h3>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 p-4">
              <h4 className="font-semibold text-slate-900">DAHI Ramadan Quiz (DRQ)</h4>
              <p className="mt-2 text-slate-600">A fun and educational quiz designed to build awareness and engagement during Ramadan.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <h4 className="font-semibold text-slate-900">DAHI Online Quiz (DOQ)</h4>
              <p className="mt-2 text-slate-600">Interactive online quizzes that make learning accessible and enjoyable for participants.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <h4 className="font-semibold text-slate-900">Live Q&amp;A Sessions</h4>
              <p className="mt-2 text-slate-600">Open conversations that allow women to ask questions and gain informed guidance.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <h4 className="font-semibold text-slate-900">Community Awareness Campaigns</h4>
              <p className="mt-2 text-slate-600">Outreach initiatives that promote health literacy and encourage balanced conversations.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UpcomingEvents;
