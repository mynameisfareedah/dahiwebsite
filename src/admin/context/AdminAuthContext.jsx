import { createContext, useEffect, useCallback, useState } from 'react';
import { authService } from '../services/authService';
import { isSupabaseConfigured } from '../../lib/supabase';

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

  const clearAuthState = () => {
    setUser(null);
    setSession(null);
    setIsAdmin(false);
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

        if (!currentSession || !currentUser?.id) {
          if (isMounted) {
            clearAuthState();
            setLoading(false);
          }
          return;
        }

        const authorized = await authService.verifyAdmin(currentUser.id);
        if (!authorized) {
          if (isMounted) {
            await handleUnauthorized();
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
          setLoading(false);
        }
      }
    }

    initializeAuth();

    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;

      if (!newSession) {
        clearAuthState();
        return;
      }

      const currentUser = await authService.getUser();
      const authorized = await authService.verifyAdmin(currentUser?.id);

      if (!authorized) {
        await handleUnauthorized();
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

  /**
   * Sign in handler
   */
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

  const value = {
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
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
