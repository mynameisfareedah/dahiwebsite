export const testimonials = [
  {
    id: 'webinar-well-structured',
    quote: 'The webinar was well-structured, and the delivery made every topic easy to understand.',
    category: 'Educational Sessions',
    attribution: 'Anonymous participant',
    context: 'Webinar',
    status: 'verified',
    featuredOnHome: true,
  },
  {
    id: 'webinar-engaging',
    quote: 'I enjoyed every part of the webinar. It was engaging from beginning to end.',
    category: 'Educational Sessions',
    attribution: 'Anonymous participant',
    context: 'Webinar',
    status: 'verified',
  },
  {
    id: 'webinar-practical-information',
    quote: 'The information was presented in a way that was easy to understand and apply.',
    category: 'Educational Sessions',
    attribution: 'Anonymous participant',
    context: 'Webinar',
    status: 'verified',
  },
  {
    id: 'online-quiz-participant',
    quote: 'Jazak Allahu Khayran for the quiz. I enjoyed taking part.',
    category: 'Online Quiz',
    attribution: 'Anonymous participant',
    context: 'Online Quiz',
    status: 'verified',
    featuredOnHome: true,
  },
  {
    id: 'educational-session-participant',
    quote: 'Thank you for that wonderful presentation yesterday. I was late but still learnt some things.',
    category: 'Educational Sessions',
    attribution: 'Anonymous participant',
    context: 'Educational session',
    status: 'verified',
  },
  {
    id: 'community-appreciation-whatsapp',
    quote: 'May Allah the exalted bless you abundantly and reward you for all your efforts.',
    category: 'Community Appreciation',
    attribution: 'Anonymous community member',
    status: 'verified',
    featuredOnHome: true,
  },
  {
    id: 'womens-health-qa-feedback',
    quote: 'The detailed way the session was held and the easy to understand delivery.',
    category: 'Educational Sessions',
    attribution: 'Anonymous webinar participant',
    context: "Women's Health Q&A",
    status: 'verified',
  },
  {
    id: 'contraception-session-gratitude',
    quote: 'I was very impressed with and grateful for the sessions',
    category: 'Educational Sessions',
    attribution: 'Anonymous contraception session participant',
    context: 'Contraception education',
    status: 'verified',
  },
  {
    id: 'contraception-session-insightful',
    quote: 'Quite insightful and hope this can be done periodically',
    category: 'Educational Sessions',
    attribution: 'Anonymous contraception session participant',
    context: 'Contraception education',
    status: 'verified',
  },
  {
    id: 'menopause-webinar-feedback',
    quote: 'This is an eye opener make it more regular and for men to listen I made sure my husband listened too',
    category: 'Educational Sessions',
    attribution: 'Anonymous menopause webinar participant',
    context: 'Menopause education',
    status: 'verified',
  },
  {
    id: 'menstrual-health-action',
    quote: 'The need to take control and action about my health',
    category: 'Educational Sessions',
    attribution: 'Anonymous menstrual health session participant',
    context: 'Menstrual health',
    status: 'verified',
  },
  {
    id: 'faith-conscious-health-education',
    quote: "prioritise my 'women's' health in accordance with Allah's guidance",
    category: 'Educational Sessions',
    attribution: 'Anonymous menstrual health session participant',
    context: 'Menstrual health',
    status: 'verified',
  },
  {
    id: 'community-appreciation-google-form',
    quote: 'You are doing a great job ma,may Allah reward you with the best of both worlds',
    category: 'Community Appreciation',
    attribution: 'Anonymous DAHI participant',
    status: 'verified',
  },
  {
    id: 'teenage-girls-menstrual-health-talk',
    quote: "I attended Dr Adiyat's menstrual health talk for girls. It was presented in a very interactive and engaging manner. The examples Dr Adiyat used to help us understand the concept of menstruation were realistic, Informative and at times even funny. Most of all, she was very friendly and I would definitely want to attend again.",
    category: 'Educational Sessions',
    attribution: "Attendee — Teenage Girls' Menstrual Health Talk",
    context: "Teenage Girls' Menstrual Health Talk · 1 June",
    status: 'verified',
  },
];

export const publishableTestimonials = testimonials.filter((testimonial) => testimonial.status === 'verified');

export const homepageTestimonials = publishableTestimonials.filter((testimonial) => testimonial.featuredOnHome);

export function getPublishedTestimonialCategories(entries = testimonials) {
  return [...new Set(
    entries
      .filter((testimonial) => testimonial.status === 'verified' && testimonial.category)
      .map((testimonial) => testimonial.category),
  )];
}
