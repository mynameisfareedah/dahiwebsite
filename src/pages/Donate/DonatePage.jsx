import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import PageHero from '../../components/common/PageHero';
import SectionHeading from '../../components/common/SectionHeading';
import CTASection from '../../components/common/CTASection';
import { useSupabaseData } from '../../hooks/useSupabaseData';

const options = [
  { title: 'One-time donation', description: 'Make a single contribution to support a webinar, resource, or outreach activity.' },
  { title: 'Monthly support', description: 'Create a steady stream of support for ongoing education and community initiatives.' },
];

const faqs = [
  { question: 'How will my donation be used?', answer: 'Donations help fund educational events, materials, outreach, and community activities that expand access to trusted health information.' },
  { question: 'Will I receive a receipt?', answer: 'Yes, a receipt will be provided for completed contributions once payment processing is finalized.' },
  { question: 'Can I support without donating money?', answer: 'Absolutely. You can also volunteer, share resources, or help spread awareness in the community.' },
];

function DonatePage() {
  const { data: donations = [], isLoading: loadingCampaigns, error: campaignsError } = useSupabaseData('donations', '*', {
    staleTime: 60000,
    retry: false,
  });

  const donationCampaigns = useMemo(() => {
    // Temporarily hide donation campaigns from the public page until the active campaign is removed from the database.
    return [];
    // return (donations || []).map((d) => ({
    //   ...d,
    //   title: d.title || d.name || '',
    //   description: d.description || '',
    //   image_url: d.image_url || d.image || null,
    //   goal_amount: d.goal_amount != null ? Number(d.goal_amount) : 0,
    //   amount_raised: d.amount_raised != null ? Number(d.amount_raised) : 0,
    //   currency: d.currency || 'NGN',
    // }));
  }, [donations]);

  return (
    <>
      <SEO title="Donate" description="Support DAHI's work through donation options, impact stories, and a simple overview of how contributions help women’s health education." />
      <PageHero
        eyebrow="Donate"
        title="Support DAHI’s mission"
        description="Your support helps DAHI create educational materials, host community events, and expand access to trusted health information for women who need it."
        image="/community-1200.jpg"
        breadcrumbs={[{ label: 'Donate' }]}
        actions={[
          <Link key="contact" to="/contact" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">Contact Us</Link>,
          <a key="community" href="https://whatsapp.com/channel/0029VbBdF4hLI8YZRabyWF0j" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Join WhatsApp</a>,
        ]}
      />

      <section className="section-shell max-w-7xl space-y-8">
        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Active campaigns" title="Admin-managed donation campaigns" description="Support the current giving opportunities that our admin team keeps up to date." />
          <div className="mt-6">
            {loadingCampaigns ? (
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-8 text-slate-600">Loading donation campaigns...</div>
            ) : campaignsError ? (
              <div className="rounded-[1.25rem] border border-red-200 bg-red-50 p-8 text-red-800">Unable to load donation campaigns right now.</div>
            ) : donationCampaigns.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {donationCampaigns.map((campaign) => (
                  <article key={campaign.id || campaign.slug} className="rounded-[1.25rem] border border-slate-200 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="inline-flex rounded-full bg-dahiPrimary/10 px-3 py-1 text-sm font-semibold text-dahiPrimary">{campaign.featured ? 'Featured' : 'Donation'}</span>
                      <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{campaign.active ? 'Active' : 'Inactive'}</span>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-slate-900">{campaign.title || 'Donation campaign'}</h3>
                    <p className="mt-3 text-slate-600">{campaign.description || 'Support DAHI through this opportunity and help us deliver health education and outreach.'}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{campaign.goal_amount > 0 ? `Goal: ${campaign.currency || 'NGN'} ${Number(campaign.goal_amount).toLocaleString()}` : 'Open amount'}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{campaign.amount_raised > 0 ? `Raised: ${campaign.currency || 'NGN'} ${Number(campaign.amount_raised).toLocaleString()}` : ''}</span>
                      <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-dahiPrimary px-4 py-2 text-sm font-semibold text-dahiPrimary transition hover:bg-dahiPrimary/10">Contact Us</Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-8 text-slate-600">No active donation campaigns are listed yet. Please check back soon or contact us to support DAHI.</div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="soft-card p-8 sm:p-10">
            <SectionHeading eyebrow="Why donate" title="Your contribution helps create lasting impact" description="Every donation helps sustain educational programs, build awareness, and support women in accessing trustworthy information." />
            <ul className="mt-6 space-y-3 text-slate-600">
              <li>• Fund educational webinars and community learning activities</li>
              <li>• Support production of accessible health resources</li>
              <li>• Strengthen outreach to women and families in the community</li>
            </ul>
          </div>
          <div className="soft-card p-8 sm:p-10">
            <SectionHeading eyebrow="Donation options" title="Choose a giving option that fits you" description="Payment gateways are placeholders for future integration while the page remains front-end ready." />
            <div className="mt-6 space-y-4">
              {options.map((option) => (
                <div key={option.title} className="rounded-[1.25rem] border border-slate-200 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{option.title}</h3>
                  <p className="mt-2 text-slate-600">{option.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
              <span className="rounded-full bg-slate-100 px-4 py-2">Paystack placeholder</span>
              <span className="rounded-full bg-slate-100 px-4 py-2">Flutterwave placeholder</span>
              <span className="rounded-full bg-slate-100 px-4 py-2">Bank transfer placeholder</span>
            </div>
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Frequently asked questions" title="Questions about giving" description="Here are a few common questions about supporting DAHI’s work." />
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-[1.25rem] border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900">{faq.question}</h3>
                <p className="mt-3 text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <CTASection eyebrow="Support the mission" title="A gift today can help more women access trusted education" description="Your support helps DAHI grow its impact and continue creating meaningful, community-centered learning experiences." actions={[
          <Link key="contact" to="/contact" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">Get in Touch</Link>,
          <Link key="volunteer" to="/volunteer" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Volunteer Instead</Link>,
        ]} />
      </section>
    </>
  );
}

export default DonatePage;
