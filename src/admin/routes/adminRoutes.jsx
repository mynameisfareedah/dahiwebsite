import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

/**
 * Admin Route Definitions
 * All routes are lazy loaded for better performance
 * Protected routes are wrapped with ProtectedRoute component
 */

// Lazy load admin pages
const AdminLoginPage = lazy(() => import('../pages/AdminLoginPage'));
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const AdminEventsPage = lazy(() => import('../pages/Events/EventsPage'));
const CreateEvent = lazy(() => import('../pages/Events/CreateEvent'));
const EditEvent = lazy(() => import('../pages/Events/EditEvent'));
const EventDetails = lazy(() => import('../pages/Events/EventDetails'));
const AdminResources = lazy(() => import('../pages/AdminResources'));
const AdminTeam = lazy(() => import('../pages/AdminTeam'));
const AdminCommunity = lazy(() => import('../pages/AdminCommunity'));
const AdminMessages = lazy(() => import('../pages/AdminMessages'));
const AdminVolunteers = lazy(() => import('../pages/AdminVolunteers'));
const AdminVolunteerApplications = lazy(() => import('../pages/AdminVolunteerApplications'));
const AdminSponsors = lazy(() => import('../pages/AdminSponsors'));
const AdminSettings = lazy(() => import('../pages/AdminSettings'));
const AdminProfile = lazy(() => import('../pages/AdminProfile'));
const AdminProfileSettings = lazy(() => import('../pages/AdminProfileSettings'));
const AdminPreferences = lazy(() => import('../pages/AdminPreferences'));
const AdminAuditTrail = lazy(() => import('../pages/AdminAuditTrail'));
const AdminUsers = lazy(() => import('../pages/AdminUsers'));
const AdminDonations = lazy(() => import('../pages/AdminDonations'));

/**
 * Routes for the admin panel
 * Rendered directly in App.jsx
 */
export const adminRoutes = [
  <Route key="admin-login" path="/admin/login" element={<AdminLoginPage />} />,
  <Route key="admin-protected" path="/admin" element={<ProtectedRoute />}>
    <Route element={<AdminLayout />}>
      <Route index element={<AdminDashboard />} />
      <Route path="events" element={<AdminEventsPage />} />
      <Route path="events/create" element={<CreateEvent />} />
      <Route path="events/edit/:id" element={<EditEvent />} />
      <Route path="events/:id" element={<EventDetails />} />
      <Route path="resources" element={<AdminResources />} />
      <Route path="donations" element={<AdminDonations />} />
      <Route path="team" element={<AdminTeam />} />
      <Route path="community" element={<AdminCommunity />} />
      <Route path="messages" element={<AdminMessages />} />
      <Route path="volunteers" element={<AdminVolunteers />} />
      <Route path="volunteer-applications" element={<AdminVolunteerApplications />} />
      <Route path="sponsors" element={<AdminSponsors />} />
      <Route path="audit-trail" element={<AdminAuditTrail />} />
      <Route path="settings" element={<AdminSettings />} />
      <Route path="profile" element={<AdminProfileSettings />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="preferences" element={<AdminPreferences />} />
    </Route>
  </Route>,
];
