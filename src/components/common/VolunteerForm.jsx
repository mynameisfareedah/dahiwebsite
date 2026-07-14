import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { volunteerSchema } from '../../utils/forms';

function VolunteerForm() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', skills: '', area_of_interest: '', availability: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('');

    const validationErrors = {};
    if (!volunteerSchema.name(formData.name)) validationErrors.name = volunteerSchema.name(formData.name);
    if (!volunteerSchema.email(formData.email)) validationErrors.email = volunteerSchema.email(formData.email);
    if (!volunteerSchema.phone(formData.phone)) validationErrors.phone = volunteerSchema.phone(formData.phone);
    if (!volunteerSchema.message(formData.message)) validationErrors.message = volunteerSchema.message(formData.message);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from('volunteer_applications').insert({
      ...formData,
      status: 'Submitted',
    });

    if (error) {
      setStatus('We could not save your volunteer application right now. Please try again later.');
    } else {
      setStatus('Thank you! Your volunteer application has been received.');
      setFormData({ name: '', email: '', phone: '', skills: '', area_of_interest: '', availability: '', message: '' });
    }

    setIsSubmitting(false);
  };

  return (
    <form className="space-y-4" aria-label="Volunteer form" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          <span className="mb-2 block">Name</span>
          <input name="name" value={formData.name} onChange={handleChange} type="text" className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary" required />
          {errors.name && <span className="mt-2 block text-sm text-rose-600">{errors.name}</span>}
        </label>
        <label className="block text-sm font-medium text-slate-700">
          <span className="mb-2 block">Email</span>
          <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary" required />
          {errors.email && <span className="mt-2 block text-sm text-rose-600">{errors.email}</span>}
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          <span className="mb-2 block">Phone</span>
          <input name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary" />
          {errors.phone && <span className="mt-2 block text-sm text-rose-600">{errors.phone}</span>}
        </label>
        <label className="block text-sm font-medium text-slate-700">
          <span className="mb-2 block">Skills</span>
          <input name="skills" value={formData.skills} onChange={handleChange} type="text" className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          <span className="mb-2 block">Area of Interest</span>
          <input name="area_of_interest" value={formData.area_of_interest} onChange={handleChange} type="text" className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          <span className="mb-2 block">Availability</span>
          <input name="availability" value={formData.availability} onChange={handleChange} type="text" className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary" />
        </label>
      </div>
      <label className="block text-sm font-medium text-slate-700">
        <span className="mb-2 block">Message</span>
        <textarea name="message" value={formData.message} onChange={handleChange} rows="5" className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary"></textarea>
        {errors.message && <span className="mt-2 block text-sm text-rose-600">{errors.message}</span>}
      </label>
      <button type="submit" disabled={isSubmitting} className="rounded-full bg-dahiPrimary px-6 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary disabled:cursor-not-allowed disabled:opacity-70">{isSubmitting ? 'Submitting...' : 'Apply to Volunteer'}</button>
      {status && <p className={`text-sm ${status.includes('Thank you') ? 'text-emerald-600' : 'text-rose-600'}`}>{status}</p>}
    </form>
  );
}

export default VolunteerForm;
