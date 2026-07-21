import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import PageHero from '../../components/common/PageHero';
import SectionHeading from '../../components/common/SectionHeading';
import BlogCard from '../../components/common/BlogCard';
import CTASection from '../../components/common/CTASection';

const substackFeedProxyUrl = '/.netlify/functions/fetchSubstackFeed';

function decodeEntities(value) {
  return value
    ? value
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/&#x60;/g, '`')
        .replace(/&#x3D;/g, '=')
        .trim()
    : '';
}

function stripHtml(value) {
  return decodeEntities(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPosts() {
      try {
        const response = await fetch(substackFeedProxyUrl);
        if (!response.ok) {
          throw new Error('Unable to load Substack feed');
        }

        const data = await response.json();

        if (!isMounted) {
          return;
        }

        if (Array.isArray(data.posts)) {
          const normalizedPosts = data.posts
            .filter((post) => post.title && post.link)
            .map((item) => ({
              title: item.title,
              excerpt: stripHtml(item.description || item.content || '' ) || 'Read the full article on Substack for more details.',
              category: item.categories?.[0] || 'Featured',
              author: item.author || 'DAHI',
              date: item.pubDate ? new Date(item.pubDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently published',
              image: item.image || '/community-768.jpg',
              href: item.link,
            }))
            .slice(0, 5);

          setPosts(normalizedPosts);
          const uniqueTopics = Array.from(new Set(normalizedPosts.map((post) => post.category).filter(Boolean))).slice(0, 6);
          setTopics(uniqueTopics);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredArticle = posts[0] || null;
  const latestArticles = posts.slice(1);

  return (
    <>
      <SEO title="Blog" description="Read DAHI's latest articles, reflections, and educational insights for women’s health and community support." />
      <PageHero
        eyebrow="Blog"
        title="Stories, reflections, and educational insights"
        description="Our blog shares practical articles, community reflections, and helpful perspectives that support women’s health learning in everyday life."
        image="/community-1200.jpg"
        breadcrumbs={[{ label: 'Blog' }]}
        actions={[
          <a key="subscribe" href="https://womenshealthwithdocadi.substack.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">Read on Substack</a>,
          <a key="community" href="https://whatsapp.com/channel/0029VbBdF4hLI8YZRabyWF0j" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Join WhatsApp</a>,
        ]}
      />

      <section className="section-shell max-w-7xl space-y-8">
        {loading ? (
          <div className="soft-card p-8 text-center text-slate-600">Loading the latest articles from the DAHI Substack publication…</div>
        ) : null}

        {!loading && featuredArticle ? (
          <div className="soft-card overflow-hidden">
            <div className="p-8 sm:p-10">
              <SectionHeading eyebrow="Featured article" title={featuredArticle.title} description={featuredArticle.excerpt} />
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span>{featuredArticle.author}</span>
                <span>•</span>
                <span>{featuredArticle.date}</span>
              </div>
              <a href={featuredArticle.href} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex rounded-full bg-dahiPrimary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-dahiSecondary">Read More on Substack</a>
            </div>
          </div>
        ) : null}

        {!loading && error ? (
          <div className="soft-card p-8 text-center text-slate-600">
            The latest posts are temporarily unavailable, but DAHI’s Substack publication is always the most up-to-date source. Visit the publication directly for new stories and updates.
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <SectionHeading eyebrow="Recent articles" title="Fresh perspectives and practical ideas" description="The latest five posts from DAHI’s Substack publication are shown here for quick reading." />
            {!loading && latestArticles.length > 0 ? (
              <div className="grid gap-6">
                {latestArticles.map((article) => (
                  <BlogCard key={article.href} title={article.title} excerpt={article.excerpt} category={article.category} author={article.author} date={article.date} image={article.image} href={article.href} />
                ))}
              </div>
            ) : null}
            {!loading && !error && latestArticles.length === 0 ? (
              <div className="rounded-[1.25rem] border border-slate-200 p-6 text-slate-600">New posts will appear here as soon as they are published on the Substack feed.</div>
            ) : null}
          </div>
          <aside className="soft-card p-8">
            <SectionHeading eyebrow="Popular topics" title="Browse by theme" description="Explore the main topics our readers engage with most often." />
            <div className="mt-6 flex flex-wrap gap-2">
              {topics.length > 0 ? topics.map((topic) => (
                <span key={topic} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{topic}</span>
              )) : (
                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Health Education</span>
              )}
            </div>
            <div className="mt-8 rounded-[1.25rem] border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900">Stay connected</h3>
              <p className="mt-3 text-slate-600">Receive updates when new articles are published and be the first to hear about upcoming programs and events.</p>
              <a href="https://womenshealthwithdocadi.substack.com" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex text-sm font-semibold text-dahiPrimary">Explore the publication →</a>
            </div>
          </aside>
        </div>

        <CTASection eyebrow="Stay informed" title="Join DAHI for more stories and updates" description="Subscribe for new articles, event announcements, and community moments that support women’s health education." actions={[
          <Link key="contact" to="/contact" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">Contact Us</Link>,
          <a key="community" href="https://forms.gle/joTjf3VYW9anCA9MA" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Register</a>,
        ]} />
      </section>
    </>
  );
}

export default BlogPage;
