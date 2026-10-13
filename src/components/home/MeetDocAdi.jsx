import { Link } from 'react-router-dom';
import { useSupabaseData } from '../../hooks/useSupabaseData';

function MeetDocAdi() {
  const { data = [] } = useSupabaseData('team_members', '*', {
    staleTime: 60000,
    retry: false,
  });
  const founder = data.find((member) => member.role?.toLowerCase().includes('founder') || member.position?.toLowerCase().includes('founder'))
    || data.find((member) => member.full_name?.toLowerCase().includes('adiyat') || member.name?.toLowerCase().includes('adiyat'));

  return (
    <section id="doctor" className="section-shell max-w-7xl">
      <div className="grid items-center gap-8 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[0.7fr_1.3fr]">
        <img
          src={founder?.profile_image || founder?.photo_url || '/docadi-320.webp'}
          alt="Dr Adiyat Olamide Dele-Salawu (Doc Adi)"
          width="320"
          height="320"
          loading="lazy"
          className="mx-auto aspect-square w-full max-w-xs rounded-[1.25rem] object-cover"
        />
        <div className="space-y-5">
          <div>
            <span className="eyebrow">Meet the Founder</span>
            <h2 className="mt-4 section-title">Dr Adiyat Olamide Dele-Salawu (Doc Adi)</h2>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">Founder &amp; Medical Lead</p>
          </div>
          <div className="space-y-4 text-lg leading-8 text-slate-600">
            <p>Growing up surrounded by women, Dr Adiyat noticed that important conversations about menstruation, reproductive health and women&apos;s wellbeing were often met with silence. Those early experiences sparked a conviction that every woman deserves access to trustworthy health information without shame or fear.</p>
            <p>Her journey through medical school and 21 years of medical practice strengthened that commitment.</p>
            <p>Today, as the founder of Doc Adi Health Initiative, she brings together evidence-based medicine, compassion, faith-conscious education and lived experience to empower Muslim women and girls to make informed decisions about their health.</p>
          </div>
          <Link
            to="/team#founder"
            className="inline-flex items-center justify-center rounded-full border border-dahiPrimary px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:bg-dahiPrimary/5"
          >
            Read Her Story
          </Link>
        </div>
      </div>
    </section>
  );
}

export default MeetDocAdi;
