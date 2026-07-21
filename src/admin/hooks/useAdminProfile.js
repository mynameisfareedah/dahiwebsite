import { useAdminAuth } from './useAdminAuth';

export function useAdminProfile() {
  const { profile, profileLoading, profileError, userDisplayName } = useAdminAuth();

  return {
    firstName: profile?.firstName ?? null,
    fullName: profile?.fullName ?? null,
    email: profile?.email ?? null,
    displayName: userDisplayName,
    loading: profileLoading,
    error: profileError,
  };
}
