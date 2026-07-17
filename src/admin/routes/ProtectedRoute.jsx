import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import LoadingState from '../../components/common/LoadingState';

/**
 * ProtectedRoute Component
 * Redirects unauthenticated users to login page
 * Renders loading state while checking authentication
 */
export function ProtectedRoute() {
  const { user, isAdmin, loading } = useAdminAuth();

  if (loading) {
    return <LoadingState message="Checking authentication..." />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
