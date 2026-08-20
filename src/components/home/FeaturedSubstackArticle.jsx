import { useEffect, useState } from 'react';
import SectionHeading from '../common/SectionHeading';
import { fetchSubstackPosts } from '../../lib/substackFeed';

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
        .replace(/&#8216;/g, "'")
        .replace(/&#8217;/g, "'")
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/&#8211;/g, '-')
        .replace(/&#8212;/g, '—')
        .replace(/&#8230;/g, '...')
        .trim()
    : '';
}

function stripHtml(value) {
  return decodeEntities(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function FeaturedSubstackArticle() {
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadFeatured() {
      try {
        const posts = await fetchSubstackPosts();
        if (!isMounted) return;
        if (Array.isArray(posts) && posts.length > 0) {
          const item = posts[0];
          setFeatured({
            title: item.title,
            excerpt: item.summary || item.description || item.content || '',
            author: item.author || 'DAHI',
            date: item.pubDate ? new Date(item.pubDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently published',
            image: item.image || '/community-1200.jpg',
            href: item.link,
          });
        }
      } catch (err) {
        console.error('[FeaturedSubstackArticle] failed to load', err);
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return null;
  }

  if (error || !featured) {
    return null;
  }

  return (
    <section className="section-shell max-w-7xl">
      <div className="soft-card overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_0.75fr] items-stretch">
          <div className="p-8">
            <SectionHeading eyebrow="Featured from DAHI" title={featured.title} description="" />
            <p className="mt-4 line-clamp-3 text-base leading-7 text-slate-600">{stripHtml(featured.excerpt).slice(0, 300)}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={featured.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full bg-dahiPrimary px-6 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary"
              >
                Read Article
              </a>
              <a
                href="/blog"
                className="inline-flex rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                See All Blog Posts
              </a>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span>{featured.author}</span>
              <span>•</span>
              <span>{featured.date}</span>
            </div>
          </div>
          <div className="h-full overflow-hidden">
            <img
              src={featured.image}
              alt={featured.title}
              className="h-full w-full object-cover scale-95"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturedSubstackArticle;
