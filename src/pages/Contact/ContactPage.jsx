import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Phone, MessageCircle, HandHeart, Microscope, Presentation, BookOpen, BriefcaseBusiness, CircleAlert, Handshake, Building2, Stethoscope, Megaphone, Layers2, Video } from 'lucide-react';
import SEO from '../../components/common/SEO';
import SectionHeading from '../../components/common/SectionHeading';
import ContactForm from '../../components/common/ContactForm';
import CTASection from '../../components/common/CTASection';
import ContactHero from '../../components/common/ContactHero';
import ContactCard from '../../components/common/ContactCard';
import ReasonCard from '../../components/common/ReasonCard';
import OfficeHours from '../../components/common/OfficeHours';
import SocialLinks from '../../components/common/SocialLinks';
import QuickActionCard from '../../components/common/QuickActionCard';
import LocationSection from '../../components/common/LocationSection';

const reasons = [
  { title: 'General Enquiries', description: 'Questions about DAHI, our work, or how to connect with the team.', icon: CircleAlert },
  { title: 'Partnerships', description: 'Collaborate with DAHI on women’s health initiatives and community programmes.', icon: BriefcaseBusiness },
  { title: 'Volunteer Opportunities', description: 'Support our mission by contributing your time, skills, or community energy.', icon: HandHeart },
  { title: 'Speaking Engagements', description: 'Invite DAHI to speak, teach, or engage at your event or institution.', icon: Presentation },
  { title: 'Educational Resources', description: 'Request health education materials, guides, or support for your audience.', icon: BookOpen },
  { title: 'Media Enquiries', description: 'Get in touch for interviews, features, or public-facing opportunities.', icon: Microscope },
];

const collaborations = [
  { title: 'Health Educators & Trainers', description: 'Co-design workshops, webinars, and training programmes for local communities.', icon: Handshake },
  { title: 'Nonprofit Partners', description: 'Build joint initiatives that expand access to trusted health education.', icon: Building2 },
  { title: 'Medical & Wellness Providers', description: 'Connect with clinicians and practitioners to strengthen community care.', icon: Stethoscope },
  { title: 'Policy & Advocacy Groups', description: 'Align on policy, research, and awareness campaigns that matter.', icon: Megaphone },
  { title: 'Content & Media Collaborators', description: 'Share stories, expert insights, and creative health education content.', icon: Video },
  { title: 'Community Leaders', description: 'Partner with grassroots changemakers to reach women where they are.', icon: Layers2 },
];

const quickActions = [
  { title: 'Questions About the August Outreach?', description: 'Contact our team for more information about attending, volunteering, donating, or partnering with DAHI for this community outreach.', to: '/outreach' },
  { title: 'Request Educational Resources', description: 'Ask for materials that support health education and community learning.', to: '/resources' },
  { title: 'Volunteer With DAHI', description: 'Explore ways to contribute your time and skills to our work.', to: '/volunteer' },
  { title: 'Partner With DAHI', description: 'Start a conversation about collaborations and shared impact.', href: 'mailto:docadi.healthinitiative@gmail.com' },
  { title: 'Invite DAHI to Speak', description: 'Bring DAHI to your event, conference, or educational setting.', href: 'mailto:docadi.healthinitiative@gmail.com' },
];

function ContactPage() {
  const location = useLocation();
  const [selectedReason, setSelectedReason] = useState('General Enquiry');
  const formSectionRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reasonParam = params.get('reason');
    if (reasonParam) {
      setSelectedReason(reasonParam);
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.search]);

  const handlePartnerClick = () => {
    setSelectedReason('Partnership');
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <SEO title="Contact" description="Get in touch with DAHI for enquiries, partnerships, volunteering, resources, and community support." />
      <section id="top" className="section-shell mx-auto max-w-7xl space-y-8">
        <ContactHero
          eyebrow="Contact"
          title="Get in Touch"
          description="We'd love to hear from you. Whether you have a question, would like to collaborate, are interested in volunteering, need support, or simply want to learn more about DAHI, our team is here to help."
          image="/COMMUNITY DISCUSSION.jpg"
          primaryActionLabel="Send a Message"
          primaryActionHref="#contact-form"
          secondaryActionLabel="Explore Our Programs"
          secondaryActionHref="/programs"
        />

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <SectionHeading eyebrow="Let's Connect" title="We welcome meaningful conversations" description="Doc Adi Health Initiative believes that thoughtful conversations create stronger communities and better access to trusted health information." />
            <div className="grid gap-4 md:grid-cols-2">
              <ContactCard icon={Mail} title="Email" value="docadi.healthinitiative@gmail.com" description="General enquiries, support, and partnership requests." href="mailto:docadi.healthinitiative@gmail.com" linkLabel="Email us" />
              <ContactCard icon={Phone} title="Phone" value="+44 7438 490958" description="Speak with the DAHI team for direct support or enquiries." href="tel:+447438490958" linkLabel="Call now" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <ContactCard icon={MessageCircle} title="WhatsApp" value="Join our community" description="Stay connected with updates, events, and community conversations." href="https://whatsapp.com/channel/0029VbBdF4hLI8YZRabyWF0j" linkLabel="Join channel" />
              <ContactCard icon={Mail} title="Registration" value="Sign up for programs" description="Register for workshops, events, and community activities." href="https://forms.gle/joTjf3VYW9anCA9MA" linkLabel="Open form" />
            </div>
          </div>

          <div className="soft-card p-8 sm:p-10">
            <SectionHeading eyebrow="Send us a message" title="We would love to hear from you" description="Use the form below for general enquiries, partnerships, volunteering, media requests, or resource support." />
            <div className="mt-8" ref={formSectionRef}>
              <ContactForm initialReason={selectedReason} />
            </div>
            <div className="mt-8 rounded-[1.25rem] border border-rose-200 bg-rose-50 p-6 text-slate-700">
              <div className="flex items-center gap-3 text-rose-700">
                <CircleAlert size={20} />
                <h3 className="text-base font-semibold">Medical information disclaimer</h3>
              </div>
              <p className="mt-4 text-sm leading-6">
                DAHI provides guidance and community support, not a medical diagnosis. If you are experiencing an emergency or urgent symptoms, please contact local emergency services or your medical provider immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <SectionHeading eyebrow="Why contact DAHI" title="A few common reasons people reach out" description="Whether you want information, support, or collaboration, we are here to help." />
            <div className="grid gap-4 md:grid-cols-2">
              {reasons.map((reason) => (
                <ReasonCard key={reason.title} title={reason.title} description={reason.description} icon={reason.icon} />
              ))}
            </div>
          </div>
          <OfficeHours />
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Collaborate With DAHI" title="Partner with us for impact and community health" description="We welcome partnerships that amplify women&apos;s health education, strengthen care, and support meaningful outreach." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {collaborations.map((item) => (
              <div key={item.title} className="rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-dahiPrimary">
                  <item.icon size={20} />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" onClick={handlePartnerClick} className="inline-flex items-center justify-center rounded-full bg-dahiPrimary px-6 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary">
              Become a Partner
            </button>
            <a href="mailto:docadi.healthinitiative@gmail.com" className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-dahiPrimary hover:text-dahiPrimary">
              Email our partnerships team
            </a>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <SocialLinks />
          <LocationSection />
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Frequently requested contacts" title="Quick ways to connect" description="Choose the option that best fits your needs and we will follow up as soon as possible." />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {quickActions.map((action) => (
              <QuickActionCard key={action.title} title={action.title} description={action.description} href={action.href} to={action.to} />
            ))}
          </div>
        </div>

        <CTASection eyebrow="Let's build healthier communities together" title="Whether you're looking to learn, collaborate, volunteer, or support our mission, we'd love to hear from you." description="Together, we can improve access to trusted women's health education and empower more women to make informed health decisions." actions={[
          <a key="contact" href="mailto:docadi.healthinitiative@gmail.com" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">Contact Us</a>,
          <Link key="resources" to="/resources" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Explore Resources</Link>,
          <Link key="community" to="/blog" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Join Our Community</Link>,
        ]} />
        <div className="text-center">
          <a href="#top" className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-dahiPrimary hover:text-dahiPrimary">Back to top</a>
        </div>
      </section>
    </>
  );
}

export default ContactPage;
