function ImpactCounter({ value, label }) {
  return (
    <div className="rounded-[1.3rem] border border-slate-200 bg-white p-6 text-center shadow-sm">
      <div className="text-3xl font-black text-dahiPrimary sm:text-4xl">{value}</div>
      <div className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">{label}</div>
    </div>
  );
}

export default ImpactCounter;
