import { useLocation } from 'react-router-dom';
import SEO from '../../components/common/SEO';

function NotFoundPage() {
  const location = useLocation();

  return (
    <>
      <SEO title="404 Page Not Found" description="The page you requested could not be found." path={location.pathname || '/'} />
      <section className="section-shell max-w-7xl">
        <div className="soft-card p-8 sm:p-10 text-center">
          <span className="eyebrow">404</span>
          <h1 className="mt-4 text-3xl font-black text-slate-900">Page Not Found</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">The page you are looking for does not exist.</p>
        </div>
      </section>
    </>
  );
}

export default NotFoundPage;
