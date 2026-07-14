import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { trackPageView } from '../lib/analytics';

function MainLayout() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <Navbar />
      <main id="main-content" className="pt-24" tabIndex="-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
