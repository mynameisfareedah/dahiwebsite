import { supabase, isSupabaseConfigured } from '../../lib/supabase';

/**
 * Authentication Service
 * Handles all Supabase authentication operations with real session management
 */

class AuthService {
  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{user: Object, session: Object, error: null} | {error: string}>}
   */
  async signIn(email, password) {
    if (!isSupabaseConfigured || !supabase) {
      return {
        error: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (!data.session) {
        return { error: 'No session returned from authentication' };
      }

      return { user: data.user, session: data.session, error: null };
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: err.message || 'Failed to sign in' };
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise<{error: null} | {error: string}>}
   */
  async signOut() {
    if (!isSupabaseConfigured || !supabase) {
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      console.error('Sign out error:', err);
      return { error: err.message || 'Failed to sign out' };
    }
  }

  /**
   * Get current session
   * @returns {Promise<Object|null>}
   */
  async getCurrentSession() {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Get session error:', error);
        return null;
      }

      return data.session;
    } catch (err) {
      console.error('Get session error:', err);
      return null;
    }
  }

  /**
   * Get current authenticated user
   * @returns {Promise<Object|null>}
   */
  async getCurrentUser() {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Get user error:', error);
        return null;
      }

      return data.user;
    } catch (err) {
      console.error('Get user error:', err);
      return null;
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise<{error: null} | {error: string}>}
   */
  async resetPassword(email) {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase is not configured' };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      console.error('Reset password error:', err);
      return { error: err.message || 'Failed to send reset password email' };
    }
  }

  /**
   * Watch for auth state changes
   * @param {Function} callback - Callback function(event, session)
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChange(callback) {
    if (!isSupabaseConfigured || !supabase) {
      // When not configured, return a no-op unsubscribe function
      return () => {};
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return () => subscription?.unsubscribe();
  }
}

export const authService = new AuthService();
