import { Link } from 'react-router-dom';

function AboutHero() {
  return (
    <section className="max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="hero-glow overflow-hidden rounded-[2rem] px-6 py-8 text-white shadow-2xl sm:px-8 lg:px-12 lg:py-12">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="eyebrow bg-white/15 text-white">About DAHI</span>
            <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">About Doc Adi Health Initiative (DAHI)</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">
              Doc Adi Health Initiative (DAHI) is a health education organisation committed to empowering women with the knowledge, resources, and support they need to make informed decisions about their health.
            </p>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/90">
              Through accessible health education, community engagement, expert-led discussions, and practical resources, DAHI seeks to bridge gaps in health awareness and create a supportive environment where women can learn, ask questions, and take proactive steps towards better health outcomes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/resources" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">Explore Resources</Link>
              <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutHero;
