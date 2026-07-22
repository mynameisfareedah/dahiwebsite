import { useEffect, useState } from 'react';
import { resolveResourceAccess } from '../../utils/resourceAccess';

function ResourceCard({
  title,
  category,
  description,
  image,
  type,
  price,
  currency,
  platform,
  externalUrl,
  buttonText,
}) {
  const action = resolveResourceAccess({
    externalUrl,
    buttonText,
  });

  const [imageSrc, setImageSrc] = useState(image || '/ebook.svg');

  useEffect(() => {
    setImageSrc(image || '/ebook.svg');
  }, [image]);

  const parsedPrice = Number(price ?? 0);
  const hasPrice = Number.isFinite(parsedPrice) && parsedPrice > 0;
  const displayCurrency = String(currency || 'NGN').toUpperCase();

  return (
    <article className="soft-card overflow-hidden">
      <img
        src={imageSrc}
        alt={title || 'Resource'}
        loading="lazy"
        className="h-48 w-full object-cover"
        onError={() => setImageSrc('/ebook.svg')}
      />
      <div className="p-7">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">{category || 'Resource'}</div>
        <h3 className="mt-3 text-xl font-semibold text-slate-900">{title || 'Untitled Resource'}</h3>
        <p className="mt-3 text-slate-600">{description || 'No description available'}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {type ? <span className="rounded-full bg-slate-100 px-3 py-1">{type}</span> : null}
          {platform ? <span className="rounded-full bg-slate-100 px-3 py-1">{platform}</span> : null}
        </div>
        {hasPrice ? (
          <div className="mt-4 text-sm font-semibold text-slate-900">
            {displayCurrency} {parsedPrice.toLocaleString()}
          </div>
        ) : null}
        {action.enabled ? (
          <a href={action.href} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex rounded-full bg-dahiPrimary px-4 py-2 text-sm font-semibold text-white transition hover:bg-dahiSecondary">{action.label}</a>
        ) : (
          <button type="button" disabled className="mt-6 inline-flex cursor-not-allowed rounded-full bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-600">{action.label}</button>
        )}
      </div>
    </article>
  );
}

export default ResourceCard;
