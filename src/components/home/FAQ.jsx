import { useState } from 'react';

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is DAHI?",
      answer: "DAHI (Doc Adi Health Initiative) is a women's health education organization dedicated to empowering Muslim women with evidence-based, culturally affirming health information. We provide trusted resources, conduct educational webinars, and foster supportive communities.",
    },
    {
      question: "Are your educational resources free?",
      answer: "Yes, most of our resources are available for free. Some premium guides and specialized courses may have a small cost to support our mission and ensure high-quality content.",
    },
    {
      question: "How can I volunteer with DAHI?",
      answer: "Visit our Volunteer page to learn about available opportunities and submit your application. We welcome volunteers with diverse skills and backgrounds who are passionate about women's health education.",
    },
    {
      question: "How can I support DAHI?",
      answer: "You can support DAHI by donating, volunteering your time or skills, joining our community, sharing our resources with others, or partnering with us on initiatives. Every contribution helps us reach more women.",
    },
    {
      question: "How do I contact DAHI?",
      answer: "You can reach us through our Contact page, via email at docadi.healthintiative@gmail.com, or through our social media channels. We typically respond within 1-2 business days.",
    },
  ];

  return (
    <section className="section-shell mx-auto max-w-7xl">
      <div className="mb-12 text-center">
        <span className="eyebrow">Questions?</span>
        <h2 className="mt-4 section-title">Frequently Asked Questions</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">Find answers to common questions about DAHI and how we can support you.</p>
      </div>

      <div className="mx-auto max-w-3xl space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-[1.25rem] border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span className="text-base font-semibold text-slate-900">{faq.question}</span>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full bg-dahiPrimary/10 text-dahiPrimary transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              >
                <i className="fa-solid fa-chevron-down text-sm"></i>
              </div>
            </button>

            {openIndex === index && (
              <div id={`faq-answer-${index}`} className="border-t border-slate-200 px-6 py-4">
                <p className="text-slate-600">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default FAQ;
