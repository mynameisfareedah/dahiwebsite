import VolunteerForm from './VolunteerForm';

function VolunteerModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
      <div className="absolute inset-0" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="volunteer-modal-title" className="relative w-full max-w-3xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-dahiPrimary">Volunteer Interest</p>
          <h3 id="volunteer-modal-title" className="mt-2 text-2xl font-bold text-slate-900">Share your interest with DAHI</h3>
          <p className="mt-2 text-sm text-slate-600">We would love to hear from you about how you would like to support this outreach.</p>
        </div>
        <VolunteerForm onSuccess={onClose} onCancel={onClose} />
      </div>
    </div>
  );
}

export default VolunteerModal;
