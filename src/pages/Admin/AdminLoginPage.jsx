import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'react-hot-toast';

function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, resetPassword } = useAdminAuth();
  const [form, setForm] = useState({ email: 'admin@dahi.org', password: 'Dahi2024!' });
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (mode === 'reset') {
        await resetPassword(form.email);
        toast.success('Password reset request prepared.');
      } else {
        await signIn(form.email, form.password);
        toast.success('Signed in successfully.');
        const from = location.state?.from?.pathname || '/admin';
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast.error(error.message || 'Unable to complete request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl backdrop-blur lg:flex-row">
        <div className="flex-1 bg-gradient-to-br from-dahiPrimary to-dahiSecondary p-8 sm:p-10">
          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em]">DAHI Admin</span>
          <h1 className="mt-6 text-3xl font-black sm:text-4xl">Secure admin access</h1>
          <p className="mt-4 max-w-md text-lg text-white/85">Manage programs, resources, events, team members, and community updates from one professional dashboard.</p>
          <div className="mt-8 rounded-[1.25rem] border border-white/15 bg-white/15 p-4 text-sm text-white/90">
            Demo access: <strong>admin@dahi.org</strong> / <strong>Dahi2024!</strong>
          </div>
        </div>
        <div className="flex-1 bg-slate-50 p-8 text-slate-700 sm:p-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{mode === 'reset' ? 'Reset password' : 'Admin login'}</h2>
              <p className="mt-2 text-sm text-slate-500">{mode === 'reset' ? 'Enter your email to receive a reset link.' : 'Sign in to continue to the dashboard.'}</p>
            </div>
            <Link to="/" className="text-sm font-semibold text-dahiPrimary">Back to site</Link>
          </div>
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium">
              <span className="mb-2 block">Email</span>
              <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary" required />
            </label>
            {mode === 'login' && (
              <label className="block text-sm font-medium">
                <span className="mb-2 block">Password</span>
                <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary" required />
              </label>
            )}
            <button type="submit" className="w-full rounded-full bg-dahiPrimary px-6 py-3 font-semibold text-white transition hover:bg-dahiSecondary disabled:opacity-70" disabled={loading}>{loading ? 'Working...' : mode === 'reset' ? 'Send reset link' : 'Sign in'}</button>
          </form>
          <div className="mt-4 text-sm text-slate-500">
            {mode === 'login' ? (
              <button className="font-semibold text-dahiPrimary" onClick={() => setMode('reset')} type="button">Forgot password?</button>
            ) : (
              <button className="font-semibold text-dahiPrimary" onClick={() => setMode('login')} type="button">Back to login</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
