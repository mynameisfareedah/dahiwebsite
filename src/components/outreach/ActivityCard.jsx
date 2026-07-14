function ActivityCard({ title, description, icon }) {
  return (
    <article className="soft-card space-y-3 p-6 sm:p-8">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dahiSecondary/10">
        <i className={`${icon} text-base text-dahiSecondary`}></i>
      </div>
      <div>
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
    </article>
  );
}

export default ActivityCard;
