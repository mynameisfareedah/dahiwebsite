import { useState } from 'react';
import { Link } from 'react-router-dom';

function OutreachInterestModal({ isOpen, onClose, mode = 'register' }) {
  const [formData, setFormData] = useState({ name: '', email: '', note: '' });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
      <div className="absolute inset-0" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="outreach-interest-title" className="relative w-full max-w-2xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
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
