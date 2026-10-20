import { useState } from 'react';
import SEO from '../../components/common/SEO';
import TestimonialCard from '../../components/common/TestimonialCard';
import { getPublishedTestimonialCategories, publishableTestimonials } from '../../data/testimonials';

const filters = ['All DAHI Voices', ...getPublishedTestimonialCategories()];

function TestimonialsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All DAHI Voices');
  const filteredTestimonials = selectedCategory === 'All DAHI Voices'
    ? publishableTestimonials
    : publishableTestimonials.filter((testimonial) => testimonial.category === selectedCategory);

  return (
    <>
      <SEO
        title="DAHI Voices | Doc Adi Health Initiative"
        description="Hear directly from members of the DAHI community as they share their experiences with our educational programmes, online quizzes, and health resources."
        path="/voices"
      />
      <section className="section-shell mx-auto max-w-7xl">
        <header className="mb-10 max-w-3xl">
          <span className="eyebrow">DAHI Voices</span>
          <h1 className="mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
            DAHI Voices
          </h1>
          <h2 className="mt-4 text-xl font-bold text-slate-800 sm:text-2xl">
            Real Experiences. Meaningful Reflections.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Hear directly from members of the DAHI community as they share their experiences with our educational programmes, online quizzes, and health resources.
          </p>
        </header>

        <div className="mb-8">
          <div role="group" aria-label="Filter DAHI Voices" className="flex flex-wrap gap-2">
            {filters.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dahiPrimary ${
                  selectedCategory === category
                    ? 'bg-dahiPrimary text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {filteredTestimonials.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        ) : (
          <div role="status" className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="font-semibold text-slate-900">No verified DAHI Voices are available in this category yet.</p>
          </div>
        )}
      </section>
    </>
  );
}

export default TestimonialsPage;
