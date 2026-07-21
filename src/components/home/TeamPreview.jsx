import { Link } from 'react-router-dom';
import { useSupabaseData } from '../../hooks/useSupabaseData';

function TeamPreview() {
  const { data = [], isLoading, error } = useSupabaseData('team_members', '*', {
    staleTime: 60000,
    retry: false,
  });

  const visibleMembers = (data || []).filter((member) => member.active !== false).slice(0, 3);

  return (
    <section className="section-shell max-w-7xl">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <span className="eyebrow">Meet the Team</span>
          <h2 className="mt-4 section-title">A small glimpse of the people behind DAHI</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">Our team is committed to women’s health education, community engagement, and trusted guidance.</p>
        </div>
        <Link to="/about" className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-dahiPrimary hover:text-dahiPrimary">Meet the Full Team</Link>
      </div>

      {isLoading ? (
        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">Loading team members...</div>
      ) : error ? (
        <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 p-8 text-center text-rose-600">Unable to load team members right now.</div>
      ) : visibleMembers.length === 0 ? (
        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">Team profiles will appear here once content is published.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleMembers.map((member) => (
            <article key={member.id || member.name} className="team-card soft-card p-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-dahiPrimary/10 text-2xl font-black text-dahiPrimary">
                {(member.name || 'DA').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">{member.name}</h3>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">{member.role}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default TeamPreview;
