import { Link } from 'react-router-dom';
import SupabaseContent from '../common/SupabaseContent';
import ResourceCard from '../common/ResourceCard';

function ResourcesPreview() {
  return (
    <section id="resources" className="section-shell max-w-7xl">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <span className="eyebrow">Learn with DAHI</span>
          <h2 className="mt-4 section-title">Educational Resources</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">Practical guides and trusted materials to support women’s health education.</p>
        </div>
        <Link to="/resources" className="inline-flex items-center justify-center rounded-full bg-dahiPrimary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-dahiSecondary">Browse All Resources</Link>
      </div>

      <SupabaseContent
        table="resources"
        emptyMessage="Resources will appear here once content is published."
        render={(items) => (
          <div className="grid gap-6">
            {(items || []).slice(0, 3).map((resource) => (
              <ResourceCard
                key={resource?.id || resource?.title || 'resource'}
                title={resource?.title || 'Untitled Resource'}
                category={resource?.category || resource?.type || 'Resource'}
                description={resource?.description || 'No description available'}
                author={resource?.author}
                featured={resource?.featured}
                status={resource?.status}
                image={resource?.cover_image || resource?.thumbnail_url || resource?.image || resource?.image_url || '/ebook.svg'}
                type={resource?.resource_type || resource?.type}
                price={resource?.price}
                currency={resource?.currency}
                platform={resource?.platform}
                externalUrl={resource?.external_url || resource?.externalUrl || resource?.selar_url || resource?.file_url}
                buttonText={resource?.button_text || resource?.buttonText}
                compact
              />
            ))}
          </div>
        )}
      />
    </section>
  );
}

export default ResourcesPreview;
