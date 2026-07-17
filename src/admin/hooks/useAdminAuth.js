import { useContext } from 'react';
import { AdminAuthContext } from '../context/AdminAuthContext';

/**
 * Hook to access admin auth context
 * @returns {Object} Admin auth context
 * @throws {Error} If used outside of AdminAuthProvider
 */
export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }

  return context;
}
