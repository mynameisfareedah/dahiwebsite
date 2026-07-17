import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AdminAuthContext = createContext(null);

function loadStoredSession() {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem('dahi-admin-session');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function persistSession(session) {
  if (typeof window === 'undefined') return;
  if (session) {
    window.localStorage.setItem('dahi-admin-session', JSON.stringify(session));
  } else {
    window.localStorage.removeItem('dahi-admin-session');
  }
}

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(loadStoredSession());
  const [loading, setLoading] = useState(true);

  const user = session?.user ?? null;

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase.auth.getSession();
          if (active) {
            if (data.session) {
              setSession(data.session);
              persistSession(data.session);
            } else {
              const saved = loadStoredSession();
              if (saved) setSession(saved);
            }
          }
        } else {
          const saved = loadStoredSession();
          if (active && saved) setSession(saved);
        }
      } catch {
        const saved = loadStoredSession();
        if (active && saved) setSession(saved);
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();

    let authListener;
    if (isSupabaseConfigured && supabase) {
      const listener = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
        persistSession(nextSession);
      });
      authListener = listener.data;
    }

    return () => {
      active = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase authentication is not configured. Please set up VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setSession(data.session);
    persistSession(data.session);
    return data.session;
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error during signout:', err);
      }
    }
    setSession(null);
    persistSession(null);
  };

  const resetPassword = async (email) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Password reset requires Supabase to be configured.');
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { message: 'Password reset link sent.' };
  };

  const value = useMemo(() => ({ user, session, loading, signIn, signOut, resetPassword }), [loading, session, user]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return context;
}
