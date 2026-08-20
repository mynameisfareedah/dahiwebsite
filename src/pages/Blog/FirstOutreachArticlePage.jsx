import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import SectionHeading from '../../components/common/SectionHeading';
import CTASection from '../../components/common/CTASection';

function FirstOutreachArticlePage() {
  return (
    <>
      <SEO
        title="First Community Health Outreach in Gwagwalada | Doc Adi Health Initiative"
        description="Doc Adi Health Initiative’s first community health outreach in Gwagwalada, Abuja, focused on women’s health awareness, early detection, and preventive healthcare."
        image="/OUTREACH/Community Audience & Participants.jfif"
        path="/blog/first-community-outreach"
      />

      <article className="section-shell max-w-4xl">
        <div className="mb-10">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">Community Outreach · Aug 15, 2026</div>
          <h1 className="mt-4 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">Doc Adi Health Initiative Successfully Hosts First Community Health Outreach in Gwagwalada</h1>
          <p className="mt-5 text-xl leading-8 text-slate-600">Silent Diseases in Women: Early Detection Saves Lives</p>
        </div>

        <img src="/OUTREACH/Community Audience & Participants.jfif" alt="Community gathering during DAHI's first health outreach in Gwagwalada, Abuja" width="1195" height="896" className="max-h-[720px] w-full rounded-[1.5rem] object-cover shadow-sm" />

        <div className="mt-10 space-y-8 text-lg leading-8 text-slate-700">
          <section>
            <SectionHeading eyebrow="Introduction" title="A meaningful step for DAHI" />
            <p className="mt-4">On August 15, 2026, Doc Adi Health Initiative successfully held its first community health outreach in Gwagwalada, Abuja. The programme brought women together for health education, awareness, screening, and meaningful conversations around early detection and preventive healthcare.</p>
          </section>
          <section>
            <SectionHeading eyebrow="Why the outreach was organised" title="Taking trusted education into the community" />
            <p className="mt-4">Since its inception, DAHI has created accessible digital health education and practical resources. This first outreach extended that work into a community setting, making room for direct engagement and health conversations around a theme that affects women across different stages of life.</p>
          </section>
          <section>
            <SectionHeading eyebrow="Event details" title="Gwagwalada, Abuja" />
            <p className="mt-4">The outreach took place at Dele Salawudeen Preparatory School in Gwagwalada, Abuja, Nigeria, beginning at 10:00 AM. Its theme was “Silent Diseases in Women: Early Detection Saves Lives.”</p>
          </section>
          <section>
            <SectionHeading eyebrow="What happened during the outreach" title="Education, screening, and engagement" />
            <p className="mt-4">The programme information included a health education session, blood pressure screening, BMI assessment, breast health awareness, cervical cancer awareness, and distribution of health education materials. These activities supported practical learning and encouraged women to ask questions in a welcoming environment.</p>
          </section>
          <section>
            <SectionHeading eyebrow="Looking ahead" title="A beginning for community-based health education" />
            <p className="mt-4">DAHI’s first community outreach marks a new chapter in the initiative’s work. The organisation will continue connecting digital resources, health education, and community-based opportunities that help women access trustworthy information and make informed decisions about their wellbeing.</p>
          </section>
        </div>
      </article>

      <CTASection eyebrow="Continue exploring" title="Read more about the first outreach" description="Visit the dedicated outreach page for the event background, activities, impact themes, and available gallery assets." actions={[
        <Link key="outreach" to="/outreach" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">View Outreach Page</Link>,
        <Link key="blog" to="/blog" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Back to Blog</Link>,
      ]} />
    </>
  );
}

export default FirstOutreachArticlePage;
