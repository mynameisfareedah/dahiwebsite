function FeatureCard({ icon, title, description, items = [] }) {
  return (
    <div className="soft-card p-7">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-dahiPrimary/10 text-xl text-dahiPrimary">
        <i className={icon}></i>
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-slate-600">{description}</p>
      {items.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2"><span className="mt-1 text-dahiPrimary">•</span><span>{item}</span></li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FeatureCard;
