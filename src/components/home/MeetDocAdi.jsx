import SupabaseContent from '../common/SupabaseContent';

function MeetDocAdi() {
  return (
    <section id="doctor" className="section-shell max-w-7xl">
      <SupabaseContent
        table="team_members"
        emptyMessage="Team profile information will appear here once content is published."
        render={(members) => {
          const founder = members.find((member) => member.role?.toLowerCase().includes('founder') || member.position?.toLowerCase().includes('founder')) || members[0];
          if (!founder) return null;
          return (
            <div className="soft-card overflow-hidden p-8 sm:p-10">
              <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                <div className="flex justify-center lg:justify-start">
                  <img
                    src={founder.profile_image || founder.photo_url || '/docadi-320.webp'}
                    alt={founder.full_name || founder.name}
                    width="320"
                    height="320"
                    loading="lazy"
                    className="h-40 w-40 rounded-full object-cover shadow-lg"
                  />
                </div>
                <div>
                  <span className="eyebrow">Meet Doc Adi</span>
                  <h2 className="mt-4 text-3xl font-black text-slate-900">{founder.full_name || founder.name}</h2>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">{founder.position || founder.role}</p>
                  {/* Render bio from any available field and preserve paragraph breaks */}
                  {(() => {
                    const rawBio = founder.bio || founder.description || founder.about || '';
                    if (!rawBio) {
                      return (
                        <p className="mt-4 text-lg leading-8 text-slate-600">Doc Adi is a trusted health educator and community leader focused on empowering women through evidence-based education.</p>
                      );
                    }

                    return rawBio.split('\n\n').map((para, i) => (
                      <p key={i} className={i === 0 ? 'mt-4 text-lg leading-8 text-slate-600' : 'mt-3 text-lg leading-8 text-slate-600'}>{para}</p>
                    ));
                  })()}
                </div>
              </div>
            </div>
          );
        }}
      />
    </section>
  );
}

export default MeetDocAdi;
