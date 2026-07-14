import { Link } from 'react-router-dom';

function ProgramCard({ title, description, objectives, audience, image, href = '#' }) {
  const isInternalRoute = typeof href === 'string' && href.startsWith('/') && !href.startsWith('//');

  return (
    <article className="soft-card overflow-hidden">
      <img src={image} alt={title} loading="lazy" className="h-48 w-full object-cover" />
      <div className="p-7">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-3 text-slate-600">{description}</p>
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p><span className="font-semibold text-slate-900">Objectives:</span> {objectives}</p>
          <p><span className="font-semibold text-slate-900">Audience:</span> {audience}</p>
        </div>
        {isInternalRoute ? (
          <Link to={href} className="mt-6 inline-flex rounded-full bg-dahiPrimary px-4 py-2 text-sm font-semibold text-white transition hover:bg-dahiSecondary">Learn More</Link>
        ) : (
          <a href={href} className="mt-6 inline-flex rounded-full bg-dahiPrimary px-4 py-2 text-sm font-semibold text-white transition hover:bg-dahiSecondary">Learn More</a>
        )}
      </div>
    </article>
  );
}

export default ProgramCard;
