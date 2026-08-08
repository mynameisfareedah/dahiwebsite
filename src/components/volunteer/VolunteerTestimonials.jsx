function VolunteerTestimonials() {
  const testimonials = [
    {
      name: 'OYEBAMIJI HAJAR',
      role: 'MEDICAL WRITER',
      text: 'Volunteering with DAHI has been an incredible experience. I\'ve learned so much about women\'s health and had the opportunity to create content that truly makes a difference in our community.',
      image: '/testimonial-1.jpg',
    },
    {
      name: 'FAADHILAH HUSSAIN',
      role: 'PROGRAMS COORDINATOR',
      text: 'The team at DAHI is so welcoming and supportive. I love organizing events and seeing how our work empowers women to take control of their health.',
      image: '/testimonial-2.jpg',
    },
    {
      name: 'MUHAMMAD HARUN',
      role: 'COMMUNITY VISIBILITY',
      text: 'As a volunteer, I\'ve discovered my passion for health education. Working alongside the DAHI team has given me purpose and meaningful connections with amazing women.',
      image: '/testimonial-3.jpg',
    },
  ];

  return (
    <section className="section-shell max-w-7xl space-y-8">
      <div className="mx-auto max-w-3xl text-center">
        <span className="eyebrow">Volunteer stories</span>
        <h2 className="mt-4 section-title">What Our Volunteers Say</h2>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Hear from volunteers who are making a real impact with DAHI.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <div key={testimonial.name} className="soft-card p-8 sm:p-10">
            <div className="flex items-center gap-1 text-dahiAccent">
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
            </div>

            <blockquote className="mt-4 text-slate-700">"{testimonial.text}"</blockquote>

            <div className="mt-6 flex items-center gap-4">
              {testimonial.image && (
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  loading="lazy"
                  className="h-12 w-12 rounded-full object-cover"
                />
              )}
              <div>
                <div className="font-semibold text-slate-900">{testimonial.name}</div>
                <div className="text-sm text-slate-600">{testimonial.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default VolunteerTestimonials;
