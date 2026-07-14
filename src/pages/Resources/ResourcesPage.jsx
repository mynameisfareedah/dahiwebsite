import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import PageHero from '../../components/common/PageHero';
import SectionHeading from '../../components/common/SectionHeading';
import ResourceCard from '../../components/common/ResourceCard';
import CTASection from '../../components/common/CTASection';

const categories = ['All', 'Women’s Health', 'Menstrual Health', 'Fertility'];

const categoryCards = [
  { title: 'Women’s Health', description: 'Practical educational resources covering common health concerns.', icon: 'fa-solid fa-venus' },
  { title: 'Menstrual Health', description: 'Guides and materials focused on cycles, hygiene, and care.', icon: 'fa-solid fa-droplet' },
  { title: 'Fertility Awareness', description: 'Supportive resources for understanding fertility and reproductive health.', icon: 'fa-solid fa-seedling' },
];

const ebooks = [
  { title: 'Sunnah Reset – 7 Day Menopause Reset Guide', category: 'Women’s Health', description: 'A faith-conscious guide designed to support women through menopause with clarity and confidence.', image: '/sunnah-reset-a-7-day-meno-selar.com-6a0c3775671cd.png', href: 'https://selar.com/66566z1k7x', price: '₦7,507.94' },
  { title: 'Comprehensive Menstrual Health Guide', category: 'Menstrual Health', description: 'A practical resource covering menstrual health, common questions, and self-care.', image: '/comprehensive-menstrual-h-selar.com-690cc0d476a89.jpg', href: 'https://selar.com/p346083214', price: '₦4,504.77' },
  { title: '8 Weeks to Understanding Your Cycle', category: 'Fertility', description: 'A structured learning resource that helps women understand their cycle in a supportive way.', image: '/8-weeks-to-understanding--selar.com-6903a8099f4b8.jpg', href: 'https://selar.com/d661vie336', price: 'Free' },
];

const howToUseSteps = [
  { title: 'Browse the library', description: 'Explore the categories and find the topic that matches your needs.', icon: 'fa-solid fa-magnifying-glass' },
  { title: 'Select a resource', description: 'Choose a guide that feels relevant and useful.', icon: 'fa-solid fa-check-circle' },
  { title: 'Read or download', description: 'Use the material at your own pace and save it for later reference.', icon: 'fa-solid fa-download' },
  { title: 'Apply and share', description: 'Put what you learn into practice and share it with others who may benefit.', icon: 'fa-solid fa-share-nodes' },
];

function ResourcesPage() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredResources = useMemo(() => {
    return ebooks.filter((resource) => {
      const matchesQuery = `${resource.title} ${resource.description}`.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }, [query, selectedCategory]);

  return (
    <>
      <SEO title="Resources" description="Browse DAHI's resource centre for women’s health education, guides, and downloadable materials." />
      <PageHero
        eyebrow="Resource centre"
        title="Health Resources"
        description="Knowledge is one of the most powerful tools for improving health. Our resource library provides practical, evidence-based educational materials designed to help women better understand their health and make informed decisions throughout every stage of life."
        image="/ebook.svg"
        breadcrumbs={[{ label: 'Resources' }]}
        actions={[
          <a key="browse" href="#resource-library" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">Browse Resources</a>,
          <Link key="contact" to="/contact" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Contact Us</Link>,
        ]}
      />

      <section id="resource-library" className="section-shell mx-auto max-w-7xl space-y-8">
        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Resource library overview" title="Your trusted women's health resource library" description="DAHI develops educational materials that simplify important health topics into practical, easy-to-understand resources for women at every stage of life." />
          <p className="mt-6 text-lg leading-8 text-slate-600">Each resource is designed to complement our webinars, awareness campaigns, and educational programmes, allowing women to continue learning at their own pace. Our library continues to grow as we create new guides, pamphlets, and digital publications to support lifelong learning.</p>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Browse by category" title="Explore resources by topic" description="Use the filters below to quickly locate materials that match your interests or current health questions." />
          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="w-full lg:max-w-md">
              <span className="sr-only">Search resources</span>
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search resources" className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 outline-none focus:border-dahiPrimary" />
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedCategory === category ? 'bg-dahiPrimary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {categoryCards.map((category) => (
              <div key={category.title} className="rounded-[1.25rem] border border-slate-200 p-6 transition hover:border-dahiPrimary/40 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-dahiPrimary/10 text-xl text-dahiPrimary">
                  <i className={category.icon}></i>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{category.title}</h3>
                <p className="mt-3 text-slate-600">{category.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Featured resources" title="Available DAHI eBooks" description="Browse the three trusted DAHI publications currently available in the library." />
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.title} title={resource.title} category={resource.category} description={resource.description} image={resource.image} href={resource.href} price={resource.price} />
            ))}
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="How to use our resources" title="A simple way to make the most of our library" description="Our resources are designed to be practical, accessible, and easy to use in everyday life." />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {howToUseSteps.map((step) => (
              <div key={step.title} className="rounded-[1.25rem] border border-slate-200 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-dahiPrimary/10 text-xl text-dahiPrimary">
                  <i className={step.icon}></i>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Request a resource" title="Can’t find what you’re looking for?" description="If you are searching for a specific women's health topic or educational material that is not currently available in our library, we’d love to hear from you." />
          <p className="mt-6 text-lg leading-8 text-slate-600">Submit a request and we’ll consider it as we continue expanding our educational resources.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/contact" className="inline-flex items-center justify-center rounded-full bg-dahiPrimary px-6 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary">Request a Resource</Link>
            <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-dahiPrimary hover:text-dahiPrimary">Contact Us</Link>
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Continue your learning" title="Continue your health education journey" description="Learning doesn’t end after a webinar or awareness campaign. Explore our growing collection of trusted educational resources and continue building the knowledge and confidence to make informed health decisions." />
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#resource-library" className="inline-flex items-center justify-center rounded-full bg-dahiPrimary px-6 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary">Browse All Resources</a>
            <a href="https://whatsapp.com/channel/0029VbBdF4hLI8YZRabyWF0j" target="_blank" rel="noopener" className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-dahiPrimary hover:text-dahiPrimary">Join Our Community</a>
            <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-dahiPrimary hover:text-dahiPrimary">Contact Us</Link>
          </div>
        </div>

        <CTASection eyebrow="Need support?" title="Reach out for additional resources" description="If you need help finding a specific topic or would like guidance on relevant materials, our team is happy to help." actions={[
          <Link key="contact" to="/contact" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">Contact Us</Link>,
          <a key="community" href="https://whatsapp.com/channel/0029VbBdF4hLI8YZRabyWF0j" target="_blank" rel="noopener" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Join WhatsApp</a>,
        ]} />
      </section>
    </>
  );
}

export default ResourcesPage;
