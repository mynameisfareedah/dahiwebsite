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

    const unsubscribe = authService.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      console.log('========== AUTH STATE CHANGE ==========');
      console.log('Event:', event);
      console.log('Session:', newSession);
      console.log('=======================================');

      if (!newSession) {
        console.warn('Received NULL session from Supabase.');
        console.warn('Event:', event);

        return;
      }

      const currentUser = await authService.getUser();

      let authorized = false;

      try {
        authorized = await authService.verifyAdmin(currentUser?.id);
      } catch (verifyError) {
        console.error('verifyAdmin failed', verifyError);
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

      const authorized = await authService.verifyAdmin(newUser?.id);
      if (!authorized) {
        await authService.signOut();
        setError('Invalid admin credentials.');
        setLoading(false);
        return { error: 'Invalid admin credentials.' };
      }

      setUser(newUser);
      setSession(newSession);
      setIsAdmin(true);
      setError(null);
      setLoading(false);
      return { user: newUser, session: newSession, error: null };
    } catch (err) {
      const message = err.message || 'Failed to sign in.';
      setError(message);
      setLoading(false);
      return { error: message };
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await authService.signOut();
    if (!result.error) {
      clearAuthState();
    }
    setLoading(false);
    return result;
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      isAdmin,
      loading,
      error,
      profile,
      profileLoading,
      profileError,
      signIn,
      signOut,
      handleUnauthorized,
      isSupabaseReady,
    }),
    [user, session, isAdmin, loading, error, profile, profileLoading, profileError, signIn, signOut, handleUnauthorized, isSupabaseReady]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
