import { Link } from 'react-router-dom';
import { WHATSAPP_CHANNEL_URL, WHATSAPP_GROUP_URL } from '../../constants/communityLinks';

function GetInvolved() {
  const actions = [
    {
      icon: 'fa-solid fa-hands-helping',
      title: 'Volunteer',
      description: 'Share your skills and time to help educate and empower more women.',
      link: '/volunteer',
      buttonText: 'Learn More About Volunteering',
    },
    {
      icon: 'fa-solid fa-users',
      title: 'Stay Connected',
      description: 'Receive DAHI health and community updates by email.',
      link: '/#newsletter',
      buttonText: 'Subscribe for Updates',
    },
    {
      icon: 'fa-solid fa-users',
      title: 'WhatsApp Community',
      description: 'Join the DAHI WhatsApp Group to connect with the community, or follow the Channel for DAHI updates and announcements.',
      whatsapp: true,
    },
    {
      icon: 'fa-solid fa-envelope',
      title: 'Contact Us',
      description: "Have questions or want to collaborate? We would love to hear from you.",
      link: '/contact',
      buttonText: 'Get in Touch',
    },
  ];

  return (
    <section className="section-shell max-w-7xl">
      <div className="mb-12 text-center">
        <span className="eyebrow">Ways to Engage</span>
        <h2 className="mt-4 section-title">Get Involved with DAHI</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">There are many ways to support women&apos;s health education. Choose how you want to make an impact.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <article key={action.title} className="soft-card flex flex-col p-6 transition hover:shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-dahiPrimary/10 text-xl text-dahiPrimary">
              <i className={action.icon}></i>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">{action.title}</h3>
            <p className="mt-2 flex-grow text-sm text-slate-600">{action.description}</p>
            {action.whatsapp ? (
              <div className="mt-4 grid gap-3">
                <a
                  href={WHATSAPP_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-whatsapp-action
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-dahiPrimary px-4 py-2 text-sm font-semibold text-white hover:bg-dahiSecondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dahiPrimary"
                >
                  Join WhatsApp Group
                </a>
                <a
                  href={WHATSAPP_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-whatsapp-action
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-dahiPrimary px-4 py-2 text-sm font-semibold text-dahiPrimary hover:bg-dahiPrimary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dahiPrimary"
                >
                  Follow WhatsApp Channel
                </a>
              </div>
            ) : (
              <Link
                to={action.link}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-dahiPrimary px-4 py-2 text-sm font-semibold text-white transition hover:bg-dahiSecondary"
                aria-label={action.buttonText}
              >
                {action.buttonText}
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default GetInvolved;
