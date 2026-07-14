import Hero from '../../components/home/Hero';
import OutreachAnnouncementBar from '../../components/home/OutreachAnnouncementBar';
import UpcomingOutreachSection from '../../components/home/UpcomingOutreachSection';
import AboutPreview from '../../components/home/AboutPreview';
import FeaturedPrograms from '../../components/home/FeaturedPrograms';
import MeetDocAdi from '../../components/home/MeetDocAdi';
import Impact from '../../components/home/Impact';
import ResourcesPreview from '../../components/home/ResourcesPreview';
import Testimonials from '../../components/home/Testimonials';
import TeamPreview from '../../components/home/TeamPreview';
import GetInvolved from '../../components/home/GetInvolved';
import NewsletterSection from '../../components/home/NewsletterSection';
import FAQ from '../../components/home/FAQ';

function HomePage() {
  return (
    <>
      {/* 0. Outreach Announcement Banner */}
      <OutreachAnnouncementBar />

      {/* 1. Hero Section */}
      <Hero />

      {/* 2. About DAHI */}
      <AboutPreview />

      {/* 3. Our Focus Areas */}
      <FeaturedPrograms />

      {/* 4. Featured Programs / Meet the Founder */}
      <MeetDocAdi />

      {/* 5. Impact & Achievements */}
      <Impact />

      {/* 5.5. Upcoming Outreach Section */}
      <UpcomingOutreachSection />

      {/* 6. Featured Health Resources */}
      <ResourcesPreview />

      {/* 7. Testimonials */}
      <Testimonials />

      {/* 8. Meet the Team */}
      <TeamPreview />

      {/* 9. Get Involved */}
      <GetInvolved />

      {/* 10. Newsletter Subscription */}
      <NewsletterSection />

      {/* 11. FAQ */}
      <FAQ />
    </>
  );
}

export default HomePage;
