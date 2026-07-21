import { useState } from 'react';
import { ClipboardCopy } from 'lucide-react';

function ContactCard({ icon: Icon, title, value, description, href, linkLabel = 'Contact' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (event) => {
    event.preventDefault();

    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Clipboard not supported or user denied permission.
    }
  };

  const copyable = value && href && (href.startsWith('mailto:') || href.startsWith('tel:'));

  const content = (
    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-dahiPrimary">
        <Icon size={20} />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-slate-600">{description}</p>
      {value && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-dahiPrimary break-all">{value}</p>
          {copyable && (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-dahiPrimary hover:text-dahiPrimary"
              aria-label={`Copy ${title} to clipboard`}
            >
              {copied ? 'Copied' : <ClipboardCopy size={16} />}
            </button>
          )}
        </div>
      )}
      {href && (
        <div className="mt-5 text-sm font-semibold text-dahiPrimary">
          <a href={href} target="_blank" rel="noopener noreferrer" className="transition hover:text-dahiSecondary">
            {linkLabel} →
          </a>
        </div>
      )}
    </div>
  );

  return (
    <div className="block transition hover:-translate-y-0.5">
      {content}
    </div>
  );
}

export default ContactCard;
