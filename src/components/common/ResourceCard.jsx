function ResourceCard({ title, category, description, image, href = '#', price }) {
  return (
    <article className="soft-card overflow-hidden">
      <img src={image} alt={title} loading="lazy" className="h-48 w-full object-cover" />
      <div className="p-7">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">{category}</div>
        <h3 className="mt-3 text-xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-3 text-slate-600">{description}</p>
        {price ? <div className="mt-4 text-sm font-semibold text-slate-900">{price}</div> : null}
        <a href={href} target="_blank" rel="noopener" className="mt-6 inline-flex rounded-full bg-dahiPrimary px-4 py-2 text-sm font-semibold text-white transition hover:bg-dahiSecondary">Read / Download</a>
      </div>
    </article>
  );
}

export default ResourceCard;
