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
              <div className="space-y-6">
                <div>
                  <span className="eyebrow">Meet Doc Adi</span>
                  <h2 className="mt-4 text-3xl font-black text-slate-900">{founder.name}</h2>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">{founder.position || founder.role}</p>
                </div>

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
          );
        }}
      />
    </section>
  );
}

export default MeetDocAdi;
