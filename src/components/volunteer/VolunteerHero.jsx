import { Link } from 'react-router-dom';

function VolunteerHero() {
  return (
    <section id="volunteer-hero" className="w-full px-4 pb-12 pt-6 sm:px-6 lg:px-0 lg:pb-20">
      <div className="hero-glow overflow-hidden rounded-[2rem] px-6 py-10 shadow-2xl sm:px-8 lg:px-12 lg:py-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="text-white">
            <span className="eyebrow bg-white/15 text-white">Make a difference in women's health</span>
            <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">Become a Volunteer</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">Join DAHI and help empower Muslim women through trusted health education. Whether you have time, skills, or passion, there's a place for you in our community.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#opportunities" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">
                <i className="fa-solid fa-arrow-down mr-2"></i>
                Explore Opportunities
              </a>
              <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                <i className="fa-solid fa-envelope mr-2"></i>
                Get In Touch
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <div className="text-2xl font-black">50+</div>
                <div className="mt-1 text-sm text-white/80">Active volunteers</div>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <div className="text-2xl font-black">1000+</div>
                <div className="mt-1 text-sm text-white/80">Women impacted</div>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <div className="text-2xl font-black">10+</div>
                <div className="mt-1 text-sm text-white/80">Ways to help</div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/20 bg-white/10 p-4 backdrop-blur">
            <img
              src="/COMMUNITY SUPPORT GROUP.jpg"
              alt="DAHI volunteers in action"
              loading="lazy"
              className="h-[320px] w-full rounded-[1.2rem] object-cover sm:h-[420px]"
            />
            <div className="mt-4 rounded-[1rem] bg-white/95 p-4 text-slate-700">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dahiAccent/20 text-lg text-dahiPrimary">
                  <i className="fa-solid fa-hands-helping"></i>
                </div>
                <div>
                  <div className="font-semibold">Flexible Opportunities</div>
                  <div className="text-sm text-slate-500">Work around your schedule</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VolunteerHero;
