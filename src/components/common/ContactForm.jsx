import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, ClipboardCopy, LoaderCircle } from 'lucide-react';
import { contactSchema } from '../../utils/forms';
import { messageService } from '../../services/messageService';

const reasons = [
  'General Enquiry',
  'Programme Information',
  'Educational Resources',
  'Volunteer',
  'Partnership',
  'Media Enquiry',
  'Speaking Invitation',
  'Technical Support',
  'Other',
];

function ContactForm({ initialReason = 'General Enquiry' }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    reason: initialReason,
    message: '',
    attachment: null,
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormData((current) => ({ ...current, reason: initialReason }));
  }, [initialReason]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setFormData((current) => ({ ...current, attachment: file }));
  };

  const resetForm = ({ preserveStatus = false } = {}) => {
    setFormData({ name: '', email: '', phone: '', subject: '', reason: 'General Enquiry', message: '', attachment: null });
    setErrors({});
    if (!preserveStatus) {
      setStatus('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setStatus('');

    const validationErrors = {};
    const nameValidation = contactSchema.name(formData.name);
    const emailValidation = contactSchema.email(formData.email);
    const messageValidation = contactSchema.message(formData.message);
    if (nameValidation !== true) validationErrors.name = nameValidation;
    if (emailValidation !== true) validationErrors.email = emailValidation;
    if (messageValidation !== true) validationErrors.message = messageValidation;
    if (!formData.reason) validationErrors.reason = 'Please select a reason for your message.';

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const attachmentNote = formData.attachment
        ? `\n\nAttachment: ${formData.attachment.name}`
        : '';

      const result = await messageService.createMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject || formData.reason,
        message: `${formData.message}${attachmentNote}`,
        category: (formData.reason || 'General Enquiry').toLowerCase(),
        status: 'new',
      });

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to submit message.');
      }

      setStatus('Thank you! Your message has been received and our team will be in touch soon.');
      resetForm({ preserveStatus: true });
    } catch (error) {
      setStatus('We could not submit your message right now. Please email us directly at docadi.healthinitiative@gmail.com instead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form id="contact-form" className="space-y-4" aria-label="Contact form" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700">
          <span className="mb-2 block">Full Name</span>
          <input
            id="contact-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            type="text"
            disabled={isSubmitting}
            className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary"
            required
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
          />
          {errors.name && <span id="contact-name-error" className="mt-2 block text-sm text-rose-600">{errors.name}</span>}
        </label>
        <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700">
          <span className="mb-2 block">Email Address</span>
          <input
            id="contact-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            disabled={isSubmitting}
            className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary"
            required
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
          />
          {errors.email && <span id="contact-email-error" className="mt-2 block text-sm text-rose-600">{errors.email}</span>}
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label htmlFor="contact-phone" className="block text-sm font-medium text-slate-700">
          <span className="mb-2 block">Phone Number</span>
          <input
            id="contact-phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            type="tel"
            disabled={isSubmitting}
            className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary"
            placeholder="Optional"
          />
        </label>
        <label htmlFor="contact-reason" className="block text-sm font-medium text-slate-700">
          <span className="mb-2 block">Reason for Contact</span>
          <select
            id="contact-reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary"
            aria-describedby={errors.reason ? 'contact-reason-error' : undefined}
          >
            {reasons.map((reason) => <option key={reason} value={reason}>{reason}</option>)}
          </select>
          {errors.reason && <span id="contact-reason-error" className="mt-2 block text-sm text-rose-600">{errors.reason}</span>}
        </label>
      </div>

      <label htmlFor="contact-subject" className="block text-sm font-medium text-slate-700">
        <span className="mb-2 block">Subject</span>
        <input
          id="contact-subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          type="text"
          disabled={isSubmitting}
          className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary"
          placeholder="What would you like to discuss?"
        />
      </label>

      <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700">
        <span className="mb-2 block">Message</span>
        <textarea
          id="contact-message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows="6"
          maxLength={1200}
          disabled={isSubmitting}
          className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary"
          placeholder="Please share a few details so we can help you better."
          aria-describedby={`contact-message-help${errors.message ? ' contact-message-error' : ''}`}
        />
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {errors.message && <span id="contact-message-error" className="text-sm text-rose-600">{errors.message}</span>}
          <span id="contact-message-help" className="text-sm text-slate-500">{formData.message.length}/1200 characters</span>
        </div>
      </label>

      <label htmlFor="contact-attachment" className="block text-sm font-medium text-slate-700">
        <span className="mb-2 block">Upload supporting file</span>
        <input
          id="contact-attachment"
          ref={fileInputRef}
          name="attachment"
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          disabled={isSubmitting}
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 outline-none file:mr-4 file:rounded-full file:border-0 file:bg-dahiPrimary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white focus:border-dahiPrimary"
        />
        <p className="mt-2 text-sm text-slate-500">Optional: attach one document or image to help us understand your request.</p>
      </label>

      {formData.attachment && (
        <p className="text-sm text-slate-600">Selected file: <span className="font-semibold text-slate-900">{formData.attachment.name}</span></p>
      )}

      <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        <p className="font-semibold text-slate-900">Privacy notice</p>
        <p className="mt-2">Your message will be used only to respond to your enquiry. By sending this message, you agree to our <a href="/privacy" className="font-semibold text-dahiPrimary underline underline-offset-2">Privacy Policy</a>.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-dahiPrimary px-6 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting ? <><LoaderCircle size={16} className="animate-spin" /> Sending...</> : 'Send Message'}
        </button>
        <button type="button" onClick={resetForm} disabled={isSubmitting} className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-dahiPrimary hover:text-dahiPrimary disabled:cursor-not-allowed disabled:opacity-70">Reset</button>
      </div>

      {status && (
        <div className={`flex items-start gap-2 rounded-[1rem] border px-4 py-3 text-sm ${status.includes('Thank you') ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          {status.includes('Thank you') ? <CheckCircle2 size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
          <span>{status}</span>
        </div>
      )}
    </form>
  );
}

export default ContactForm;
