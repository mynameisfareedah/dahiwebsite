function ApproachCard({ icon, title, description }) {
  return (
    <div className="soft-card p-7 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-dahiAccent/20 text-xl text-dahiAccent">
        <i className={icon}></i>
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-slate-600">{description}</p>
    </div>
  );
}

export default ApproachCard;
