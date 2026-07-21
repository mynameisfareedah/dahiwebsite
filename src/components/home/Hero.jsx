import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUpcomingEvents } from '../../services/supabase/eventsService';
import { resolveRegistrationState } from '../../utils/registration';

function Hero() {
  const [event, setEvent] = useState(null);

  useEffect(() => {
    let mounted = true;

    getUpcomingEvents(1)
      .then((res) => {
        if (!mounted) return;
        setEvent((res.data && res.data[0]) || null);
      })
      .catch(() => {
        if (!mounted) return;
        setEvent(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const registrationState = resolveRegistrationState(event, 'Register Now');

  return (
    <section id="hero" className="w-full px-4 pb-12 pt-6 sm:px-6 lg:px-0 lg:pb-20">
      <div className="hero-glow overflow-hidden rounded-[2rem] px-6 py-10 shadow-2xl sm:px-8 lg:px-12 lg:py-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="text-white">
            <span className="eyebrow bg-white/15 text-white">Trusted health education for Muslim women</span>
            <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">Empowering Muslim Women Through Trusted Health Education</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">DAHI is dedicated to providing evidence-based health education, practical resources, and a supportive community that empowers women to make informed decisions about their health and well-being.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {registrationState.enabled ? (
                <a href={registrationState.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">{registrationState.label}</a>
              ) : (
                <button type="button" disabled className="inline-flex cursor-not-allowed items-center justify-center rounded-full bg-slate-200 px-6 py-3 text-sm font-semibold text-slate-600">{registrationState.label}</button>
              )}
              <Link to="/donate" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Donate</Link>
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
                fetchPriority="high"
                className="h-[320px] w-full rounded-[1.2rem] object-cover sm:h-[420px]"
              />
            </picture>
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
