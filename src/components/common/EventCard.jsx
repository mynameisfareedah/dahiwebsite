function EventCard({ title, date, time, speaker, description, image, buttonLabel = 'Register', buttonHref = '#' }) {
  return (
    <article className="soft-card overflow-hidden">
      <div className="flex flex-col gap-6 p-4 sm:flex-row sm:items-center sm:p-6">
        <div className="w-full shrink-0 overflow-hidden rounded-[1.25rem] border border-dahiPrimary/20 bg-slate-50 p-2 shadow-sm sm:w-[280px] lg:w-[320px]">
          <img src={image} alt={title} loading="lazy" className="h-56 w-full rounded-[1rem] object-contain bg-white sm:h-72" />
        </div>
        <div className="min-w-0 flex-1 p-2 sm:p-0">
          <div className="flex flex-wrap gap-2 text-sm font-semibold text-dahiSecondary">
            <span>{date}</span>
            <span>•</span>
            <span>{time}</span>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-dahiPrimary">{speaker}</p>
          <p className="mt-3 text-slate-600">{description}</p>
          <a href={buttonHref} target="_blank" rel="noopener" className="mt-6 inline-flex rounded-full bg-dahiPrimary px-4 py-2 text-sm font-semibold text-white transition hover:bg-dahiSecondary">{buttonLabel}</a>
        </div>
      </div>
    </article>
  );
}

export default EventCard;
