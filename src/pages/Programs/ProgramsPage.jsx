import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import PageHero from '../../components/common/PageHero';
import SectionHeading from '../../components/common/SectionHeading';
import ProgramCard from '../../components/common/ProgramCard';
import CTASection from '../../components/common/CTASection';
import { testimonials } from '../../data/siteContent';

const featuredPrograms = [
  { title: 'Women’s Health Education', description: 'Provide accessible educational content that simplifies important women’s health topics and encourages informed decision-making.', objectives: 'Improve health literacy and everyday confidence.', audience: 'Women of all ages', image: '/WOMEN\'S HEALTH.jpg', href: '/resources' },
  { title: 'Health Education Webinars', description: 'Host expert-led discussions where participants learn from healthcare professionals and engage in meaningful conversations.', objectives: 'Create accessible learning opportunities.', audience: 'Women seeking guidance', image: '/WEBINARS.jpg', href: '/events' },
  { title: 'Educational Resources', description: 'Develop downloadable guides, pamphlets, and digital materials that women can access anytime, from anywhere.', objectives: 'Expand access to trusted information.', audience: 'Students, professionals, and community groups', image: '/community-768.jpg', href: '/resources' },
  { title: 'Community Health Outreach', description: 'Support community-based health education initiatives that promote awareness, connection, and preventive healthcare.', objectives: 'Strengthen outreach and community engagement.', audience: 'Community groups and families', image: '/COMMUNITY SUPPORT GROUP.jpg', href: '/events' },
  { title: 'Health Awareness Campaigns', description: 'Organise awareness campaigns that encourage healthier lifestyles, early recognition of concerns, and informed action.', objectives: 'Increase awareness and healthy habits.', audience: 'General public and partners', image: '/CONTRACEPTION.jpg', href: '/resources' },
];

const programAreas = [
  { title: 'Women’s Health', description: 'Practical education on common health concerns and wellness topics relevant to everyday life.', icon: 'fa-solid fa-female', link: '/resources' },
  { title: 'Menstrual Health', description: 'Support for understanding cycles, wellbeing, and self-care in a clear and respectful way.', icon: 'fa-solid fa-venus', link: '/resources' },
  { title: 'Fertility Awareness', description: 'Accessible guidance that helps women make informed decisions about reproductive health.', icon: 'fa-solid fa-seedling', link: '/resources' },
  { title: 'Pregnancy & Maternal Health', description: 'Trusted information that promotes awareness, confidence, and healthy decision-making.', icon: 'fa-solid fa-baby', link: '/resources' },
  { title: 'Breast Health', description: 'Educational content that supports awareness of breast health and preventive care.', icon: 'fa-solid fa-heart', link: '/resources' },
  { title: 'Blood Pressure Awareness', description: 'Simple, practical learning around blood pressure, prevention, and healthy habits.', icon: 'fa-solid fa-heart-pulse', link: '/resources' },
  { title: 'Diabetes Prevention', description: 'Awareness-focused education that highlights prevention, healthy routines, and informed choices.', icon: 'fa-solid fa-stethoscope', link: '/resources' },
  { title: 'Nutrition', description: 'Supportive guidance on healthy eating habits and how nutrition affects overall wellbeing.', icon: 'fa-solid fa-carrot', link: '/resources' },
  { title: 'Mental Well-being', description: 'Content that encourages emotional wellbeing, resilience, and support-seeking behaviours.', icon: 'fa-solid fa-brain', link: '/resources' },
];

const impactOutcomes = [
  { title: 'Improved health awareness', description: 'Participants gain a clearer understanding of health topics that matter to their daily lives.' },
  { title: 'Greater confidence in health decisions', description: 'Practical education helps women feel more informed and prepared to act.' },
  { title: 'Better understanding of preventive care', description: 'Our programmes encourage early awareness and healthier habits.' },
  { title: 'Stronger community engagement', description: 'Learning becomes more meaningful when it is shared in supportive spaces.' },
];

const programHighlights = [
  { title: 'Evidence-Based Learning', description: 'Content is grounded in reliable information and practical guidance.' },
  { title: 'Interactive Sessions', description: 'Learning experiences encourage discussion, questions, and shared understanding.' },
  { title: 'Practical Knowledge', description: 'Our programmes focus on information women can apply in everyday life.' },
  { title: 'Accessible Resources', description: 'Materials are designed to be clear, readable, and easy to engage with.' },
  { title: 'Supportive Community', description: 'Women are invited to learn in environments that feel welcoming and encouraging.' },
];

const deliveryPrinciples = [
  { title: 'Evidence-Based Education', description: 'We prioritise information that is accurate, responsible, and relevant to women’s health needs.' },
  { title: 'Practical Learning', description: 'We focus on knowledge that can be understood and applied in everyday life.' },
  { title: 'Accessible Communication', description: 'We use clear language and approachable formats to make health education more welcoming.' },
  { title: 'Community Engagement', description: 'We create spaces for dialogue, support, and shared learning experiences.' },
  { title: 'Continuous Improvement', description: 'We review and refine our programmes so they remain meaningful and responsive.' },
];

const audienceGroups = [
  'Young women',
  'University students',
  'Working professionals',
  'Mothers and caregivers',
  'Community groups',
  'Women interested in preventive healthcare',
  'Anyone seeking reliable women’s health education',
];

function ProgramsPage() {
  return (
    <>
      <SEO title="Programs" description="Explore DAHI's programmes in women’s health education, community outreach, awareness campaigns, webinars, and educational resources." />
      <PageHero
        eyebrow="Programs & focus areas"
        title="Our Programs"
        description="At Doc Adi Health Initiative (DAHI), our programmes are designed to empower women with practical, evidence-based health education that supports informed decision-making and healthier lives. Through educational resources, interactive learning opportunities, and community engagement, we aim to make reliable health information accessible to women from all walks of life."
        image="/header-hijabs.jpg"
        breadcrumbs={[{ label: 'Programs' }]}
        actions={[
          <Link key="resources" to="/resources" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">Explore Resources</Link>,
          <Link key="involved" to="/contact" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Get Involved</Link>,
        ]}
      />

      <section className="section-shell mx-auto max-w-7xl space-y-10">
        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Overview" title="Empowering Women Through Education" description="Health education is one of the most effective tools for improving individual and community well-being." />
          <p className="mt-6 text-lg leading-8 text-slate-600">At DAHI, our programmes are developed to provide women with clear, practical, and reliable health information that can be applied in everyday life. Rather than focusing only on treatment, we emphasise prevention, awareness, and informed decision-making. By combining educational resources, expert-led discussions, and community engagement, we strive to create learning experiences that are accessible, inclusive, and relevant to the needs of women.</p>
          <p className="mt-4 text-lg leading-8 text-slate-600">Whether someone is looking to understand a health condition, adopt healthier habits, or simply gain more confidence in making healthcare decisions, our programmes are designed to provide the knowledge and support they need.</p>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Our program areas" title="Our Program Areas" description="DAHI’s work spans several important areas of women’s health education, guiding the development of our resources, webinars, and community initiatives." />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {programAreas.map((area) => (
              <div key={area.title} className="rounded-[1.25rem] border border-slate-200 p-6 transition hover:border-dahiPrimary/40 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-dahiPrimary/10 text-xl text-dahiPrimary">
                  <i className={area.icon}></i>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">{area.title}</h3>
                <p className="mt-3 text-slate-600">{area.description}</p>
                <Link to={area.link} className="mt-5 inline-flex text-sm font-semibold text-dahiPrimary transition hover:text-dahiSecondary">Explore resources</Link>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <SectionHeading eyebrow="Featured programs" title="Our Core Programmes" description="Our programmes address key aspects of women's health and well-being through education, awareness, and practical learning opportunities." />
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {featuredPrograms.map((program) => (
              <ProgramCard key={program.title} title={program.title} description={program.description} objectives={program.objectives} audience={program.audience} image={program.image} href={program.href} />
            ))}
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Impact" title="Creating Lasting Impact Through Health Education" description="The true impact of health education extends far beyond a single webinar or resource." />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {impactOutcomes.map((item) => (
              <div key={item.title} className="rounded-[1.25rem] border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="What you can expect" title="What You Can Expect" description="Every programme is designed to make learning supportive, practical, and accessible." />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {programHighlights.map((item) => (
              <div key={item.title} className="rounded-[1.25rem] border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Who can participate" title="Who Our Programmes Are For" description="Our programmes are designed to be inclusive and accessible to women at different stages of life and from diverse backgrounds." />
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.25rem] border border-slate-200 p-6">
              <ul className="space-y-3 text-slate-600">
                {audienceGroups.map((group) => (
                  <li key={group} className="flex items-start gap-3"><span className="mt-1 text-dahiPrimary">•</span><span>{group}</span></li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-6 text-lg leading-8 text-slate-600">
              No prior medical knowledge is required. Our educational approach is designed to make health information practical, understandable, and accessible to everyone.
            </div>
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Our approach" title="How We Deliver Our Programmes" description="DAHI’s guiding principles shape the way we create and share learning experiences." />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {deliveryPrinciples.map((item) => (
              <div key={item.title} className="rounded-[1.25rem] border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Testimonials" title="What Participants Say" description="The experiences of our participants reflect the value of creating supportive learning environments where women can access trusted health information and engage in meaningful conversations." />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((item, index) => (
              <blockquote key={`${item.quote}-${index}`} className="rounded-[1.25rem] border border-slate-200 p-6 text-slate-600">
                “{item.quote}”
              </blockquote>
            ))}
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Get involved" title="Become Part of the DAHI Community" description="Creating healthier communities requires collaboration. Whether you want to volunteer, support our initiatives, or participate in our programmes, there are many meaningful ways to become involved." />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              { title: 'Volunteer', description: 'Offer your time and support to help DAHI expand its community work.', link: '/contact' },
              { title: 'Support DAHI', description: 'Contribute to the growth of our programmes and educational resources.', link: '/contact' },
              { title: 'Explore Resources', description: 'Access practical learning materials and health education content.', link: '/resources' },
              { title: 'Contact Us', description: 'Get in touch to ask questions or learn about upcoming opportunities.', link: '/contact' },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.25rem] border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-slate-600">{item.description}</p>
                <Link to={item.link} className="mt-5 inline-flex text-sm font-semibold text-dahiPrimary transition hover:text-dahiSecondary">Learn more</Link>
              </div>
            ))}
          </div>
        </div>

        <CTASection eyebrow="Together, we can empower women" title="Together, We Can Empower Women Through Health Education" description="Health education has the power to transform lives, strengthen communities, and create lasting change. By participating in our programmes, accessing our educational resources, or supporting our mission, you become part of a growing movement dedicated to improving women’s health through knowledge and awareness. We invite you to explore our programmes, connect with our community, and join us in building a future where every woman has access to the information she needs to make informed health decisions." actions={[
          <Link key="resources" to="/resources" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">Explore Resources</Link>,
          <Link key="volunteer" to="/contact" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Volunteer</Link>,
          <Link key="contact" to="/contact" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Contact Us</Link>,
        ]} />
      </section>
    </>
  );
}

export default ProgramsPage;
