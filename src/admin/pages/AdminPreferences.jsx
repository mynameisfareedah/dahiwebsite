import { PageHeader } from '../components';

export default function AdminPreferences() {
  return (
    <div className="space-y-6">
      <PageHeader title="Preferences" subtitle="Manage your admin preferences and interface settings." />
      <div className="rounded-3xl border border-gray-800 bg-slate-950 p-6 text-slate-200">
        <h2 className="text-xl font-semibold text-white">Coming Soon</h2>
        <p className="mt-2 text-sm text-gray-400">
          Preferences configuration will be available here soon.
        </p>
      </div>
    </div>
  );
}
