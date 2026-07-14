import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import LoadingState from '../common/LoadingState';

function ProtectedRoute() {
  const { user, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) return <LoadingState message="Checking admin access..." />;
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />;

  return <Outlet />;
}

export default ProtectedRoute;
