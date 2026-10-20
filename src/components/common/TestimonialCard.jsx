function TestimonialCard({ testimonial, compact = false }) {
  return (
    <article className={`home-testimonial-card rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7${compact ? ' home-scroll-reveal' : ''}`}>
      <span aria-hidden="true" className="home-testimonial-quote">“</span>
      <blockquote className="mt-3 text-base leading-7 text-slate-600">{testimonial.quote}</blockquote>
      <footer className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-sm font-semibold text-slate-900">{testimonial.attribution}</p>
        {testimonial.context && (
          <p className="mt-1 text-sm text-slate-600">{testimonial.context}</p>
        )}
        <span className="mt-3 inline-flex rounded-full bg-dahiPrimary/10 px-3 py-1 text-xs font-semibold text-dahiPrimary">
          {testimonial.category}
        </span>
      </footer>
    </article>
  );
}

export default TestimonialCard;
