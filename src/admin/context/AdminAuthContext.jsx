import { createContext, useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { authService } from '../services/authService';
import { logAudit } from '../services/auditService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getAdminProfile } from '../services/profileService';

/**
 * Admin Auth Context
 * Manages authentication state for the admin panel with real Supabase auth
 */
export const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSupabaseReady, setIsSupabaseReady] = useState(isSupabaseConfigured);
  const [profile, setProfile] = useState({
    firstName: null,
    fullName: null,
    lastName: null,
    email: null,
    role: null,
    profile_photo: null,
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const lastProfileUserIdRef = useRef(null);

  const clearAuthState = () => {
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setProfile({
      firstName: null,
      fullName: null,
      lastName: null,
      email: null,
      role: null,
      profile_photo: null,
    });
    setProfileError(null);
    setProfileLoading(false);
    lastProfileUserIdRef.current = null;
  };

  const handleUnauthorized = async () => {
    await authService.signOut();
    clearAuthState();
    setError('You are authenticated but are not authorized to access the admin dashboard.');
  };

  /**
   * Initialize authentication on component mount
   * Check for existing session and set up auth state listener
   */
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        if (!isSupabaseConfigured) {
          if (isMounted) {
            setLoading(false);
          }
          return;
        }

        const currentSession = await authService.getSession();
        const currentUser = await authService.getUser();

        if (!currentSession) {
          if (isMounted) {
            clearAuthState();
            setError(null);
            setLoading(false);
          }
          return;
        }

        if (!currentUser?.id) {
          if (isMounted) {
            clearAuthState();
            setError(null);
            setLoading(false);
          }
          return;
        }

        let authorized = false;

        try {
          authorized = await authService.verifyAdmin(currentUser.id);
        } catch (verifyError) {
          console.error('AdminAuthProvider: verifyAdmin failed', verifyError);
        }

        if (!authorized) {
          if (isMounted) {
            setSession(currentSession);
            setUser(currentUser);
            setIsAdmin(false);
            setError(null);
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setSession(currentSession);
          setUser(currentUser);
          setIsAdmin(true);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMounted) {
          clearAuthState();
          setError(err.message || 'Failed to initialize authentication.');
          console.log('initializeAuth loading false');
          setLoading(false);
        }
      }
    }

    initializeAuth();

    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;

      if (!newSession) {
        console.warn('Received NULL session from Supabase');
        return;
      }

      const currentUser = await authService.getUser();

      let authorized = false;
      try {
        authorized = await authService.verifyAdmin(currentUser?.id);
      } catch (verifyError) {
        console.error('AdminAuthProvider: auth change verifyAdmin failed', verifyError);
      }

      if (!authorized) {
        setSession(newSession);
        setUser(currentUser);
        setIsAdmin(false);
        setError(null);
        return;
      }

      setSession(newSession);
      setUser(currentUser);
      setIsAdmin(true);
      setError(null);
    });

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const userId = user?.id;

    if (!userId) {
      setProfile({
        firstName: null,
        fullName: null,
        lastName: null,
        email: null,
        role: null,
        profile_photo: null,
      });
      setProfileError(null);
      setProfileLoading(false);
      lastProfileUserIdRef.current = null;
      return () => {
        isMounted = false;
      };
    }

    if (lastProfileUserIdRef.current === userId) {
      return () => {
        isMounted = false;
      };
    }

    lastProfileUserIdRef.current = userId;
    setProfileLoading(true);
    setProfileError(null);

    getAdminProfile(user)
      .then((resolvedProfile) => {
        if (!isMounted) return;
        const profileData = resolvedProfile || {};
        const profileToStore = {
          firstName: profileData.firstName ?? null,
          fullName: profileData.fullName ?? null,
          lastName: profileData.lastName ?? null,
          email: profileData.email ?? user?.email ?? null,
          role: profileData.role ?? null,
          profile_photo: profileData.profile_photo ?? null,
        };
        setProfile(profileToStore);
      })
      .catch((err) => {
        if (!isMounted) return;
        const profileToStore = {
          firstName: null,
          fullName: null,
          lastName: null,
          email: user?.email ?? null,
          role: null,
          profile_photo: null,
        };
        setProfile(profileToStore);
        setProfileError(err.message || 'Failed to load profile.');
      })
      .finally(() => {
        if (!isMounted) return;
        setProfileLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const { user: newUser, session: newSession, error: signInError } = await authService.signIn(
        email,
        password
      );

      if (signInError) {
        setError(signInError);
        setLoading(false);
        return { error: signInError };
      }

      if (!newUser?.id || !newSession) {
        const message = 'Failed to sign in. Please try again.';
        setError(message);
        setLoading(false);
        return { error: message };
      }

      const authorized = await authService.verifyAdmin(newUser.id);
      if (!authorized) {
        await authService.signOut();
        clearAuthState();
        const message = 'You are authenticated but are not authorized to access the admin dashboard.';
        setError(message);
        setLoading(false);
        return { error: message };
      }

      await logAudit({
        action: 'LOGIN',
        module: 'Authentication',
        description: 'Admin logged into the dashboard',
      });

      setUser(newUser);
      setSession(newSession);
      setIsAdmin(true);
      setError(null);
      setLoading(false);
      return { error: null };
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      setLoading(false);
      return { error: errorMessage };
    }
  }, []);

  /**
   * Sign out handler
   */
  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: signOutError } = await authService.signOut();

      if (signOutError) {
        setError(signOutError);
        setLoading(false);
        return { error: signOutError };
      }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      setLoading(false);
      return { error: errorMessage };
    }

    clearAuthState();
    setLoading(false);
    return { error: null };
  }, []);

  /**
   * Reset password handler
   */
  const resetPassword = useCallback(async (email) => {
    setError(null);

    try {
      const { error: resetError } = await authService.resetPassword(email);

      if (resetError) {
        setError(resetError);
        return { error: resetError };
      }

      return { error: null };
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      return { error: errorMessage };
    }
  }, []);

  const userDisplayName = (() => {
    // Use firstName from admin_users, extracting first word if multiple words
    const firstName = profile?.firstName;
    if (typeof firstName === 'string' && firstName.trim()) {
      return firstName.trim().split(/\s+/)[0];
    }

    // Fall back to email prefix
    const emailValue = user?.email;
    if (typeof emailValue === 'string' && emailValue.trim()) {
      const [emailPrefix] = emailValue.trim().split('@');
      return emailPrefix || 'Admin';
    }

    return 'Admin';
  })();

  const value = useMemo(() => ({
    user,
    session,
    loading,
    isAdmin,
    error,
    signIn,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
    isSupabaseConfigured: isSupabaseReady,
    profile,
    profileLoading,
    profileError,
    userDisplayName,
  }), [
    user,
    session,
    loading,
    isAdmin,
    error,
    signIn,
    signOut,
    resetPassword,
    isSupabaseReady,
    profile,
    profileLoading,
    profileError,
    userDisplayName,
  ]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
