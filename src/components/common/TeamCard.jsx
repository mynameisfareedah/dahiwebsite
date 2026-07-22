function TeamCard({ name, role, description, initials, profileImage }) {
  return (
    <div className="soft-card p-7">
      {profileImage ? <img src={profileImage} alt="" className="h-14 w-14 rounded-2xl object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-dahiPrimary/10 text-2xl font-black text-dahiPrimary">{initials}</div>}
      <h3 className="mt-5 text-xl font-semibold text-slate-900">{name}</h3>
      <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">{role}</p>
      {description && <p className="mt-3 text-slate-600">{description}</p>}
    </div>
  );
}

export default TeamCard;
