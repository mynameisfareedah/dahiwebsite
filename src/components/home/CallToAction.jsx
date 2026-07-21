function CallToAction() {
  return (
    <section id="community" className="section-shell max-w-7xl">
      <div className="soft-card overflow-hidden">
        <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
          <picture>
            <source
              srcSet="/community-480.webp 480w, /community-768.webp 768w, /community-1200.webp 1200w"
              sizes="(max-width: 1024px) 100vw, 45vw"
              type="image/webp"
            />
            <img
              src="/community-768.jpg"
              srcSet="/community-480.jpg 480w, /community-768.jpg 768w, /community-1200.jpg 1200w"
              sizes="(max-width: 1024px) 100vw, 45vw"
              alt="DAHI community gathering"
              width="768"
              height="437"
              loading="lazy"
              className="h-72 w-full rounded-[1.25rem] object-cover"
            />
          </picture>
          <div className="flex flex-col justify-center">
            <span className="eyebrow">Join the Community</span>
            <h2 className="mt-4 text-3xl font-black text-slate-900">Become Part of the DAHI Community</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">Join a growing community of women committed to learning, supporting one another, and making informed health decisions through trusted education and meaningful conversations.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="https://whatsapp.com/channel/0029VbBdF4hLI8YZRabyWF0j" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full bg-dahiPrimary px-6 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary">Join WhatsApp Community</a>
              <a href="https://forms.gle/joTjf3VYW9anCA9MA" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-dahiPrimary hover:text-dahiPrimary">Subscribe for Updates</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CallToAction;
