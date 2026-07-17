/**
 * Admin package exports
 * Centralized exports for easier imports
 */

// Context
export { AdminAuthProvider, AdminAuthContext } from './context/AdminAuthContext';
export { ToastProvider, useToast } from './contexts/ToastContext';

// Hooks
export { useAdminAuth } from './hooks/useAdminAuth';
export { usePagination, useSearch, useSorting, useForm, useAsync } from './hooks/useDataManagement';

// Services
export { authService } from './services/authService';

// Routes
export { adminRoutes } from './routes/adminRoutes';
export { ProtectedRoute } from './routes/ProtectedRoute';

// Utils
export { ADMIN_ROUTES, SIDEBAR_MENU, STORAGE_KEYS } from './utils/constants';
