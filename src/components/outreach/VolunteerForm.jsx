import { useState, useRef, useEffect } from 'react';

const skillOptions = [
  'Healthcare Professional',
  'Health Education Support',
  'Event Coordination',
  'Registration Support',
  'Photography/Videography',
  'Graphic Design',
  'Social Media Support',
  'Logistics Support',
  'General Volunteer',
];

function VolunteerForm({ onSuccess, onCancel, autoFocus = false }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skills: [],
    availability: 'Flexible',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleSkillToggle = (skill) => {
    setFormData((current) => ({
      ...current,
      skills: current.skills.includes(skill)
        ? current.skills.filter((item) => item !== skill)
        : [...current.skills, skill],
    }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'Please enter your full name.';
    if (!formData.email.trim()) nextErrors.email = 'Please enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = 'Please enter a valid email address.';
    if (!formData.message.trim()) nextErrors.message = 'Please share a short note about your interest.';
    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      onSuccess?.();
    }, 800);
  };

  // autofocus the first input when requested
  const nameRef = useRef(null);
  useEffect(() => {
    if (autoFocus && nameRef.current) {
      try { nameRef.current.focus(); } catch (e) {}
    }
  }, [autoFocus]);

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          <span className="mb-2 block">Full Name</span>
          <input
            ref={nameRef}
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary"
          />
          {errors.name && <span className="mt-2 block text-sm text-rose-600">{errors.name}</span>}
        </label>
        <label className="block text-sm font-medium text-slate-700">
          <span className="mb-2 block">Email Address</span>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary"
          />
          {errors.email && <span className="mt-2 block text-sm text-rose-600">{errors.email}</span>}
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        <span className="mb-2 block">Phone Number</span>
        <input
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary"
          placeholder="Optional"
        />
      </label>

      <div>
        <p className="mb-3 text-sm font-medium text-slate-700">Skills / Interest Area</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {skillOptions.map((skill) => {
            const checked = formData.skills.includes(skill);
            return (
              <label key={skill} className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <input type="checkbox" checked={checked} onChange={() => handleSkillToggle(skill)} />
                <span>{skill}</span>
              </label>
            );
          })}
        </div>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        <span className="mb-2 block">Availability</span>
        <select
          name="availability"
          value={formData.availability}
          onChange={handleChange}
          className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary"
        >
          <option value="Weekdays">Weekdays</option>
          <option value="Weekends">Weekends</option>
          <option value="Flexible">Flexible</option>
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        <span className="mb-2 block">Why would you like to volunteer with DAHI?</span>
        <textarea
          name="message"
          rows="4"
          value={formData.message}
          onChange={handleChange}
          className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary"
        />
        {errors.message && <span className="mt-2 block text-sm text-rose-600">{errors.message}</span>}
      </label>

      {submitted ? (
        <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          Thank you for your interest in volunteering with DAHI. Our team will contact you regarding available opportunities.
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-dahiPrimary hover:text-dahiPrimary">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="rounded-full bg-dahiPrimary px-5 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting ? 'Submitting...' : 'Submit Volunteer Interest'}
        </button>
      </div>
    </form>
  );
}

export default VolunteerForm;
