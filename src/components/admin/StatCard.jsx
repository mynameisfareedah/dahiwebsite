function StatCard({ label, value, hint, accent = 'bg-dahiPrimary/10 text-dahiPrimary' }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${accent}`}>{label}</div>
      <div className="mt-4 text-3xl font-black text-slate-900">{value}</div>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </div>
  );
}

export default StatCard;
