import { ExternalLink, Link2, Video, Newspaper, MessageSquare } from 'lucide-react';

const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/docadihealthintiative_?igsh=YmtnbW1hZnp6MWFz', icon: ExternalLink, description: 'Follow DAHI for health stories, wellness tips, and community updates.' },
  { label: 'Facebook', href: 'https://www.facebook.com/share/1A8VVfnJyr', icon: ExternalLink, description: 'Join our Facebook community to stay connected and share event news.' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/', icon: Link2, description: 'Follow DAHI for professional updates, partnerships, and women’s health insights.' },
  { label: 'YouTube', href: 'https://youtube.com/@dahi-01?si=b54Rt5TiEc5Yvb7q', icon: Video, description: 'Watch our latest talks, educational videos, and health discussions.' },
  { label: 'Substack', href: 'https://womenshealthwithdocadi.substack.com', icon: Newspaper, description: 'Read the latest DAHI newsletters, articles, and expert guidance.' },
  { label: 'WhatsApp Channel', href: 'https://whatsapp.com/channel/0029VbBdF4hLI8YZRabyWF0j', icon: MessageSquare, description: 'Join our WhatsApp channel for direct community updates and support.' },
];

function SocialLinks({ title = 'Follow DAHI', description = 'Stay connected for health education articles, webinars, and community updates.' }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-slate-600">{description}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {socialLinks.map(({ label, href, icon: Icon, description: cardDescription }) => (
          <a key={label} href={href} target="_blank" rel="noopener" className="group rounded-[1.25rem] border border-slate-200 bg-slate-50 p-5 transition hover:border-dahiPrimary hover:bg-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-dahiPrimary/10 text-dahiPrimary transition group-hover:bg-dahiPrimary group-hover:text-white">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className="mt-1 text-sm text-slate-600">{cardDescription}</p>
              </div>
            </div>
            <div className="mt-5 text-sm font-semibold text-dahiPrimary">Visit {label} →</div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default SocialLinks;
