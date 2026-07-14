import { resourceHighlights } from '../../data/siteContent';
import { Link } from 'react-router-dom';

function ResourcesPreview() {
  return (
    <section id="resources" className="section-shell mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <span className="eyebrow">Educational Resources</span>
          <h2 className="mt-4 section-title">Featured resources for women’s health education</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">Explore practical guides, eBooks, and trusted materials created to support women with clear and accessible health education.</p>
        </div>
        <Link to="/resources" className="inline-flex items-center justify-center rounded-full bg-dahiPrimary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-dahiSecondary">Browse All Resources</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {resourceHighlights.map((resource) => (
          <article key={resource.title} className="soft-card overflow-hidden">
            <img src={resource.image} alt={resource.title} loading="lazy" className="h-56 w-full object-cover" />
            <div className="p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">{resource.category}</div>
              <h3 className="mt-3 text-xl font-semibold text-slate-900">{resource.title}</h3>
              <p className="mt-3 text-slate-600">{resource.description}</p>
              <div className="mt-6">
                <a href={resource.link} target="_blank" rel="noopener" className="rounded-full bg-dahiPrimary px-4 py-2 text-sm font-semibold text-white transition hover:bg-dahiSecondary">View Resource</a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ResourcesPreview;
