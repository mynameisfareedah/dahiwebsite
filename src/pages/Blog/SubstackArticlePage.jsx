import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import { fetchSubstackPost } from '../../lib/substackFeed';
import { sanitizeArticleHtml } from '../../lib/sanitizeArticleHtml';

function formatPublishedDate(value) {
  if (!value) return 'Recently published';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Recently published'
    : date.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getArticleDescription(post) {
  const text = (post.summary || post.description || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.slice(0, 160) || `Read ${post.title} from Doc Adi Health Initiative.`;
}

function getFallbackOriginalUrl(slug) {
  const match = slug?.match(/^([a-z0-9-]+)-[a-f0-9]{64}$/);
  return match ? `https://womenshealthwithdocadi.substack.com/p/${match[1]}` : null;
}

function ArticleLink({ href }) {
  if (!href) return null;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex text-sm font-semibold text-dahiPrimary underline underline-offset-4">
      View original on Substack
    </a>
  );
}

function SubstackArticlePage() {
  const { slug } = useParams();
  const [request, setRequest] = useState({ slug: null, attempt: 0, article: null, status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;

    fetchSubstackPost(slug)
      .then((post) => {
        if (isMounted) {
          setRequest({
            slug,
            attempt,
            article: post,
            status: post ? (post.fullContent?.trim() ? 'ready' : 'unavailable') : 'not-found',
          });
        }
      })
      .catch((error) => {
        console.error('[SubstackArticlePage] failed to load article', error);
        if (isMounted) {
          setRequest({ slug, attempt, article: null, status: 'error' });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug, attempt]);

  const currentRequest = request.slug === slug && request.attempt === attempt;
  const status = currentRequest ? request.status : 'loading';
  const article = currentRequest ? request.article : null;
  const originalUrl = article?.link || getFallbackOriginalUrl(slug);

  if (status === 'loading') {
    return <section className="section-shell mx-auto max-w-4xl"><div role="status" className="soft-card p-8 text-center text-slate-600">Loading article…</div></section>;
  }

  if (status === 'error') {
    return (
      <section className="section-shell mx-auto max-w-4xl">
        <div className="soft-card p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">We couldn’t load this article</h1>
          <p className="mt-3 text-slate-600">Please check your connection and try again.</p>
          <button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-6 rounded-full bg-dahiPrimary px-5 py-2.5 text-sm font-semibold text-white hover:bg-dahiSecondary">Try again</button>
        </div>
      </section>
    );
  }

  if (status === 'not-found') {
    return (
      <section className="section-shell mx-auto max-w-4xl">
        <div className="soft-card p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Article not found</h1>
          <p className="mt-3 text-slate-600">This article may no longer be available in the Substack feed.</p>
          <div className="mt-4"><ArticleLink href={originalUrl} /></div>
          <Link to="/blog" className="mt-6 inline-flex rounded-full bg-dahiPrimary px-5 py-2.5 text-sm font-semibold text-white hover:bg-dahiSecondary">Back to the blog</Link>
        </div>
      </section>
    );
  }

  const publishedDate = formatPublishedDate(article.pubDate);

  return (
    <>
      <SEO
        title={`${article.title} | DAHI`}
        description={getArticleDescription(article)}
        image={article.image || '/logo.jpeg'}
      />
      <article className="section-shell mx-auto w-full max-w-4xl">
        <Link to="/blog" className="mb-8 inline-flex text-sm font-semibold text-dahiPrimary hover:underline">← Back to Blog</Link>
        <header className="mb-8">
          {article.categories?.[0] ? <div className="text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">{article.categories[0]}</div> : null}
          <h1 className="mt-3 break-words text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">{article.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>{article.author || 'DAHI'}</span>
            <span aria-hidden="true">•</span>
            <time dateTime={article.pubDate || undefined}>{publishedDate}</time>
          </div>
        </header>

        {status === 'unavailable' ? (
          <div role="status" className="soft-card p-6 text-slate-600">
            <p>The complete article text is not available in the current feed, so it is not shown as a full article.</p>
            <div className="mt-4"><ArticleLink href={article.link} /></div>
          </div>
        ) : (
          <>
            <div className="article-content soft-card p-6 sm:p-8 lg:p-10" dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.fullContent) }} />
            <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
              <p className="text-sm text-slate-500">Article by {article.author || 'DAHI'} · Published {publishedDate}</p>
              <ArticleLink href={article.link} />
            </footer>
          </>
        )}
      </article>
    </>
  );
}

export default SubstackArticlePage;
