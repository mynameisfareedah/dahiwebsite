import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section id="hero" className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-20">
      <div className="hero-glow overflow-hidden rounded-[2rem] px-6 py-10 shadow-2xl sm:px-8 lg:px-12 lg:py-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="text-white">
            <span className="eyebrow bg-white/15 text-white">Trusted health education for Muslim women</span>
            <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">Empowering Muslim Women Through Trusted Health Education</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">DAHI is dedicated to providing evidence-based health education, practical resources, and a supportive community that empowers women to make informed decisions about their health and well-being.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="https://forms.gle/joTjf3VYW9anCA9MA" target="_blank" rel="noopener" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">Join Our Community</a>
              <Link to="/resources" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Explore Resources</Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <div className="text-2xl font-black">500+</div>
                <div className="mt-1 text-sm text-white/80">Women reached</div>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <div className="text-2xl font-black">5</div>
                <div className="mt-1 text-sm text-white/80">Webinars hosted</div>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <div className="text-2xl font-black">3</div>
                <div className="mt-1 text-sm text-white/80">Resources published</div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/20 bg-white/10 p-4 backdrop-blur">
            <img src="/community-768.jpg" alt="DAHI community members in discussion" loading="lazy" className="h-[320px] w-full rounded-[1.2rem] object-cover sm:h-[420px]" />
            <div className="mt-4 rounded-[1rem] bg-white/95 p-4 text-slate-700">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dahiAccent/20 text-lg text-dahiPrimary"><i className="fa-solid fa-heart-pulse"></i></div>
                <div>
                  <div className="font-semibold">Evidence-based support</div>
                  <div className="text-sm text-slate-500">Trusted guidance for every stage of life</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
