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

  console.log('ProtectedRoute loading', loading);
  console.log('ProtectedRoute user', user);
  console.log('ProtectedRoute admin', isAdmin);

  if (loading) {
    return <LoadingState message="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <LoadingState message="Verifying admin access..." />;
  }

  return <Outlet />;
}
