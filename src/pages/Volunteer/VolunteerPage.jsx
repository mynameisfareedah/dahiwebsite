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
      <SEO title="Volunteer" description="Learn about volunteering with DAHI, available opportunities, benefits, and how to apply." />
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
