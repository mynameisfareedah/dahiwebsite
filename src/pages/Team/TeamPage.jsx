import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import SectionHeading from '../../components/common/SectionHeading';
import { useSupabaseData } from '../../hooks/useSupabaseData';

function TeamPage() {
  const { data = [], isLoading, error } = useSupabaseData('team_members', '*', {
    staleTime: 60000,
    retry: false,
  });

  const members = [...(data || [])].sort((a, b) => {
    const orderA = typeof a.display_order === 'number' ? a.display_order : Number.MAX_SAFE_INTEGER;
    const orderB = typeof b.display_order === 'number' ? b.display_order : Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return new Date(a.created_at || 0) - new Date(b.created_at || 0);
  });

  return (
    <>
      <SEO
        title="Meet the Team"
        description="Meet the DAHI team dedicated to empowering women through trusted health education and community support."
        path="/team"
      />

      <section className="section-shell max-w-7xl space-y-10 py-16">
        <div className="max-w-3xl">
          <span className="eyebrow">Meet the Team</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">The people guiding DAHI’s mission</h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Our team brings together expertise in women’s health education, community outreach, and digital learning to create trusted resources and supportive experiences for every woman.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              to="/resources"
              className="inline-flex items-center justify-center rounded-full bg-dahiPrimary px-6 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary"
            >
              Explore DAHI Resources
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-dahiPrimary hover:text-dahiPrimary"
            >
              Contact the Team
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="soft-card p-10 text-slate-600">Loading team members...</div>
        ) : error ? (
          <div className="soft-card border border-rose-200 bg-rose-50 p-10 text-rose-600">Unable to load team members right now.</div>
        ) : members.length === 0 ? (
          <div className="soft-card p-10 text-slate-600">Team profiles will appear here once content is published.</div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
            {members.map((member) => {
              const fullName = member.full_name || member.name || 'Team Member';
              const firstName = fullName.split(' ')[0] || fullName;
              const initials = firstName.charAt(0).toUpperCase();
              const bio = member.bio || member.description || 'Member of the DAHI team committed to supporting women’s health education.';

              return (
                <article key={member.id || fullName} className="soft-card group overflow-hidden rounded-[1.75rem] border border-slate-200 p-6 transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex items-center gap-4">
                    {member.profile_image ? (
                      <img
                        src={member.profile_image}
                        alt={`Profile photo of ${fullName}`}
                        className="h-16 w-16 rounded-full object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-dahiPrimary/10 text-2xl font-black text-dahiPrimary">
                        {initials}
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{fullName}</h2>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">{member.role || 'Team Member'}</p>
                    </div>
                  </div>
                  <p
                    className="mt-5 text-sm leading-6 text-slate-600"
                    style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {bio}
                  </p>
                  {member.linkedin_url ? (
                    <a
                      href={member.linkedin_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-dahiPrimary transition hover:text-dahiSecondary"
                    >
                      <i className="fa-brands fa-linkedin"></i>
                      View LinkedIn
                    </a>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

export default TeamPage;
