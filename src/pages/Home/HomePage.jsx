import Hero from '../../components/home/Hero';
import UpcomingOutreachSection from '../../components/home/UpcomingOutreachSection';
import AboutPreview from '../../components/home/AboutPreview';
import FeaturedPrograms from '../../components/home/FeaturedPrograms';
import MeetDocAdi from '../../components/home/MeetDocAdi';
import Impact from '../../components/home/Impact';
import ResourcesPreview from '../../components/home/ResourcesPreview';
import Testimonials from '../../components/home/Testimonials';
import GetInvolved from '../../components/home/GetInvolved';
import FeaturedSubstackArticle from '../../components/home/FeaturedSubstackArticle';
import NewsletterSection from '../../components/home/NewsletterSection';
import FAQ from '../../components/home/FAQ';
import SEO from '../../components/common/SEO';

function HomePage() {
  return (
    <>
      <SEO title="Doc Adi Health Initiative | Trusted Health Education for Muslim Women" description="Doc Adi Health Initiative (DAHI) provides trusted, evidence-based health education, practical resources and community outreach for Muslim women and girls." image="/community-1200.jpg" path="/" />

      {/* 1. Hero Section */}
      <Hero />

      {/* 2. About DAHI */}
      <AboutPreview />

      {/* 3. Our Focus Areas */}
      <FeaturedPrograms />

      {/* 4. Featured Programs / Meet the Founder */}
      <MeetDocAdi />

      {/* 6. Impact & Achievements */}
      <Impact />

      {/* 6.5. Featured Substack Article */}
      <FeaturedSubstackArticle />

      {/* 6.5. Completed First Community Outreach */}
      <UpcomingOutreachSection />

      {/* 7. Featured Health Resources */}
      <ResourcesPreview />

      {/* 7. Testimonials */}
      <Testimonials />

      {/* 8. Get Involved */}
      <GetInvolved />

      {/* 10. Newsletter Subscription */}
      <NewsletterSection />

      {/* 11. FAQ */}
      <FAQ />
    </>
  );
}

export default HomePage;
