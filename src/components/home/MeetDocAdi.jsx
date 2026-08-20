import { Link } from 'react-router-dom';
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
            <div className="grid items-center gap-8 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[0.7fr_1.3fr]">
              <img src={founder.photo_url || '/docadi-320.webp'} alt={founder.name || 'Doc Adi'} width="320" height="320" loading="lazy" className="mx-auto aspect-square w-full max-w-xs rounded-[1.25rem] object-cover" />
              <div className="space-y-5">
                <div>
                  <span className="eyebrow">Meet Doc Adi</span>
                  <h2 className="mt-4 section-title">{founder.name}</h2>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">Founder &amp; Medical Lead</p>
                </div>

                {(() => {
                  const rawBio = founder.bio || founder.description || founder.about || '';
                  if (!rawBio) {
                    return (
                      <p className="text-lg leading-8 text-slate-600">Doc Adi is a trusted health educator and community leader focused on empowering women through evidence-based education.</p>
                    );
                  }

                  return <p className="text-lg leading-8 text-slate-600">{rawBio.split('\n\n').slice(0, 2).join(' ')}</p>;
                })()}
                <Link to="/about" className="inline-flex items-center justify-center rounded-full border border-dahiPrimary px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:bg-dahiPrimary/5">Meet Doc Adi</Link>
              </div>
            </div>
          );
        }}
      />
    </section>
  );
}

export default MeetDocAdi;
