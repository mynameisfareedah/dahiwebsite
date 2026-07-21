import { Link } from 'react-router-dom';

function GetInvolved() {
  const actions = [
    {
      icon: 'fa-solid fa-hands-helping',
      title: 'Volunteer',
      description: 'Help us educate and empower more women by sharing your skills and time.',
      link: '/volunteer',
      buttonText: 'Learn More About Volunteering',
    },
    {
      icon: 'fa-solid fa-heart',
      title: 'Donate',
      description: 'Support our health education initiatives and expand our reach to more communities.',
      link: '/donate',
      buttonText: 'Support Us',
    },
    {
      icon: 'fa-solid fa-users',
      title: 'Join Our Community',
      description: 'Become part of our growing network of women committed to health and wellness.',
      href: 'https://forms.gle/joTjf3VYW9anCA9MA',
      external: true,
      buttonText: 'Join Now',
    },
    {
      icon: 'fa-solid fa-envelope',
      title: 'Contact Us',
      description: 'Have questions or want to collaborate? We would love to hear from you.',
      link: '/contact',
      buttonText: 'Get in Touch',
    },
  ];

  return (
    <section className="section-shell max-w-7xl">
      <div className="mb-12 text-center">
        <span className="eyebrow">Ways to Engage</span>
        <h2 className="mt-4 section-title">Get Involved with DAHI</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">There are many ways to support women's health education. Choose how you want to make an impact.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <article key={action.title} className="soft-card flex flex-col p-6 transition hover:shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-dahiPrimary/10 text-xl text-dahiPrimary">
              <i className={action.icon}></i>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">{action.title}</h3>
            <p className="mt-2 flex-grow text-sm text-slate-600">{action.description}</p>
            {action.external ? (
              <a
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center rounded-full bg-dahiPrimary px-4 py-2 text-sm font-semibold text-white transition hover:bg-dahiSecondary"
                aria-label={action.buttonText}
              >
                {action.buttonText}
              </a>
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
