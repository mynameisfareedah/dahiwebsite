import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import PageHero from '../../components/common/PageHero';
import SectionHeading from '../../components/common/SectionHeading';
import CTASection from '../../components/common/CTASection';
import EventCard from '../../components/common/EventCard';
import { impactStats, testimonials, upcomingOutreach } from '../../data/siteContent';

const featuredEvents = [
  {
    title: upcomingOutreach.title,
    date: upcomingOutreach.date,
    time: 'Community Outreach',
    speaker: 'DAHI Team',
    description: upcomingOutreach.description,
    image: upcomingOutreach.image,
    buttonLabel: 'View Details',
    buttonHref: '/outreach',
    category: 'Community Outreach',
  },
  {
    title: 'Menstrual Health Masterclass',
    date: '20 November 2025',
    time: 'Masterclass',
    speaker: 'DAHI Team',
    description: 'DAHI\'s first educational masterclass focused on menstrual health awareness, helping women better understand the menstrual cycle, menstrual hygiene, common misconceptions, and practical care through evidence-based information.',
    image: '/MENSTRUAL HEALTH.jpg',
    buttonLabel: 'Request Details',
    buttonHref: '/contact',
    category: 'Masterclass',
  },
  {
    title: 'Joint Webinar for Muslim Women & Women of Faith',
    date: '25 January 2026',
    time: 'Webinar',
    speaker: 'DAHI Team',
    description: 'An educational webinar bringing together Muslim women and women of other faiths to discuss women\'s health topics in a respectful, inclusive, and supportive environment.',
    image: '/WEBINARS.jpg',
    buttonLabel: 'Request Details',
    buttonHref: '/contact',
    category: 'Webinar',
  },
  {
    title: 'Contraception & Family Planning for Muslim Women',
    date: '31 March – 1 April 2026',
    time: 'Webinar',
    speaker: 'DAHI Team',
    description: 'An evidence-based educational webinar exploring contraception, family planning, reproductive health, common misconceptions, and informed decision-making from a culturally sensitive perspective.',
    image: '/doc adi webinar.jpeg',
    buttonLabel: 'Request Details',
    buttonHref: '/contact',
    category: 'Webinar',
  },
  {
    title: 'Menopause Webinar',
    date: '26 April 2026',
    time: 'Webinar',
    speaker: 'DAHI Team',
    description: 'An educational session designed to increase awareness of menopause by discussing symptoms, emotional wellbeing, lifestyle changes, healthy ageing, and practical strategies for navigating this stage of life.',
    image: '/MENOPAUSE.jpg',
    buttonLabel: 'Request Details',
    buttonHref: '/contact',
    category: 'Webinar',
  },
  {
    title: 'Women\'s Health Q&A Webinar',
    date: '28 June 2026',
    time: 'Webinar',
    speaker: 'DAHI Team',
    description: 'An interactive question-and-answer session where participants had the opportunity to ask women\'s health questions and receive practical, evidence-based guidance from healthcare professionals.',
    image: '/COMMUNITY DISCUSSION.jpg',
    buttonLabel: 'Request Details',
    buttonHref: '/contact',
    category: 'Webinar',
  },
  {
    title: 'DAHI Educational Quiz Series',
    date: '28 February – 18 March 2026 and May 2026',
    time: 'Educational Quiz',
    speaker: 'DAHI Team',
    description: 'DAHI successfully organised a series of educational quiz sessions designed to reinforce knowledge shared through its programmes and resources while encouraging friendly, interactive learning within the community.',
    image: '/COMMUNITY DISCUSSION.jpg',
    buttonLabel: 'Request Details',
    buttonHref: '/contact',
    category: 'Educational Quiz',
  },
];

const quizSeriesHighlights = [
  'DAHI Ramadan Quiz (DRQ) — 28 February to 18 March 2026',
  'DAHI Online Quiz (DOQ) — May 2026',
  'Top participants received cash prizes: 1st ₦10,000, 2nd ₦5,000, 3rd ₦3,000',
];

const quizLearningObjectives = [
  'Reinforce knowledge gained from DAHI educational programmes.',
  'Encourage continuous learning and active participation.',
  'Promote health literacy through interactive engagement.',
  'Foster a supportive learning community while recognising participant achievement.',
];

const communityActivities = [
  { title: 'Health Quizzes', description: 'Interactive quizzes designed to reinforce learning, increase health awareness, and encourage community participation in a fun and engaging way.', icon: 'fa-solid fa-question' },
  { title: 'Community Health Discussions', description: 'Educational conversations that encourage women to ask questions, share experiences, and learn from one another in a supportive environment.', icon: 'fa-solid fa-comments' },
  { title: 'Health Awareness Campaigns', description: 'Campaigns that promote preventive healthcare, early detection, and greater awareness of important women\'s health issues.', icon: 'fa-solid fa-megaphone' },
  { title: 'Educational Resource Releases', description: 'The publication and sharing of health guides, pamphlets, eBooks, and educational materials that support continuous learning beyond webinars.', icon: 'fa-solid fa-book-open' },
];

const eventHighlights = [
  { title: 'Expert-led health education', description: 'Gain practical knowledge from trusted health educators and professionals.', icon: 'fa-solid fa-user-doctor' },
  { title: 'Interactive Q&A sessions', description: 'Ask questions and explore topics in a supportive, welcoming setting.', icon: 'fa-solid fa-circle-question' },
  { title: 'Practical health knowledge', description: 'Learn about daily habits, wellbeing, and care in accessible language.', icon: 'fa-solid fa-heart-pulse' },
  { title: 'Evidence-based information', description: 'Receive content rooted in reliable medical and health education.', icon: 'fa-solid fa-shield-heart' },
  { title: 'Community discussions', description: 'Build confidence through shared learning and group conversation.', icon: 'fa-solid fa-users' },
  { title: 'Educational resources', description: 'Access follow-up materials that help knowledge continue beyond the session.', icon: 'fa-solid fa-file-lines' },
  { title: 'Supportive learning environment', description: 'Take part in a respectful space created for thoughtful engagement.', icon: 'fa-solid fa-hands-helping' },
];

const educationalActivities = [
  { title: 'Health Quizzes', description: 'Fun, informative quizzes that reinforce key health messages.', icon: 'fa-solid fa-brain' },
  { title: 'Educational Campaigns', description: 'Outreach activities promoting awareness of important health topics.', icon: 'fa-solid fa-ribbon' },
  { title: 'Community Learning Initiatives', description: 'Events and conversations that encourage women to learn together.', icon: 'fa-solid fa-people-group' },
  { title: 'Health Awareness Activities', description: 'Promotional and educational initiatives focused on preventive care.', icon: 'fa-solid fa-bullseye' },
  { title: 'Educational Resource Development', description: 'Creating practical guides and materials to support ongoing learning.', icon: 'fa-solid fa-layer-group' },
];

const timelineEntries = [
  { period: 'August 2026', title: 'August Community Health Outreach' },
  { period: 'November 2025', title: 'Menstrual Health Masterclass' },
  { period: 'January 2026', title: 'Joint Webinar for Muslim Women & Women of Faith' },
  { period: 'March – April 2026', title: 'Contraception & Family Planning for Muslim Women' },
  { period: 'April 2026', title: 'Menopause Webinar' },
  { period: 'June 2026', title: 'Women\'s Health Q&A Webinar' },
];

const filterOptions = [
  { label: 'All Activities', value: 'all' },
  { label: 'Community Outreach', value: 'community outreach' },
  { label: 'Webinars', value: 'webinar' },
  { label: 'Masterclasses', value: 'masterclass' },
  { label: 'Educational Quiz', value: 'educational quiz' },
  { label: 'Health Quizzes', value: 'health quiz' },
  { label: 'Awareness Campaigns', value: 'awareness campaigns' },
  { label: 'Educational Resources', value: 'educational resources' },
  { label: 'Community Activities', value: 'community activities' },
];

function EventsPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'all') {
      return featuredEvents;
    }

    return featuredEvents.filter((event) => {
      const category = event.category.toLowerCase();
      if (activeFilter === 'community outreach') return category.includes('community outreach');
      if (activeFilter === 'webinar') return category.includes('webinar');
      if (activeFilter === 'masterclass') return category.includes('masterclass');
      if (activeFilter === 'educational quiz') return category.includes('educational quiz');
      if (activeFilter === 'health quiz') return event.title.toLowerCase().includes('quiz');
      if (activeFilter === 'awareness campaigns') return event.title.toLowerCase().includes('awareness') || event.title.toLowerCase().includes('campaign');
      if (activeFilter === 'educational resources') return event.title.toLowerCase().includes('resource');
      if (activeFilter === 'community activities') return event.title.toLowerCase().includes('community');
      return false;
    });
  }, [activeFilter]);

  return (
    <>
      <SEO title="Events & Activities" description="Explore DAHI's educational events, masterclasses, webinars, community activities, and resources." />
      <PageHero
        eyebrow="Events & activities"
        title="DAHI's educational events and activities"
        description="From masterclasses and webinars to community conversations and resource releases, DAHI creates supportive spaces for women to learn, ask questions, and engage with practical health education."
        image="/WEBINARS.jpg"
        breadcrumbs={[{ label: 'Events & Activities' }]}
        actions={[
          <Link key="resources" to="/resources" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">Explore Resources</Link>,
          <Link key="contact" to="/contact" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Ask About Sessions</Link>,
        ]}
      />

      <section className="section-shell mx-auto max-w-7xl space-y-8">
        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Featured events" title="DAHI's recent educational events" description="The following events reflect DAHI's continuing work in women’s health education, respectful conversation, and community engagement." />
          <div className="mt-6 flex flex-wrap gap-3">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setActiveFilter(option.value)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${activeFilter === option.value ? 'border-dahiPrimary bg-dahiPrimary text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-dahiPrimary/40 hover:text-dahiPrimary'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {filteredEvents.map((event) => (
              <EventCard key={event.title} title={event.title} date={event.date} time={event.time} speaker={event.speaker} description={event.description} image={event.image} buttonLabel={event.buttonLabel} buttonHref={event.buttonHref} />
            ))}
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Educational quiz series" title="DAHI Educational Quiz Series" description="A completed series of interactive educational quizzes designed to reinforce health knowledge and encourage community participation." />
          <p className="mt-6 text-lg leading-8 text-slate-600">As part of its commitment to making health education engaging and interactive, DAHI successfully organised a series of educational quiz sessions that helped participants revisit key health concepts and apply what they had learned.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.25rem] border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900">Events included</h3>
              <ul className="mt-4 space-y-2 text-slate-600">
                {quizSeriesHighlights.map((item) => (
                  <li key={item} className="flex gap-2"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-dahiPrimary"></span><span>{item}</span></li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.25rem] border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900">Learning objectives</h3>
              <ul className="mt-4 space-y-2 text-slate-600">
                {quizLearningObjectives.map((item) => (
                  <li key={item} className="flex gap-2"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-dahiSecondary"></span><span>{item}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 inline-flex flex-wrap gap-2">
            {['Educational Quiz', 'Community Engagement', 'Health Education', 'Interactive Learning'].map((tag) => (
              <span key={tag} className="rounded-full bg-dahiPrimary/10 px-3 py-1 text-sm font-semibold text-dahiPrimary">{tag}</span>
            ))}
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Community activities" title="Ongoing learning and awareness initiatives" description="DAHI’s work extends beyond webinars through community engagement, educational resources, and awareness initiatives." />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {communityActivities.map((activity) => (
              <div key={activity.title} className="rounded-[1.25rem] border border-slate-200 p-6 transition hover:border-dahiPrimary/40 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-dahiPrimary/10 text-xl text-dahiPrimary">
                  <i className={activity.icon}></i>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{activity.title}</h3>
                <p className="mt-3 text-slate-600">{activity.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Events timeline" title="A simple timeline of DAHI events" description="A chronological view of the events and activities highlighted on this page." />
          <div className="mt-10 space-y-6">
            {timelineEntries.map((item, index) => (
              <div key={`${item.period}-${index}`} className="relative pl-10">
                <div className="absolute left-0 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-dahiPrimary text-sm font-black text-white">{index + 1}</div>
                <div className="rounded-[1.25rem] border border-slate-200 p-5">
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">{item.period}</div>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="What participants gain" title="What participants gain from DAHI activities" description="DAHI’s events are designed to create supportive spaces for learning, reflection, and practical health understanding." />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {eventHighlights.map((item) => (
              <div key={item.title} className="rounded-[1.25rem] border border-slate-200 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-dahiSecondary/10 text-xl text-dahiSecondary">
                  <i className={item.icon}></i>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Educational activities" title="DAHI's broader learning work" description="The organisation is committed to education beyond webinars through practical resources and community-based initiatives." />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {educationalActivities.map((activity) => (
              <div key={activity.title} className="rounded-[1.25rem] border border-slate-200 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-dahiAccent/20 text-xl text-dahiAccent">
                  <i className={activity.icon}></i>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{activity.title}</h3>
                <p className="mt-3 text-slate-600">{activity.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Testimonials" title="What participants have shared" description="The feedback below reflects the value of DAHI's educational events and supportive learning spaces." />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((item, index) => (
              <blockquote key={`${item.quote}-${index}`} className="rounded-[1.25rem] border border-slate-200 p-6 text-slate-600">
                <p className="italic">“{item.quote}”</p>
              </blockquote>
            ))}
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Event statistics" title="A snapshot of DAHI's ongoing work" description="These indicators reflect the broader reach of DAHI’s educational events and initiatives." />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {impactStats.map((stat) => (
              <div key={stat.title} className="rounded-[1.25rem] border border-slate-200 p-6">
                <div className="text-3xl font-black text-dahiPrimary">{stat.value}</div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{stat.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Previous recordings" title="Need a previous webinar recording?" description="Some webinar recordings and supporting educational materials may be available upon request." />
          <p className="mt-6 text-lg leading-8 text-slate-600">If you attended a session or require a recording for educational purposes, please contact the DAHI team. Requests will be reviewed individually.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/contact" className="inline-flex items-center justify-center rounded-full bg-dahiPrimary px-6 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary">Request a Recording</Link>
            <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-dahiPrimary hover:text-dahiPrimary">Contact Us</Link>
          </div>
        </div>

        <CTASection eyebrow="Stay connected" title="Stay connected with DAHI's events and activities" description="Follow the latest sessions, resources, community initiatives, and learning opportunities by reaching out to the team." actions={[
          <Link key="contact" to="/contact" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">Contact Us</Link>,
          <Link key="resources" to="/resources" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Explore Resources</Link>,
        ]} />
      </section>
    </>
  );
}

export default EventsPage;
