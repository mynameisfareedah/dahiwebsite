import { useEffect } from 'react';
import SEO from '../../components/common/SEO';
import VolunteerHero from '../../components/volunteer/VolunteerHero';
import WhyVolunteer from '../../components/volunteer/WhyVolunteer';
import VolunteerOpportunitiesSection from '../../components/volunteer/VolunteerOpportunitiesSection';
import VolunteerProcess from '../../components/volunteer/VolunteerProcess';
import VolunteerTestimonials from '../../components/volunteer/VolunteerTestimonials';
import VolunteerFAQ from '../../components/volunteer/VolunteerFAQ';
import VolunteerApplicationForm from '../../components/volunteer/VolunteerApplicationForm';

function VolunteerPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEO title="Volunteer with Doc Adi Health Initiative" description="Learn how to volunteer with DAHI and support trusted women's health education and community outreach." />
      <main className="space-y-16">
        <VolunteerHero />
        <WhyVolunteer />
        <VolunteerOpportunitiesSection />
        <VolunteerProcess />
        <VolunteerTestimonials />
        <VolunteerFAQ />
        <VolunteerApplicationForm />
      </main>
    </>
  );
}

export default VolunteerPage;
