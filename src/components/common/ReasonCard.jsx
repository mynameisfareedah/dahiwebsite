function ReasonCard({ title, description, icon: Icon }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-dahiPrimary">
        <Icon size={20} />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-slate-600">{description}</p>
    </div>
  );
}

export default ReasonCard;
