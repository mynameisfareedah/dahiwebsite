import { supabase, isSupabaseConfigured } from '../../lib/supabase';

import { STORAGE_KEYS } from '../utils/constants';

const AUTH_REQUEST_TIMEOUT_MS = 12000;

async function withTimeout(promise, timeoutMs, timeoutMessage) {
  let timerId;
  const timeoutPromise = new Promise((_, reject) => {
    timerId = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timerId);
  }
}

/**
 * Authentication Service
 * Handles all authentication operations with Supabase
 */

class AuthService {
  /**
   * Sign in with email and password
   * Requires Supabase to be configured - will reject login if credentials are missing.
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{user: Object, session: Object, error: null} | {error: string}>}
   */
  async signIn(email, password) {
    if (!isSupabaseConfigured) {
      return { 
        error: 'Admin authentication is not configured. Supabase credentials are required. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local and restart the development server.' 
      };
    }

    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        AUTH_REQUEST_TIMEOUT_MS,
        'Timed out while signing in.'
      );

      if (error) {
        return { error: error.message };
      }

      this.persistSession(data.session);
      return { user: data.user, session: data.session, error: null };
    } catch (err) {
      return { error: err.message };
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise<{error: null} | {error: string}>}
   */
  async signOut() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Supabase signout error:', error);
        }
      } catch (err) {
        console.error('Error during signout:', err);
      }
    }

    this.clearSession();
    return { error: null };
  }

  /**
   * Get current session
   * Only returns valid Supabase sessions when configured.
   * @returns {Promise<Object|null>}
   */
  async getSession() {
    if (!isSupabaseConfigured) {
      // When Supabase is not configured, no sessions are valid
      this.clearSession();
      return null;
    }

    try {
      const { data, error } = await withTimeout(
        supabase.auth.getSession(),
        AUTH_REQUEST_TIMEOUT_MS,
        'Timed out while loading the Supabase session.'
      );

      if (error) {
        console.error('Error getting session:', error);
        return null;
      }

      if (data.session) {
        this.persistSession(data.session);
        return data.session;
      }

      return null;
    } catch (err) {
      console.error('Error getting session:', err);
      return null;
    }
  }

  /**
   * Get current user
   * Only returns valid Supabase users when configured.
   * @returns {Promise<Object|null>}
   */
  async getUser() {
    const result = await supabase.auth.getUser();
    return result.data?.user ?? null;
  }

  /**
   * Verify whether the authenticated user is an active admin.
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async verifyAdmin(userId) {
    if (!isSupabaseConfigured || !supabase || !userId) {
      return false;
    }

    try {
      const { data, error } = await withTimeout(
        supabase
          .from('admin_users')
          .select('active, role')
          .eq('id', userId)
          .maybeSingle(),
        AUTH_REQUEST_TIMEOUT_MS,
        'Timed out while validating admin access.'
      );

      if (error || !data) {
        if (error) console.error('Verify admin error:', error);
        return false;
      }

      const role = String(data.role || '').trim();
      const isActive = data.active === true;
      return isActive && (role === 'Admin' || role === 'Super Admin');
    } catch (err) {
      console.error('Verify admin error:', err);
      return false;
    }
  }

  /**
   * Watch auth state changes
   * Only works when Supabase is configured.
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChange(callback) {
    if (!isSupabaseConfigured) {
      // When Supabase is not configured, immediately call callback with null session
      callback(null, null);
      return () => {};
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        this.persistSession(session);
      } else {
        this.clearSession();
      }
      callback(event, session);
    });

    return () => subscription?.unsubscribe();
  }

  /**
   * Persist session to localStorage
   * @param {Object} session - Session object
   */
  persistSession(session) {
    try {
      console.log("Persisting session...", session);

      localStorage.setItem(
        STORAGE_KEYS.AUTH_SESSION,
        JSON.stringify(session)
      );

      console.log("Stored:", localStorage.getItem(STORAGE_KEYS.AUTH_SESSION));
      console.log("Keys:", Object.keys(localStorage));
    } catch (err) {
      console.error("Persist session failed:", err);
    }
  }

  /**
   * Get stored session from localStorage
   * @returns {Object|null}
   */
  getStoredSession() {
    if (typeof window === 'undefined') return null;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error('Error retrieving stored session:', err);
      return null;
    }
  }

  /**
   * Clear session from localStorage
   */
  clearSession() {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    } catch (err) {
      console.error('Error clearing session:', err);
    }
  }
}

export const authService = new AuthService();
