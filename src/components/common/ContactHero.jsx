import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircleMore } from 'lucide-react';

function ContactHero({
  eyebrow = 'Contact',
  title = 'Get in Touch',
  description = 'We would love to hear from you.',
  image = '/community-1200.jpg',
  primaryActionLabel = 'Send a Message',
  primaryActionHref = '#contact-form',
  secondaryActionLabel = 'Explore Our Programs',
  secondaryActionHref = '/programs',
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-slate-900 text-white shadow-sm">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/60" />
      <div className="relative grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
        <div>
          <span className="eyebrow bg-white/15 text-white">{eyebrow}</span>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">{description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={primaryActionHref} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">
              {primaryActionLabel}
              <ArrowRight size={16} />
            </a>
            <Link to={secondaryActionHref} className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              {secondaryActionLabel}
            </Link>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/20 bg-white/10 p-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/15 p-3">
              <MessageCircleMore size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">We’re here for you</p>
              <p className="text-lg font-semibold text-white">Meaningful conversations, trusted support</p>
            </div>
          </div>
          <div className="mt-6 space-y-3 text-sm leading-7 text-slate-200">
            <p>Every enquiry matters to us, whether you are seeking guidance, collaboration, volunteering, speaking invitations, or community support.</p>
            <p>We look forward to connecting with individuals, organisations, and partners who care about women’s health education.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactHero;
