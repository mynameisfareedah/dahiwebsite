import { PageHeader } from '../components';

export default function AdminProfile() {
  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="View and update your admin profile information." />
      <div className="rounded-3xl border border-gray-800 bg-slate-950 p-6 text-slate-200">
        <h2 className="text-xl font-semibold text-white">Coming Soon</h2>
        <p className="mt-2 text-sm text-gray-400">
          Profile management features will be available here soon.
        </p>
      </div>
    </div>
  );
}
