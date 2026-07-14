import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import PageHero from '../../components/common/PageHero';
import SectionHeading from '../../components/common/SectionHeading';
import FeatureCard from '../../components/common/FeatureCard';
import VolunteerForm from '../../components/common/VolunteerForm';
import CTASection from '../../components/common/CTASection';

const opportunities = [
  { title: 'Event Support', description: 'Help with registrations, logistics, and welcoming attendees for webinars and community sessions.', icon: 'fa-solid fa-calendar-check' },
  { title: 'Content & Outreach', description: 'Support the creation of educational materials, community messaging, and outreach campaigns.', icon: 'fa-solid fa-bullhorn' },
  { title: 'Digital Support', description: 'Assist with social media promotion, content scheduling, and digital engagement.', icon: 'fa-solid fa-laptop' },
];

const benefits = [
  'Gain experience in community-focused health education work',
  'Contribute to a meaningful mission that supports women',
  'Learn from a passionate, values-driven team',
];

function VolunteerPage() {
  return (
    <>
      <SEO title="Volunteer" description="Learn about volunteering with DAHI, available opportunities, benefits, and how to apply." />
      <PageHero
        eyebrow="Volunteer"
        title="Join DAHI as a volunteer"
        description="We welcome volunteers who care about women’s health, education, and community impact. Whether you can contribute time, skills, or ideas, there is a place for you in DAHI."
        image="/COMMUNITY SUPPORT GROUP.jpg"
        breadcrumbs={[{ label: 'Volunteer' }]}
        actions={[
          <Link key="contact" to="/contact" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">Get In Touch</Link>,
          <a key="community" href="https://whatsapp.com/channel/0029VbBdF4hLI8YZRabyWF0j" target="_blank" rel="noopener" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Join WhatsApp</a>,
        ]}
      />

      <section className="section-shell mx-auto max-w-7xl space-y-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="soft-card p-8 sm:p-10">
            <SectionHeading eyebrow="Why volunteer" title="Make a meaningful contribution" description="Volunteering with DAHI is an opportunity to support women’s health education and empower communities through service and care." />
            <FeatureCard icon="fa-solid fa-hands-helping" title="Volunteer benefits" description="Your time and skills can create measurable impact while giving you a chance to grow alongside a mission-driven team." items={benefits} />
          </div>
          <div className="soft-card p-8 sm:p-10">
            <SectionHeading eyebrow="Volunteer opportunities" title="Ways to contribute" description="There are many ways to help depending on your skills, interests, and availability." />
            <div className="mt-6 space-y-4">
              {opportunities.map((item) => (
                <div key={item.title} className="rounded-[1.25rem] border border-slate-200 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-dahiPrimary/10 text-dahiPrimary"><i className={item.icon}></i></div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Volunteer application" title="Tell us about yourself" description="Share a few details and we will get in touch about available volunteer opportunities." />
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-900">What happens next?</h3>
              <p className="mt-3 text-slate-600">Once you submit your application, our team will review your details and follow up with information about the next steps and opportunities that match your interests.</p>
            </div>
            <VolunteerForm />
          </div>
        </div>

        <CTASection eyebrow="Partner with us" title="Help DAHI grow its reach" description="If you are interested in volunteering, sharing your skills, or connecting with our work, we would love to hear from you." actions={[
          <Link key="contact" to="/contact" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">Contact Us</Link>,
          <a key="register" href="https://forms.gle/joTjf3VYW9anCA9MA" target="_blank" rel="noopener" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Register</a>,
        ]} />
      </section>
    </>
  );
}

export default VolunteerPage;
