import { Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingState from './LoadingState';

const LazySection = ({ children }) => <Suspense fallback={<LoadingState message="Loading section..." />}>{children}</Suspense>;

function PageShell({ children }) {
  const location = useLocation();

  return <LazySection><div key={location.pathname}>{children}</div></LazySection>;
}

export default PageShell;
