import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import founderBiography from '../../data/founderBiography';

const FOUNDER_TEAM_MEMBER_ID = '581c3ac4-2631-4497-b348-cb12e51d38b8';

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
  const teamMembers = members.filter((member) => member.id !== FOUNDER_TEAM_MEMBER_ID);
  const founder = members.find((member) => member.id === FOUNDER_TEAM_MEMBER_ID);
  const founderImage = founder?.profile_image || founder?.photo_url || '/docadi-320.webp';

  return (
    <>
      <SEO
        title="Our Story & Team | Doc Adi Health Initiative"
        description="Meet DAHI founder Dr Adiyat Olamide Dele-Salawu, read her story, and meet the team supporting women's health education and community outreach."
        path="/team"
      />

      <section className="section-shell max-w-7xl space-y-10 py-16">
        <div className="max-w-3xl">
          <span className="eyebrow">OUR STORY &amp; TEAM</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Our Story &amp; Team</h1>
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

        <section
          id="founder"
          tabIndex={-1}
          aria-labelledby="founder-heading"
          className="scroll-mt-24 overflow-hidden rounded-[2rem] border border-dahiPrimary/15 bg-white shadow-xl"
        >
          <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
            <div className="bg-gradient-to-br from-dahiPrimary/10 via-white to-dahiSecondary/10 p-6 sm:p-10">
              <img
                src={founderImage}
                alt="Dr Adiyat Olamide Dele-Salawu (Doc Adi)"
                width="640"
                height="640"
                className="mx-auto aspect-square w-full max-w-md rounded-[1.5rem] object-cover shadow-lg"
              />
              <div className="mt-6 text-center">
                <h2 className="text-2xl font-bold text-slate-900">{founderBiography.name}</h2>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-dahiSecondary">Founder &amp; Medical Lead</p>
              </div>
            </div>
            <div className="p-6 sm:p-10">
              <span className="eyebrow">Founder &amp; Medical Lead</span>
              <h2 id="founder-heading" className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Meet the Founder</h2>
              <p className="mt-4 text-base leading-8 text-slate-600">{founderBiography.introduction}</p>
              <div className="mt-8 space-y-8">
                {founderBiography.sections.map((section) => (
                  <section key={section.heading} aria-labelledby={`founder-${section.heading.replaceAll(' ', '-')}`}>
                    <h3
                      id={`founder-${section.heading.replaceAll(' ', '-')}`}
                      className="text-xl font-bold text-slate-900"
                    >
                      {section.heading}
                    </h3>
                    <div className="mt-3 space-y-4 text-base leading-8 text-slate-600">
                      {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="team-heading" className="space-y-8">
          <div className="max-w-3xl">
            <span className="eyebrow">Our People</span>
            <h2 id="team-heading" className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">The Team Behind DAHI</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Meet the people working together to support women’s health education, community outreach, and practical resources.
            </p>
          </div>

        {isLoading ? (
          <div className="soft-card p-10 text-slate-600">Loading team members...</div>
        ) : error ? (
          <div className="soft-card border border-rose-200 bg-rose-50 p-10 text-rose-600">Unable to load team members right now.</div>
        ) : teamMembers.length === 0 ? (
          <div className="soft-card p-10 text-slate-600">Team profiles will appear here once content is published.</div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
            {teamMembers.map((member) => {
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

        <section aria-labelledby="shared-commitment-heading" className="soft-card p-8 sm:p-10">
          <span className="eyebrow">Working together</span>
          <h2 id="shared-commitment-heading" className="mt-4 text-3xl font-black tracking-tight text-slate-900">Our Shared Commitment</h2>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-600">
            Working together, the DAHI team supports accessible, evidence-based and faith-conscious health education to help Muslim women and girls make informed decisions about their health and contribute to healthier families and communities.
          </p>
        </section>
      </section>
    </>
  );
}

export default TeamPage;
