function SpeakerCard({ initials, name, position, organisation, bio }) {
  return (
    <article className="soft-card space-y-4 p-6 sm:p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-dahiPrimary to-dahiSecondary">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{initials}</div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900">{name}</h3>
        <p className="mt-1 text-sm font-semibold text-dahiPrimary">{position}</p>
        <p className="text-xs text-slate-600">{organisation}</p>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed">{bio}</p>
    </article>
  );
}

export default SpeakerCard;
