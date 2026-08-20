/* eslint-disable react/no-unknown-property */
import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section id="hero" className="w-full px-4 pb-12 pt-6 sm:px-6 lg:px-0 lg:pb-20">
      <div className="hero-glow overflow-hidden rounded-[2rem] px-6 py-10 shadow-2xl sm:px-8 lg:px-12 lg:py-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/85 sm:text-base">Doc Adi Health Initiative (DAHI)</p>
            <h1 className="max-w-2xl text-4xl font-black uppercase leading-tight tracking-wide sm:text-5xl lg:text-6xl">Trusted Health Education for Muslim Women</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/90">Evidence-based health education, practical resources, and community outreach helping Muslim women and girls make informed decisions about their health and wellbeing.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/resources" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">Explore Resources</Link>
              <Link to="/about" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Learn About DAHI</Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-white/20 bg-white/10 p-3 backdrop-blur">
            <picture>
              <source
                srcSet="/community-480.webp 480w, /community-768.webp 768w, /community-1200.webp 1200w"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 452px"
                type="image/webp"
              />
              <img
                src="/community-768.jpg"
                srcSet="/community-480.jpg 480w, /community-768.jpg 768w, /community-1200.jpg 1200w"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 452px"
                alt="DAHI community members in discussion"
                width="768"
                height="437"
                fetchpriority="high"
                className="h-[320px] w-full rounded-[1.2rem] object-cover sm:h-[420px]"
              />
            </picture>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
