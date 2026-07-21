import { useState } from 'react';
import SectionHeading from '../common/SectionHeading';
import VolunteerModal from './VolunteerModal';
import OutreachInterestModal from './OutreachInterestModal';

function RegistrationSection({ registrationStatus }) {
  const [modalState, setModalState] = useState({ type: null, mode: 'register' });
  const isOpen = registrationStatus === 'open';
  const isClosed = registrationStatus === 'closed';

  const openModal = (type, mode = 'register') => setModalState({ type, mode });
  const closeModal = () => setModalState({ type: null, mode: 'register' });

  return (
    <section className="section-shell max-w-7xl space-y-8">
      <SectionHeading
        eyebrow="Get Involved"
        title="Registration & Opportunities"
        description="Join us, volunteer, or sponsor this important community health initiative."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Register Card */}
        <article className="soft-card space-y-4 p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dahiPrimary/10">
            <i className="fa-solid fa-pen-to-square text-lg text-dahiPrimary"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Register to Attend</h3>
            <p className="mt-2 text-sm text-slate-600">Secure your spot at the August Community Health Outreach.</p>
          </div>
          <button
            type="button"
            disabled={!isOpen}
            onClick={() => openModal('register')}
            className={`mt-4 w-full rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              isOpen
                ? 'bg-dahiPrimary text-white hover:bg-dahiSecondary'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isOpen ? 'Register Now' : 'Registration Coming Soon'}
          </button>
        </article>

        {/* Volunteer Card */}
        <article className="soft-card space-y-4 p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dahiSecondary/10">
            <i className="fa-solid fa-hands-helping text-lg text-dahiSecondary"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Volunteer</h3>
            <p className="mt-2 text-sm text-slate-600">Contribute your time and skills to make this outreach impactful.</p>
          </div>
          <button
            type="button"
            onClick={() => openModal('volunteer')}
            className="mt-4 inline-flex items-center justify-center rounded-full border border-dahiSecondary px-4 py-2.5 text-sm font-semibold text-dahiSecondary transition hover:bg-dahiSecondary/5 w-full text-center"
          >
            Express Interest
          </button>
        </article>

        {/* Sponsor Card */}
        <article className="soft-card space-y-4 p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dahiAccent/20">
            <i className="fa-solid fa-heart text-lg text-dahiAccent"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Become a Sponsor</h3>
            <p className="mt-2 text-sm text-slate-600">Partner with DAHI to reach more women with vital health education.</p>
          </div>
          <button
            type="button"
            onClick={() => openModal('sponsor', 'sponsor')}
            className="mt-4 inline-flex items-center justify-center rounded-full border border-dahiAccent px-4 py-2.5 text-sm font-semibold text-dahiAccent transition hover:bg-dahiAccent/10 w-full text-center"
          >
            Learn More
          </button>
        </article>
      </div>

      {isClosed && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-600">Registration for this event has closed. Thank you for your interest!</p>
        </div>
      )}

      <VolunteerModal isOpen={modalState.type === 'volunteer'} onClose={closeModal} />
      <OutreachInterestModal isOpen={modalState.type === 'register' || modalState.type === 'sponsor'} onClose={closeModal} mode={modalState.mode} />
    </section>
  );
}

export default RegistrationSection;
