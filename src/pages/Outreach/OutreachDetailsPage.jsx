import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Zap } from 'lucide-react';
import SEO from '../../components/common/SEO';
import SectionHeading from '../../components/common/SectionHeading';
import CTASection from '../../components/common/CTASection';
import ObjectivesGrid from '../../components/outreach/ObjectivesGrid';
import ActivityCard from '../../components/outreach/ActivityCard';
import ProgrammeSchedule from '../../components/outreach/ProgrammeSchedule';
import SpeakerCard from '../../components/outreach/SpeakerCard';
import RegistrationSection from '../../components/outreach/RegistrationSection';
import DonationSection from '../../components/outreach/DonationSection';
import OutreachFAQSection from '../../components/outreach/OutreachFAQSection';
import PostEventHighlights from '../../components/outreach/PostEventHighlights';
import { upcomingOutreach } from '../../data/siteContent';

function OutreachDetailsPage() {
  return (
    <>
      <SEO
        title="August Community Health Outreach 2026"
        description="Join DAHI for the August Community Health Outreach. Free health education, screenings, and community engagement for women."
      />

      {/* Hero Section */}
      <section className="section-shell max-w-7xl space-y-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-6">
            <div>
              <span className="eyebrow bg-dahiPrimary/10 text-dahiPrimary">August 2026</span>
              <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
                {upcomingOutreach.title}
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                {upcomingOutreach.subtitle}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-dahiPrimary flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">{upcomingOutreach.dateRange}</div>
                  <div className="text-xs text-slate-600">Event Date</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-dahiPrimary flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">{upcomingOutreach.venue}</div>
                  <div className="text-xs text-slate-600">{upcomingOutreach.location}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-dahiPrimary flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">Women Ages 40–60</div>
                  <div className="text-xs text-slate-600">Open to women in this age group</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row pt-4">
              <Link
                to="/events"
                className="inline-flex items-center justify-center rounded-full bg-dahiPrimary px-6 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary"
              >
                <i className="fa-solid fa-calendar mr-2"></i>
                View All Events
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full border border-dahiPrimary px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:bg-dahiPrimary/5"
              >
                <i className="fa-solid fa-envelope mr-2"></i>
                Contact Team
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-dahiPrimary/20 bg-gradient-to-br from-white via-slate-50 to-dahiPrimary/5 p-2 sm:p-3">
            <img
              src={upcomingOutreach.bannerImage}
              alt={upcomingOutreach.title}
              loading="lazy"
              className="h-[300px] w-full object-contain object-center sm:h-[450px]"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section-shell max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="soft-card p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">About This Outreach</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              {upcomingOutreach.fullDescription}
            </p>
            <div className="rounded-lg border border-dahiPrimary/20 bg-dahiPrimary/5 p-4">
              <div className="flex items-center gap-3 text-dahiPrimary">
                <Zap size={20} />
                <span className="font-semibold">Registration opening soon – stay tuned!</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <SectionHeading
              eyebrow="Who Should Attend"
              title="Target Audience"
            />
            <ul className="space-y-3">
              {upcomingOutreach.targetAudience.map((audience, index) => (
                <li key={index} className="flex items-center gap-3">
                  <i className="fa-solid fa-check-circle text-dahiPrimary flex-shrink-0"></i>
                  <span className="text-slate-700">{audience}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <ObjectivesGrid objectives={upcomingOutreach.objectives} />

      {/* Planned Activities */}
      <section className="section-shell mx-auto max-w-7xl space-y-8">
        <SectionHeading
          eyebrow="What We'll Offer"
          title="Planned Activities"
          description="A comprehensive programme designed to educate, screen, and engage the community."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {upcomingOutreach.plannedActivities.map((activity, index) => (
            <ActivityCard
              key={index}
              title={activity.title}
              description={activity.description}
              icon={activity.icon}
            />
          ))}
        </div>
      </section>

      {/* Programme Schedule */}
      <ProgrammeSchedule schedule={upcomingOutreach.schedule} />

      {/* Speakers */}
      {upcomingOutreach.speakers && upcomingOutreach.speakers.length > 0 && (
        <section className="section-shell mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Meet the Team"
            title="Speakers & Facilitators"
            description="Learn from experienced health professionals and educators."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingOutreach.speakers.map((speaker, index) => (
              <SpeakerCard
                key={index}
                initials={speaker.initials}
                name={speaker.name}
                position={speaker.position}
                organisation={speaker.organisation}
                bio={speaker.bio}
              />
            ))}
          </div>
        </section>
      )}

      {/* Registration */}
      <RegistrationSection registrationStatus={upcomingOutreach.registrationStatus} />

      {/* Donation/Support */}
      <DonationSection donationImpact={upcomingOutreach.donationImpact} />

      {/* FAQ */}
      <OutreachFAQSection faqs={upcomingOutreach.faqs} />

      {/* Post-Event Highlights (Hidden by default) */}
      <PostEventHighlights
        highlights={upcomingOutreach.postEventHighlights}
        enabled={upcomingOutreach.postEventHighlights.enabled}
      />

      {/* Final CTA */}
      <CTASection
        eyebrow="Ready to Join?"
        title="Be Part of This Important Health Initiative"
        description="Whether you're attending, volunteering, sponsoring, or supporting from afar, your involvement matters. We're excited to bring women together for health education and community engagement this August."
        primaryButtonLabel="Learn More About DAHI"
        primaryButtonHref="/about"
        secondaryButtonLabel="Contact Us"
        secondaryButtonHref="/contact"
      />
    </>
  );
}

export default OutreachDetailsPage;
