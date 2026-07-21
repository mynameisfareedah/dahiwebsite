import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

function VolunteerFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'Do I need previous experience to volunteer?',
      answer: 'No! We welcome volunteers from all backgrounds. If you\'re passionate about women\'s health and community impact, we\'d love to have you. Training and support will be provided.',
    },
    {
      question: 'How much time do I need to commit?',
      answer: 'Flexibility is important to us. You can volunteer as much or as little as your schedule allows. Whether you can contribute a few hours a month or become a regular volunteer, we\'ll find opportunities that work for you.',
    },
    {
      question: 'Can I volunteer remotely?',
      answer: 'Yes! We offer virtual volunteer opportunities including content creation, social media support, virtual event coordination, and more. We also have in-person opportunities if you prefer.',
    },
    {
      question: 'What support will I receive as a volunteer?',
      answer: 'We provide comprehensive training, ongoing mentorship, and a supportive community. You\'ll have clear guidance on your role and regular check-ins to ensure you\'re having a positive experience.',
    },
    {
      question: 'Can I volunteer if I\'m not sure which role is right for me?',
      answer: 'Absolutely! Many volunteers start by exploring different roles to find the best fit. Our team will help match you with opportunities that align with your skills and interests.',
    },
    {
      question: 'How do I stay connected with other volunteers?',
      answer: 'We host regular volunteer meetups, workshops, and social events. You\'ll also have access to our volunteer community platform where you can connect, share, and celebrate wins together.',
    },
  ];

  return (
    <section className="section-shell max-w-7xl space-y-8">
      <div className="mx-auto max-w-3xl text-center">
        <span className="eyebrow">Common questions</span>
        <h2 className="mt-4 section-title">Frequently Asked Questions</h2>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Have questions about volunteering? We\'ve answered some common ones below.
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-4">
        {faqs.map((faq, index) => (
          <button
            key={index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full text-left"
          >
            <div className="soft-card p-6 transition hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-semibold text-slate-900">{faq.question}</h3>
                <ChevronDown
                  size={20}
                  className={`mt-1 flex-shrink-0 text-dahiPrimary transition ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </div>

              {openIndex === index && (
                <p className="mt-4 text-slate-600">{faq.answer}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export default VolunteerFAQ;
