import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../admin/hooks/useAdminAuth';
import LoadingState from '../common/LoadingState';

/**
 * ProtectedRoute Component
 * Protects admin routes by requiring authentication
 * Redirects unauthenticated users to login page
 */
function ProtectedRoute() {
  const { user, loading } = useAdminAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingState message="Checking admin access..." />;
  }

  // Not authenticated: redirect to login
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Authenticated: render the protected page
  return <Outlet />;
}

export default ProtectedRoute;
