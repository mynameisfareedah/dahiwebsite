import { useEffect, useRef, useState } from 'react';
import SectionHeading from '../common/SectionHeading';

const transferAccounts = [
  {
    id: 'nigeria',
    title: 'Nigeria Bank Transfer',
    bankName: 'Moniepoint Microfinance Bank',
    accountName: 'Muhammad Haruna',
    accountNumber: '9137689657',
    sortCode: null,
  },
  {
    id: 'uk',
    title: 'United Kingdom Bank Transfer',
    bankName: 'Olamide Dele-Salawu',
    accountName: 'Olamide Dele-Salawu',
    accountNumber: '68792468',
    sortCode: '04-00-75',
  },
];

function DonationSection({ donationImpact }) {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [copiedValue, setCopiedValue] = useState('');
  const sectionRef = useRef(null);
  const highlightTimeout = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries[0];
        if (entry?.isIntersecting) {
          setIsHighlighted(true);
          section.focus({ preventScroll: true });
          if (highlightTimeout.current) window.clearTimeout(highlightTimeout.current);
          highlightTimeout.current = window.setTimeout(() => setIsHighlighted(false), 2000);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
      if (highlightTimeout.current) window.clearTimeout(highlightTimeout.current);
    };
  }, []);

  const handleCopy = async (label, value) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      }
      setCopiedValue(label);
      window.setTimeout(() => setCopiedValue(''), 2000);
    } catch (error) {
      setCopiedValue('');
    }
  };

  const scrollToBankDetails = () => {
    const section = sectionRef.current;
    if (!section) return;

    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsHighlighted(true);
    section.focus({ preventScroll: true });
    if (highlightTimeout.current) window.clearTimeout(highlightTimeout.current);
    highlightTimeout.current = window.setTimeout(() => setIsHighlighted(false), 2000);
  };

  return (
    <section id="support-section" className="section-shell mx-auto max-w-7xl space-y-8">
      <SectionHeading
        eyebrow="Make an Impact"
        title="Help Us Reach More Women This August"
        description="Every contribution helps us deliver quality health education and community outreach to women who need it most. Your support will help us provide educational materials, organise community activities, and deliver an impactful outreach experience."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {donationImpact.map((impact, index) => (
          <article key={index} className="soft-card space-y-3 p-6 sm:p-8">
            <div className="text-4xl">{impact.emoji}</div>
            <div>
              <h3 className="font-bold text-slate-900">{impact.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{impact.description}</p>
            </div>
          </article>
        ))}
      </div>

      <div
        className="rounded-[2rem] border border-dahiPrimary/20 bg-gradient-to-br from-[#fff9f0] via-white to-[#f4f5ff] p-8 shadow-[0_20px_60px_-25px_rgba(88,58,154,0.25)] transition duration-300 hover:-translate-y-1 sm:p-10"
        style={{ animation: 'fadeIn 0.6s ease-out both' }}
        role="note"
        aria-label="Inspirational Qur'anic verse for generosity and charity"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-dahiPrimary/20 bg-white/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-dahiPrimary">
            Give for a Greater Purpose
          </div>

          <p className="mb-4 text-base leading-relaxed text-slate-700">
            Supporting this outreach is more than a financial contribution—it is an investment in healthier communities, empowered women, and lives that may be changed through early detection and health education.
          </p>
          <p className="mb-6 text-base leading-relaxed text-slate-700">
            For those inspired by the teachings of Islam, the Qur'an reminds us of the immense reward and blessings associated with sincere acts of charity.
          </p>

          <div className="relative w-full rounded-[1.5rem] border border-white/70 bg-white/70 p-6 shadow-sm sm:p-8">
            <div className="absolute left-4 top-4 text-5xl text-dahiPrimary/25">“</div>
            <div className="absolute bottom-4 right-4 text-5xl text-dahiPrimary/25">”</div>

            <p
              className="text-center text-2xl font-semibold leading-loose text-dahiPrimary sm:text-3xl"
              dir="rtl"
              lang="ar"
              aria-label="Arabic Qur'anic verse"
            >
              مَّن ذَا ٱلَّذِي يُقْرِضُ ٱللَّهَ قَرْضًا حَسَنًا فَيُضَٰعِفَهُۥ لَهُۥ وَيَغْفِرَ لَهُۥ ۚ وَٱللَّهُ شَكُورٌ حَلِيمٌ
            </p>

            <blockquote className="mt-6 text-lg leading-relaxed text-slate-700 sm:text-xl">
              “If you loan Allah a goodly loan, He will multiply it for you and forgive you. And Allah is Most Appreciative and Most Forbearing.”
            </blockquote>

            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">
              — Surah At-Taghābun (64:17)
            </p>
          </div>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-700">
            Every act of generosity, no matter the size, has the potential to improve lives. Your support helps provide free health education, preventive screenings, and trusted health information to women who may otherwise have limited access to these services.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={scrollToBankDetails}
          className="inline-flex items-center justify-center rounded-full bg-dahiPrimary px-8 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary"
        >
          <i className="fa-solid fa-heart mr-2"></i>
          Donate Now
        </button>
        <a
          href="mailto:docadi.healthinitiative@gmail.com?subject=August Outreach Sponsorship Opportunity"
          className="inline-flex items-center justify-center rounded-full border border-dahiPrimary px-8 py-3 text-sm font-semibold text-dahiPrimary transition hover:bg-dahiPrimary/5"
        >
          <i className="fa-solid fa-handshake mr-2"></i>
          Support This Outreach
        </a>
      </div>

      <div
        id="bank-transfer-details"
        ref={sectionRef}
        tabIndex={-1}
        className={`rounded-[2rem] border border-dahiPrimary/20 bg-white p-6 shadow-sm transition-all duration-500 sm:p-8 ${isHighlighted ? 'ring-2 ring-dahiAccent/50 shadow-[0_0_0_10px_rgba(214,138,38,0.18)]' : ''}`}
        aria-labelledby="bank-transfer-heading"
      >
        <div className="mb-6 flex flex-col gap-3 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-dahiPrimary">Bank Transfer Details</p>
          <h3 id="bank-transfer-heading" className="text-2xl font-bold text-slate-900">Choose your preferred account below</h3>
          <p className="text-sm text-slate-600" aria-live="polite">
            Choose your preferred account below and use the Copy button to complete your bank transfer.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {transferAccounts.map((account) => (
            <div key={account.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-5">
              <div className="mb-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">{account.title}</p>
                <h4 className="mt-1 text-lg font-bold text-slate-900">{account.bankName}</h4>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Account Name</p>
                  <p className="mt-1 font-semibold text-slate-900">{account.accountName}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Account Number</p>
                  <p className="mt-1 font-semibold text-slate-900">{account.accountNumber}</p>
                </div>
                {account.sortCode ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Sort Code</p>
                    <p className="mt-1 font-semibold text-slate-900">{account.sortCode}</p>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(`account-name:${account.id}`, account.accountName)}
                  className="rounded-full border border-dahiPrimary px-3 py-2 text-sm font-semibold text-dahiPrimary transition hover:bg-dahiPrimary/5"
                >
                  {copiedValue === `account-name:${account.id}` ? 'Copied!' : 'Copy Account Name'}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(`account-number:${account.id}`, account.accountNumber)}
                  className="rounded-full border border-dahiPrimary px-3 py-2 text-sm font-semibold text-dahiPrimary transition hover:bg-dahiPrimary/5"
                >
                  {copiedValue === `account-number:${account.id}` ? 'Copied!' : 'Copy Account Number'}
                </button>
                {account.sortCode ? (
                  <button
                    type="button"
                    onClick={() => handleCopy(`sort-code:${account.id}`, account.sortCode)}
                    className="rounded-full border border-dahiPrimary px-3 py-2 text-sm font-semibold text-dahiPrimary transition hover:bg-dahiPrimary/5"
                  >
                    {copiedValue === `sort-code:${account.id}` ? 'Copied!' : 'Copy Sort Code'}
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-slate-600">
        Your generosity today can help protect the health of women and strengthen communities tomorrow.
      </p>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}

export default DonationSection;
