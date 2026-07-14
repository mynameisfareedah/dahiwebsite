import SEO from '../../components/common/SEO';
import SectionHeading from '../../components/common/SectionHeading';
import { Link } from 'react-router-dom';

function PrivacyPage() {
  return (
    <>
      <SEO title="Privacy Policy" description="DAHI privacy policy for the use of this site and contact form communications." />
      <section className="section-shell mx-auto max-w-6xl space-y-8">
        <SectionHeading eyebrow="Legal" title="Privacy Policy" description="How DAHI protects your information when you reach out or explore our services." />
        <div className="rounded-[1.25rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="mb-4 text-slate-700 leading-7">
            We respect your privacy and handle your personal information with care. Any details you share through this contact form are used only to respond to your enquiry and to provide the services you request.
          </p>
          <h2 className="mt-6 text-lg font-semibold text-slate-900">What we collect</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-slate-700">
            <li>Your name and contact details.</li>
            <li>Information related to your enquiry or request.</li>
            <li>Optional files you choose to attach to support your message.</li>
          </ul>
          <h2 className="mt-6 text-lg font-semibold text-slate-900">How we use it</h2>
          <p className="mt-3 text-slate-700 leading-7">
            We use your information to reply to your message, organise follow-up conversations, and support collaborations or community activities. We do not sell your data.
          </p>
          <h2 className="mt-6 text-lg font-semibold text-slate-900">Sharing and security</h2>
          <p className="mt-3 text-slate-700 leading-7">
            Your information may be shared only with members of the DAHI team who need it to respond to your enquiry. We take reasonable steps to protect your data and keep it secure.
          </p>
          <h2 className="mt-6 text-lg font-semibold text-slate-900">Questions or updates</h2>
          <p className="mt-3 text-slate-700 leading-7">
            If you have questions about this policy or would like to update your information, please <Link to="/contact" className="font-semibold text-dahiPrimary underline underline-offset-2">contact DAHI</Link>.
          </p>
        </div>
      </section>
    </>
  );
}

export default PrivacyPage;
