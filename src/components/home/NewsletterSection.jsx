import { useState } from 'react';
import { Link } from 'react-router-dom';

function NewsletterSection() {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch('/.netlify/functions/subscribe-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, email, consent, website }),
      });
      const result = await response.json();

      if (!response.ok || result?.accepted !== true) {
        setStatus({
          type: 'error',
          message: response.status === 429
            ? 'Too many attempts. Please wait a little while and try again.'
            : 'We could not process your subscription right now. Please try again later.',
        });
        return;
      }

      setFirstName('');
      setEmail('');
      setWebsite('');
      setConsent(false);
      setStatus({
        type: 'success',
        message: 'Thank you. If confirmation is needed, EmailOctopus will send a confirmation email. Please check your inbox and spam folder.',
      });
    } catch {
      setStatus({
        type: 'error',
        message: 'We could not connect right now. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="newsletter" className="section-shell max-w-7xl scroll-mt-24">
      <div className="soft-card overflow-hidden p-8 sm:p-10">
        <div className="max-w-3xl">
          <span className="eyebrow">Stay Connected</span>
          <h2 className="mt-4 text-3xl font-black text-slate-900">Stay Connected</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">Receive updates about DAHI webinars, community health initiatives, educational resources, and opportunities to get involved.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label htmlFor="newsletter-first-name" className="block text-sm font-medium text-slate-700">
              First name <span className="font-normal text-slate-500">(optional)</span>
              <input
                id="newsletter-first-name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                maxLength={80}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                disabled={isSubmitting}
                className="mt-2 w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none focus:border-dahiPrimary disabled:opacity-70"
              />
            </label>
            <label htmlFor="newsletter-email" className="block text-sm font-medium text-slate-700">
              Email address
              <input
                id="newsletter-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={isSubmitting}
                className="mt-2 w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none focus:border-dahiPrimary disabled:opacity-70"
                aria-describedby="newsletter-consent"
              />
            </label>
          </div>

          <label htmlFor="newsletter-consent" className="flex items-start gap-3 text-sm leading-6 text-slate-600">
            <input
              id="newsletter-consent"
              name="consent"
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              required
              disabled={isSubmitting}
              className="mt-1 h-4 w-4 shrink-0 accent-dahiPrimary"
            />
            <span>
              I agree to receive DAHI health and community updates by email. I understand I can unsubscribe at any time. See our{' '}
              <Link to="/privacy" className="font-semibold text-dahiPrimary underline underline-offset-2">Privacy Policy</Link>.
            </span>
          </label>

          <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
            <label htmlFor="newsletter-website">Leave this field empty</label>
            <input
              id="newsletter-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-full bg-dahiPrimary px-5 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {isSubmitting ? 'Submitting…' : 'Subscribe'}
          </button>
          {status && (
            <p role={status.type === 'error' ? 'alert' : 'status'} aria-live={status.type === 'error' ? 'assertive' : 'polite'} className={`text-sm ${status.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
              {status.message}
            </p>
          )}
        </form>
        <p className="mt-3 text-sm text-slate-500">New subscriptions remain pending until you confirm by email. You can unsubscribe at any time.</p>
      </div>
    </section>
  );
}

export default NewsletterSection;
