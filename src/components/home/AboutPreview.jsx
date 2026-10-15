import { Link } from 'react-router-dom';
import MissionVisionValues from '../common/MissionVisionValues';

function AboutPreview() {
  return (
    <section id="about" className="section-shell mx-auto max-w-7xl">
      <div className="home-about-copy max-w-4xl">
        <span className="eyebrow">About DAHI</span>
        <h2 className="mt-4 section-title">Health education rooted in evidence, compassion, and faith.</h2>
        <div className="mt-5 space-y-4 text-lg leading-8 text-slate-600">
          <p>Doc Adi Health Initiative (DAHI) is a women&apos;s health education and empowerment initiative focused on providing accessible, clear, and supportive health information to women and young girls.</p>
          <p>We combine evidence-based education with practical resources and community engagement to help women understand their health and make informed decisions.</p>
          <p>In August 2026, this mission expanded into community-based health outreach with DAHI&apos;s first programme in Gwagwalada, Abuja.</p>
        </div>
        <Link to="/about" className="mt-6 inline-flex items-center justify-center rounded-full bg-dahiPrimary px-6 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary">Learn More About DAHI</Link>
      </div>
      <div className="mt-10">
        <MissionVisionValues compact />
      </div>
    </section>
  );
}

export default AboutPreview;
