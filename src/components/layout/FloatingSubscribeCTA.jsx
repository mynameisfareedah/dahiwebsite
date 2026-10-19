import { Mail } from 'lucide-react';
import NewsletterLink from './NewsletterLink';

function FloatingSubscribeCTA({ hidden = false }) {
  return (
    <NewsletterLink
      hidden={hidden}
      data-testid="floating-subscribe-cta"
      data-floating-subscribe-cta
      className="fixed z-20 inline-flex min-h-12 items-center gap-2 rounded-full bg-dahiPrimary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-colors hover:bg-dahiSecondary hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dahiPrimary motion-reduce:transition-none"
      style={{
        display: hidden ? 'none' : undefined,
        right: 'calc(env(safe-area-inset-right, 0px) + 1rem)',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)',
      }}
    >
      <Mail size={18} aria-hidden="true" />
      Subscribe
    </NewsletterLink>
  );
}

export default FloatingSubscribeCTA;
