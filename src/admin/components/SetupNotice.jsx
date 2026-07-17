import { AlertCircle, ExternalLink } from 'lucide-react';

/**
 * SetupNotice Component
 * Displays when Supabase is not configured, preventing admin login
 * until the environment variables are set up.
 */
function SetupNotice() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 px-4 py-16 text-slate-100">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-center">
          <span className="inline-flex rounded-full bg-dahiPrimary/15 px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-dahiPrimary">
            DAHI Admin
          </span>
        </div>

        {/* Alert Card */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-8 backdrop-blur">
          {/* Alert Icon & Title */}
          <div className="mb-6 flex items-start gap-4">
            <div className="rounded-lg bg-amber-500/20 p-3">
              <AlertCircle className="h-6 w-6 text-amber-400" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-amber-300">
                Admin System Not Configured
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                The admin authentication system requires Supabase to be configured. 
                Please complete the setup steps below.
              </p>
            </div>
          </div>

          {/* Configuration Status */}
          <div className="mb-8 space-y-3 rounded-lg bg-slate-950/50 p-5">
            <p className="text-sm font-semibold text-slate-300">Required Environment Variables</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <code className="font-mono text-slate-400">VITE_SUPABASE_URL</code>
                <span className="ml-auto text-red-400">Missing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <code className="font-mono text-slate-400">VITE_SUPABASE_ANON_KEY</code>
                <span className="ml-auto text-red-400">Missing</span>
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="mb-8 space-y-4">
            <p className="text-sm font-semibold text-slate-300">Setup Instructions</p>
            <ol className="space-y-3 text-sm text-slate-400">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-dahiPrimary/30 text-dahiPrimary font-semibold text-xs">
                  1
                </span>
                <span>
                  Create a Supabase account at{' '}
                  <a
                    href="https://app.supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-dahiPrimary hover:text-dahiSecondary transition"
                  >
                    app.supabase.com
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-dahiPrimary/30 text-dahiPrimary font-semibold text-xs">
                  2
                </span>
                <span>Create a new Supabase project (free tier available)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-dahiPrimary/30 text-dahiPrimary font-semibold text-xs">
                  3
                </span>
                <span>Get your credentials from Settings &gt; API</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-dahiPrimary/30 text-dahiPrimary font-semibold text-xs">
                  4
                </span>
                <span>
                  Create or edit <code className="font-mono text-slate-300">.env.local</code> in your project root with:
                </span>
              </li>
            </ol>

            {/* Env Template */}
            <div className="rounded-lg bg-slate-950/70 p-4 font-mono text-xs">
              <div className="text-slate-500">VITE_SUPABASE_URL=your_url_here</div>
              <div className="text-slate-500">VITE_SUPABASE_ANON_KEY=your_key_here</div>
              <p className="mt-4 text-slate-600 text-xs">
                ⚠️ Do not commit .env.local to version control
              </p>
            </div>

            <ol className="space-y-3 text-sm text-slate-400" start="5">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-dahiPrimary/30 text-dahiPrimary font-semibold text-xs">
                  5
                </span>
                <span>Save the file and restart the development server</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-dahiPrimary/30 text-dahiPrimary font-semibold text-xs">
                  6
                </span>
                <span>
                  Run the SQL migration from{' '}
                  <code className="font-mono text-slate-300">supabase/migrations/001_create_events_table.sql</code> in your Supabase SQL Editor
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-dahiPrimary/30 text-dahiPrimary font-semibold text-xs">
                  7
                </span>
                <span>Create admin users in Supabase Auth dashboard</span>
              </li>
            </ol>
          </div>

          {/* Additional Resources */}
          <div className="mb-6 space-y-3 border-t border-slate-700 pt-6">
            <p className="text-sm font-semibold text-slate-300">Documentation</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a
                  href="../../../SUPABASE_SETUP.md"
                  className="inline-flex items-center gap-1 font-medium text-dahiPrimary hover:text-dahiSecondary transition"
                >
                  SUPABASE_SETUP.md
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="w-full rounded-lg bg-dahiPrimary px-6 py-3 font-semibold text-white transition hover:bg-dahiSecondary"
          >
            Refresh Configuration
          </button>

          {/* Footer Text */}
          <p className="mt-4 text-center text-xs text-slate-500">
            After restarting your development server, click "Refresh Configuration" above.
          </p>
        </div>

        {/* Public Site Link */}
        <div className="mt-8 flex justify-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-300 transition"
          >
            ← Back to public website
          </a>
        </div>
      </div>
    </div>
  );
}

export default SetupNotice;
