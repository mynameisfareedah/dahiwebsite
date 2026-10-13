import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

function NewsletterSection() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [updateCategories, setUpdateCategories] = useState([]);
  const [healthInterests, setHealthInterests] = useState([]);
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
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          consent,
          website,
          updateCategories,
          healthInterests,
        }),
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
      setLastName('');
      setEmail('');
      setUpdateCategories([]);
      setHealthInterests([]);
      setWebsite('');
      setConsent(false);
      setStatus({ type: 'success' });
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
    <section
      id="newsletter"
      tabIndex={-1}
      className="section-shell max-w-7xl scroll-mt-24 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-dahiPrimary"
    >
      <div className="soft-card overflow-hidden p-8 sm:p-10">
        <div className="max-w-3xl">
          <span className="eyebrow">Stay Connected</span>
          <h2 className="mt-4 text-3xl font-black text-slate-900">Join the DAHI Community</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Stay informed with practical health education, webinar invitations, community outreach updates, and opportunities to participate in DAHI initiatives.
          </p>
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
            <label htmlFor="newsletter-last-name" className="block text-sm font-medium text-slate-700">
              Last name <span className="font-normal text-slate-500">(optional)</span>
              <input
                id="newsletter-last-name"
                name="lastName"
                type="text"
                autoComplete="family-name"
                maxLength={80}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                disabled={isSubmitting}
                className="mt-2 w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none focus:border-dahiPrimary disabled:opacity-70"
              />
            </label>
            <label htmlFor="newsletter-email" className="block text-sm font-medium text-slate-700 sm:col-span-2">
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

          <PreferenceGroup
            id="newsletter-update-categories"
            title="Updates and activities"
            description="Choose any types of DAHI updates you would like to receive."
            options={[
              'Health tips and educational resources',
              'Webinars and events',
              'Community outreach updates',
              'Volunteering and participation opportunities',
            ]}
            selected={updateCategories}
            onChange={setUpdateCategories}
            disabled={isSubmitting}
          />

          <PreferenceGroup
            id="newsletter-health-interests"
            title="Health interests"
            description="Choose any topics you would like DAHI to cover. These preferences are not medical information."
            options={[
              'Menstrual health',
              'Fertility and conception',
              'Pregnancy and childbirth',
              'Breast health',
              'Family planning',
              'Menopause',
              'Mental health and wellbeing',
              'Nutrition and healthy living',
              'Sexual and reproductive health',
              'Preventive healthcare',
            ]}
            selected={healthInterests}
            onChange={setHealthInterests}
            disabled={isSubmitting}
          />

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
          {status?.type === 'success' && (
            <div role="status" aria-live="polite" className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-slate-700 sm:p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-emerald-700" aria-hidden="true" />
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-dahiPrimary">
                    Thank You for Joining the DAHI Community!
                  </h3>
                  <p>We&apos;re delighted to have you connect with us.</p>
                  <p>
                    Please check your email inbox (including your spam or junk folder) for a confirmation email, if you haven&apos;t already confirmed your subscription.
                  </p>
                  <p>
                    Once confirmed, you&apos;ll be able to receive DAHI health education resources, webinar invitations, community updates, and opportunities to get involved.
                  </p>
                  <p className="font-semibold text-dahiPrimary">Already subscribed? You&apos;re all set!</p>
                </div>
              </div>
            </div>
          )}
          {status?.type === 'error' && (
            <p role="alert" aria-live="assertive" className="text-sm text-rose-700">
              {status.message}
            </p>
          )}
        </form>
        <p className="mt-3 text-sm text-slate-500">New subscriptions remain pending until you confirm by email. You can unsubscribe at any time.</p>
      </div>
    </section>
  );
}

function PreferenceGroup({ id, title, description, options, selected, onChange, disabled }) {
  const handleChange = (option) => {
    onChange((current) => (
      current.includes(option)
        ? current.filter((value) => value !== option)
        : [...current, option]
    ));
  };

  return (
    <details className="rounded-xl border border-slate-200 bg-white">
      <summary className="cursor-pointer rounded-xl px-4 py-3 font-semibold text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dahiPrimary">
        {title} <span className="font-normal text-slate-500">(optional)</span>
      </summary>
      <fieldset className="space-y-3 border-t border-slate-100 px-4 py-4">
        <legend className="sr-only">Select {title.toLowerCase()}</legend>
        <p id={`${id}-description`} className="text-sm leading-6 text-slate-600">
          {description}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((option, index) => {
            const inputId = `${id}-${index}`;
            return (
              <label key={option} htmlFor={inputId} className="flex min-h-11 items-start gap-3 text-sm leading-6 text-slate-700">
                <input
                  id={inputId}
                  type="checkbox"
                  value={option}
                  checked={selected.includes(option)}
                  onChange={() => handleChange(option)}
                  disabled={disabled}
                  aria-describedby={`${id}-description`}
                  className="mt-1 h-4 w-4 shrink-0 accent-dahiPrimary"
                />
                {option}
              </label>
            );
          })}
        </div>
      </fieldset>
    </details>
  );
}

export default NewsletterSection;
