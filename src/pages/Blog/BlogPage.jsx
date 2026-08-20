import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import PageHero from '../../components/common/PageHero';
import SectionHeading from '../../components/common/SectionHeading';
import BlogCard from '../../components/common/BlogCard';
import CTASection from '../../components/common/CTASection';
import { fetchSubstackPosts } from '../../lib/substackFeed';

const firstOutreachArticle = {
  title: 'Doc Adi Health Initiative Successfully Hosts First Community Health Outreach in Gwagwalada',
  excerpt: 'On August 15, 2026, DAHI held its first community health outreach in Gwagwalada, Abuja, focused on women’s health awareness, screening, early detection, and preventive healthcare.',
  category: 'Community Outreach',
  author: 'DAHI',
  date: 'Aug 15, 2026',
  image: '/OUTREACH/Community Audience & Participants.jfif',
  href: '/blog/first-community-outreach',
  publishedAt: '2026-08-15T00:00:00.000Z',
};

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

// legacy XML-to-DOM parser removed: feed parsing is handled server-side by
// the Netlify function `/.netlify/functions/fetch-substack-feed` which returns
// a JSON `{ posts: [...] }` payload. Keeping decode/strip helpers only.

function normalizeTitle(title) {
  return title.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
}

function BlogPage() {
  const [posts, setPosts] = useState([firstOutreachArticle]);
  const [loading, setLoading] = useState(true);
  const [feedStatus, setFeedStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

    async function loadPosts() {
      try {
        const postItems = await fetchSubstackPosts();

        if (!isMounted) {
          return;
        }

        const normalizedPosts = postItems
          .filter((post) => post.title && post.link)
          .map((item) => ({
            title: item.title,
            excerpt: stripHtml(item.summary || item.description || item.content || '' ) || 'Read the full article on Substack for more details.',
            category: item.categories?.[0] || 'Featured',
            author: item.author || 'DAHI',
            date: item.pubDate ? new Date(item.pubDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently published',
            image: item.image || '/community-768.jpg',
            href: item.link,
            publishedAt: item.pubDate || '',
          }));

        const seenTitles = new Set([normalizeTitle(firstOutreachArticle.title)]);
        const combinedPosts = [firstOutreachArticle, ...normalizedPosts].filter((post) => {
          const title = normalizeTitle(post.title);
          if (seenTitles.has(title)) {
            return post === firstOutreachArticle;
          }
          seenTitles.add(title);
          return true;
        });

        const publishedPosts = combinedPosts
          .sort((a, b) => Date.parse(b.publishedAt || '') - Date.parse(a.publishedAt || ''))
          .slice(0, 10);

        setPosts(publishedPosts);
        setFeedStatus(postItems.length > 0 ? 'ready' : 'empty');
      } catch {
        if (isMounted) {
          setPosts([firstOutreachArticle]);
          setFeedStatus('error');
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

  const latestArticles = posts;

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


        {!loading && feedStatus !== 'ready' ? (
          <div className="soft-card p-8 text-center text-slate-600">
            {feedStatus === 'empty'
              ? 'The Substack feed is currently empty. The local DAHI outreach article remains available below.'
              : 'The latest Substack posts could not be loaded right now. The local DAHI outreach article remains available below.'}
          </div>
        ) : null}

        <div className="space-y-8">
          <div className="space-y-6">
            <SectionHeading eyebrow="Recent articles" title="Fresh perspectives and practical ideas" description="The latest ten posts from DAHI’s Substack publication are shown here for quick reading." />
            <div className="soft-card p-8">
              <div className="rounded-[1.25rem] border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900">Stay connected</h3>
                <p className="mt-3 text-slate-600">Receive updates when new articles are published and be the first to hear about upcoming programs and events.</p>
                <a href="https://womenshealthwithdocadi.substack.com" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex text-sm font-semibold text-dahiPrimary">Explore the publication →</a>
              </div>
            </div>
            {latestArticles.length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-2">
                {latestArticles.map((article) => (
                  <BlogCard key={article.href} title={article.title} excerpt={article.excerpt} category={article.category} author={article.author} date={article.date} image={article.image} href={article.href} />
                ))}
              </div>
            ) : null}
            {!loading && latestArticles.length === 0 ? (
              <div className="rounded-[1.25rem] border border-slate-200 p-6 text-slate-600">New posts will appear here as soon as they are published on the Substack feed.</div>
            ) : null}
          </div>
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
