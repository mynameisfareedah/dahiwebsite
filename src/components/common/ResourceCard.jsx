import { useEffect, useState } from 'react';
import { resolveResourceAccess } from '../../utils/resourceAccess';

function ResourceCard({
  title,
  category,
  description,
  image,
  type,
  author,
  featured,
  status,
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
    <article className="group overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl">
      <div className="flex min-h-[320px] flex-col lg:flex-row lg:items-stretch">
        <div className="relative h-80 w-full overflow-hidden bg-slate-100 lg:h-auto lg:w-[38%] lg:shrink-0">
          <img
            src={imageSrc}
            alt={title || 'Resource'}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={() => setImageSrc('/ebook.svg')}
          />
        </div>

        <div className="flex flex-1 flex-col gap-6 p-7 lg:p-8">
          <div className="flex flex-wrap gap-2">
            {featured ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">Featured</span>
            ) : null}
            <span className="rounded-full bg-dahiPrimary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-dahiPrimary">{category || 'Resource'}</span>
            {type ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">{type}</span>
            ) : null}
          </div>

          <div className="flex-1">
            <h3 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{title || 'Untitled Resource'}</h3>
            {author ? <p className="mt-3 text-sm text-slate-500">By {author}</p> : null}
            <p className="mt-5 text-slate-600 line-clamp-3">{description || 'No description available'}</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              {action.enabled ? (
                <a
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-full bg-dahiPrimary px-5 py-3 text-center text-sm font-semibold text-white transition duration-300 hover:bg-dahiSecondary sm:w-auto"
                >
                  {action.label}
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-full bg-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-600 sm:w-auto"
                >
                  {action.label}
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {status ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">{status}</span>
              ) : null}
              {platform ? <span className="text-sm font-medium text-slate-600">{platform}</span> : null}
              {hasPrice ? <span className="text-sm font-semibold text-slate-900">{displayCurrency} {parsedPrice.toLocaleString()}</span> : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ResourceCard;
