/**
 * Admin Login Page
 * Production-ready login interface with real Supabase authentication
 * Shows setup notice when Supabase is not configured
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../admin/hooks/useAdminAuth';
import SetupNotice from '../../admin/components/SetupNotice';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user, loading: authLoading, isSupabaseConfigured, error: authContextError } = useAdminAuth();
  
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect authenticated users to admin dashboard
  useEffect(() => {
    if (user && !authLoading) {
      setSuccess(true);
      const timer = setTimeout(() => {
        const from = location.state?.from?.pathname || '/admin';
        navigate(from, { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, navigate, location]);

  // If Supabase is not configured, show setup notice
  if (!isSupabaseConfigured) {
    return <SetupNotice />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await signIn(form.email, form.password);
      if (signInError) {
        setError(signInError);
        setLoading(false);
      }
      // Success will be handled by useEffect above
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl backdrop-blur lg:flex-row">
        {/* Left Column - Branding */}
        <div className="flex-1 bg-gradient-to-br from-dahiPrimary to-dahiSecondary p-8 sm:p-10">
          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em]">
            DAHI Admin
          </span>
          <h1 className="mt-6 text-3xl font-black sm:text-4xl">Secure admin access</h1>
          <p className="mt-4 max-w-md text-lg text-white/85">
            Manage programs, resources, events, team members, and community updates 
            from one professional dashboard.
          </p>
          <div className="mt-8 rounded-[1.25rem] border border-white/15 bg-white/15 p-4 text-sm text-white/90">
            <p className="font-semibold">Production Authentication</p>
            <p className="mt-2 text-white/75">
              Admin login is secured by Supabase Authentication. Use your 
              organization credentials to sign in.
            </p>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="flex-1 bg-slate-50 p-8 text-slate-700 sm:p-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Admin login</h2>
              <p className="mt-2 text-sm text-slate-500">
                Sign in with your Supabase credentials to continue.
              </p>
            </div>
          </div>

          {/* Success Alert */}
          {success && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Login successful! Redirecting...</p>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && !success && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">{error}</p>
                {error.includes('Invalid login credentials') && (
                  <p className="mt-1 text-xs text-red-700">
                    Please check your email and password, or contact your administrator if you don't have an account.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit} disabled={loading || success}>
            <label className="block text-sm font-medium">
              <span className="mb-2 block text-slate-900">Email</span>
              <input
                type="email"
                placeholder="your@organization.email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary focus:ring-2 focus:ring-dahiPrimary/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={loading || success}
              />
            </label>

            <label className="block text-sm font-medium">
              <span className="mb-2 block text-slate-900">Password</span>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary focus:ring-2 focus:ring-dahiPrimary/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={loading || success}
              />
            </label>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full rounded-lg bg-dahiPrimary px-6 py-3 font-semibold text-white transition hover:bg-dahiSecondary disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Success!
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 border-t border-slate-200 pt-4">
            <p className="text-center text-xs text-slate-500">
              Need help? Contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
