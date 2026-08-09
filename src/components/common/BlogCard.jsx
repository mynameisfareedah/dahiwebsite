import { Link } from 'react-router-dom';

function BlogCard({ title, excerpt, category, author, date, image, href = '#', readTime }) {
  const isInternalRoute = typeof href === 'string' && href.startsWith('/') && !href.startsWith('//');

  return (
    <article className="soft-card overflow-hidden">
      <picture>
        {image === '/community-768.jpg' ? <source srcSet="/community-480.webp 480w, /community-768.webp 768w, /community-1200.webp 1200w" sizes="(max-width: 768px) 100vw, 50vw" type="image/webp" /> : null}
        <img src={image} alt={title} width="768" height="437" loading="lazy" className="h-48 w-full object-cover" />
      </picture>
      <div className="p-7">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">{category}</div>
        <h3 className="mt-3 text-xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-3 text-slate-600">{excerpt}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span>{author}</span>
          <span>•</span>
          <span>{date}</span>
          {readTime && (
            <>
              <span>•</span>
              <span>{readTime}</span>
            </>
          )}
        </div>
        {isInternalRoute ? (
          <Link to={href} className="mt-6 inline-flex rounded-full bg-dahiPrimary px-4 py-2 text-sm font-semibold text-white transition hover:bg-dahiSecondary">Read More</Link>
        ) : (
          <a href={href} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex rounded-full bg-dahiPrimary px-4 py-2 text-sm font-semibold text-white transition hover:bg-dahiSecondary">Read More</a>
        )}
      </div>
    </article>
  );
}

export default BlogCard;
