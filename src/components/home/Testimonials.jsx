import { Link } from 'react-router-dom';
import TestimonialCard from '../common/TestimonialCard';
import { homepageTestimonials } from '../../data/testimonials';

function Testimonials() {
  return (
    <section className="section-shell home-section-band home-section-band--teal max-w-7xl">
      <div className="mb-8 max-w-3xl">
        <span className="eyebrow">DAHI Voices</span>
        <h2 className="mt-4 section-title">What Our Community Says</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {homepageTestimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} compact />
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link
          to="/voices"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-dahiPrimary px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:bg-dahiPrimary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dahiPrimary"
        >
          Explore DAHI Voices
        </Link>
      </div>
    </section>
  );
}

export default Testimonials;
