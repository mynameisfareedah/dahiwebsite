import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

function OutreachInterestModal({ isOpen, onClose, mode = 'register' }) {
  const [formData, setFormData] = useState({ name: '', email: '', note: '' });
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
      window.addEventListener('keydown', onKey);

      return () => {
        window.removeEventListener('keydown', onKey);
        document.body.style.overflow = prevOverflow;
      };
    }

    if (!isOpen && mounted) {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(t);
    }
  }, [isOpen, onClose, mounted]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const title = mode === 'sponsor' ? 'Sponsor this outreach' : 'Reserve your place';
  const description = mode === 'sponsor'
    ? 'Tell us about your interest in becoming a sponsor and our team will follow up with the right next steps.'
    : 'Share your details and we will contact you with registration guidance and event updates.';

  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-6 ${visible ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-slate-950/70 transition-opacity ${visible ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="outreach-interest-title" ref={panelRef} className={`relative w-full max-w-2xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 transform transition-all duration-200 ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95'} max-h-[80vh] overflow-auto`}>
        <button
          type="button"
          aria-label="Close dialog"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-dahiPrimary">August Outreach</p>
          <h3 id="outreach-interest-title" className="mt-2 text-2xl font-bold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>

        {submitted ? (
          <div className="space-y-4 rounded-[1.25rem] border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700">
            <p className="font-semibold">Thanks for your interest.</p>
            <p>We have received your request and will be in touch shortly with the next steps.</p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={onClose} className="rounded-full bg-dahiPrimary px-4 py-2 text-sm font-semibold text-white">Close</button>
              <Link to="/contact?reason=Partnership" onClick={onClose} className="rounded-full border border-dahiPrimary px-4 py-2 text-sm font-semibold text-dahiPrimary">Contact the team</Link>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-2 block">Full Name</span>
              <input name="name" value={formData.name} onChange={handleChange} required className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-2 block">Email Address</span>
              <input name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-2 block">How can we help?</span>
              <textarea name="note" rows="4" value={formData.note} onChange={handleChange} className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary" placeholder={mode === 'sponsor' ? 'Tell us about your sponsorship interest.' : 'Share any questions or requirements for attending.'} />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={onClose} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-dahiPrimary hover:text-dahiPrimary">Cancel</button>
              <button type="submit" className="rounded-full bg-dahiPrimary px-5 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary">Submit Request</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default OutreachInterestModal;
