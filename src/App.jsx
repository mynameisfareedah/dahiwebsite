import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import LoadingState from './components/common/LoadingState';
import { AdminAuthProvider, adminRoutes } from './admin';
import { ToastProvider } from './admin/contexts/ToastContext';

const HomePage = lazy(() => import('./pages/Home/HomePage'));
const AboutPage = lazy(() => import('./pages/About/AboutPage'));
const ProgramsPage = lazy(() => import('./pages/Programs/ProgramsPage'));
const EventsPage = lazy(() => import('./pages/Events/EventsPage'));
const OutreachDetailsPage = lazy(() => import('./pages/Outreach/OutreachDetailsPage'));
const ResourcesPage = lazy(() => import('./pages/Resources/ResourcesPage'));
const BlogPage = lazy(() => import('./pages/Blog/BlogPage'));
const DonatePage = lazy(() => import('./pages/Donate/DonatePage'));
const VolunteerPage = lazy(() => import('./pages/Volunteer/VolunteerPage'));
const ContactPage = lazy(() => import('./pages/Contact/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/Privacy/PrivacyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFound/NotFoundPage'));

function App() {
  return (
    <AdminAuthProvider>
      <ToastProvider>
        <Toaster position="top-right" />
        <Suspense fallback={<LoadingState message="Loading page..." />}>
          <Routes>
            {/* Public website routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/programs" element={<ProgramsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/outreach" element={<OutreachDetailsPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/donate" element={<DonatePage />} />
              <Route path="/volunteer" element={<VolunteerPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
            </Route>

            {/* Admin routes */}
            {adminRoutes}

            {/* 404 - Must be last */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </AdminAuthProvider>
  );
}

export default App;
