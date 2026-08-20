function NewsletterSection() {
  return (
    <section className="section-shell max-w-7xl">
      <div className="soft-card overflow-hidden p-8 sm:p-10">
        <div className="max-w-3xl">
          <span className="eyebrow">Stay Connected</span>
          <h2 className="mt-4 text-3xl font-black text-slate-900">Stay Connected</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">Receive updates about DAHI webinars, community health initiatives, educational resources, and opportunities to get involved.</p>
        </div>
        <form className="mt-8 max-w-2xl rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 sm:flex sm:items-center sm:gap-3">
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <input id="newsletter-email" type="email" placeholder="Enter your email address" className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none focus:border-dahiPrimary" />
          <button type="submit" className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-dahiPrimary px-5 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary sm:mt-0 sm:w-auto">Subscribe</button>
        </form>
        <p className="mt-3 text-sm text-slate-500">We will only send relevant updates and never share your email.</p>
      </div>
    </section>
  );
}

export default NewsletterSection;
