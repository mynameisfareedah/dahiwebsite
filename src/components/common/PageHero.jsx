import { Link } from 'react-router-dom';

function PageHero({ eyebrow, title, description, image, actions, breadcrumbs = [] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="hero-glow overflow-hidden rounded-[2rem] px-6 py-8 text-white shadow-2xl sm:px-8 lg:px-12 lg:py-12">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            {breadcrumbs.length > 0 && (
              <nav aria-label="Breadcrumb" className="mb-4 text-sm text-white/80">
                <ol className="flex flex-wrap items-center gap-2">
                  <li><Link to="/" className="hover:text-white">Home</Link></li>
                  {breadcrumbs.map((crumb) => (
                    <li key={crumb.label} className="flex items-center gap-2">
                      <span>/</span>
                      {crumb.to ? <Link to={crumb.to} className="hover:text-white">{crumb.label}</Link> : <span>{crumb.label}</span>}
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            <span className="eyebrow bg-white/15 text-white">{eyebrow}</span>
            <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">{description}</p>
            {actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div>}
          </div>
          {image && (
            <div className="rounded-[1.3rem] border border-white/20 bg-white/10 p-3 backdrop-blur">
              <img src={image} alt={title} loading="lazy" className="h-[260px] w-full rounded-[1.05rem] object-cover sm:h-[320px]" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default PageHero;
