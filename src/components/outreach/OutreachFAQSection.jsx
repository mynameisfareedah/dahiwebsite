import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SectionHeading from '../common/SectionHeading';

function OutreachFAQSection({ faqs }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  return (
    <section className="section-shell max-w-7xl space-y-6">
      <SectionHeading
        eyebrow="Have Questions?"
        title="Frequently Asked Questions"
        description="Find answers to common questions about the August Community Health Outreach."
      />

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="soft-card overflow-hidden"
          >
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="flex w-full items-center justify-between px-6 py-4 sm:px-8"
              aria-expanded={expandedIndex === index}
            >
              <h3 className="text-left font-semibold text-slate-900">{faq.question}</h3>
              <ChevronDown
                size={20}
                className={`flex-shrink-0 text-dahiPrimary transition ${
                  expandedIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expandedIndex === index && (
              <div className="border-t border-slate-200 px-6 py-4 sm:px-8">
                <p className="text-slate-600">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center sm:p-8">
        <p className="text-sm text-slate-600">
          Can&apos;t find the answer you&apos;re looking for?{' '}
          <a href="/contact" className="font-semibold text-dahiPrimary transition hover:text-dahiSecondary">
            Contact our team
          </a>
        </p>
      </div>
    </section>
  );
}

export default OutreachFAQSection;
