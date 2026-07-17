import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * 
 * Environment variables required:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous/public key
 * 
 * Get these from: https://app.supabase.com/project/[PROJECT_ID]/settings/api
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Check if Supabase is properly configured
 */
export const isSupabaseConfigured =
  Boolean(supabaseUrl && supabaseAnonKey) && !supabaseUrl.includes('placeholder');

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

/**
 * Create and export Supabase client
 * Use this client in all services to interact with the database
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Helper to handle Supabase errors consistently
 */
export function handleSupabaseError(error) {
  if (!error) return null;
  
  console.error('Supabase Error:', {
    message: error.message,
    code: error.code,
    status: error.status,
  });

  return {
    message: error.message || 'An error occurred',
    code: error.code,
    status: error.status,
  };
}

export default supabase;
