function MissionVisionCard({ icon, title, description, accent }) {
  return (
    <div className="soft-card p-7 transition hover:-translate-y-1 hover:shadow-xl">
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>
        <i className={icon}></i>
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-slate-600">{description}</p>
    </div>
  );
}

export default MissionVisionCard;
