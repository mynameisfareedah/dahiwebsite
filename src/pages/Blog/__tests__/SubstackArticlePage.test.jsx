import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BlogPage from '../BlogPage';
import SubstackArticlePage from '../SubstackArticlePage';
import FeaturedSubstackArticle from '../../../components/home/FeaturedSubstackArticle';
import { fetchSubstackPost, fetchSubstackPosts } from '../../../lib/substackFeed';

vi.mock('../../../lib/substackFeed', () => ({
  fetchSubstackPost: vi.fn(),
  fetchSubstackPosts: vi.fn(),
}));

const article = {
  title: 'A Complete DAHI Article',
  author: 'Doc Adi',
  pubDate: '2026-09-12T00:00:00.000Z',
  summary: 'An article summary for search metadata.',
  fullContent: '<h2>Heading in the article</h2><p>The complete article body.</p><ul><li>A listed point</li></ul><img src="https://substackcdn.com/image.jpg" alt="Article illustration"><a href="https://womenshealthwithdocadi.substack.com/p/full-article">A source link</a>',
  categories: ['Health'],
  image: 'https://substackcdn.com/image.jpg',
  link: 'https://womenshealthwithdocadi.substack.com/p/full-article',
};

function renderArticlePage(path = '/blog/full-article-slug') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/blog/:slug" element={<SubstackArticlePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('Substack article reading', () => {
  it('renders the full article with metadata, images, and the original source link', async () => {
    fetchSubstackPost.mockResolvedValue(article);
    renderArticlePage();

    expect(screen.getByRole('status')).toHaveTextContent('Loading article');
    expect(await screen.findByRole('heading', { name: 'A Complete DAHI Article' })).toBeInTheDocument();
    expect(screen.getByText('Heading in the article')).toBeInTheDocument();
    expect(screen.getByText('The complete article body.')).toBeInTheDocument();
    expect(screen.getByText('A listed point')).toBeInTheDocument();
    expect(screen.getByText('Doc Adi')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Article illustration' })).toHaveAttribute('loading', 'lazy');
    expect(screen.getByRole('link', { name: 'View original on Substack' })).toHaveAttribute('href', article.link);
  });

  it('shows loading, not-found, incomplete, and recoverable error states', async () => {
    fetchSubstackPost.mockResolvedValueOnce(null);
    renderArticlePage();
    expect(await screen.findByRole('heading', { name: 'Article not found' })).toBeInTheDocument();

    fetchSubstackPost.mockResolvedValueOnce({ ...article, fullContent: '' });
    renderArticlePage();
    expect(await screen.findByText(/complete article text is not available/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View original on Substack' })).toHaveAttribute('href', article.link);

    fetchSubstackPost.mockRejectedValueOnce(new Error('Feed unavailable'));
    renderArticlePage();
    expect(await screen.findByRole('heading', { name: 'We couldn’t load this article' })).toBeInTheDocument();
  });

  it('routes a Substack blog card to its internal article page', async () => {
    fetchSubstackPosts.mockResolvedValue([{ ...article, slug: 'full-article-stable-id' }]);
    render(
      <MemoryRouter initialEntries={['/blog']}>
        <Routes>
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<h1>Internal article route</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      const links = screen.getAllByRole('link', { name: 'Read More' });
      expect(links.some((link) => link.getAttribute('href') === '/blog/full-article-stable-id')).toBe(true);
    });
    const readMoreLinks = screen.getAllByRole('link', { name: 'Read More' });
    const readMore = readMoreLinks.find((link) => link.getAttribute('href') === '/blog/full-article-stable-id');
    expect(readMore).toHaveAttribute('href', '/blog/full-article-stable-id');
    fireEvent.click(readMore);
    expect(await screen.findByRole('heading', { name: 'Internal article route' })).toBeInTheDocument();
  });

  it('routes the homepage featured article to its internal page', async () => {
    fetchSubstackPosts.mockResolvedValue([{ ...article, slug: 'featured-article-stable-id' }]);
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<FeaturedSubstackArticle />} />
          <Route path="/blog/:slug" element={<h1>Internal featured article</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    const readArticle = await screen.findByRole('link', { name: 'Read Article' });
    expect(readArticle).toHaveAttribute('href', '/blog/featured-article-stable-id');
    fireEvent.click(readArticle);
    expect(await screen.findByRole('heading', { name: 'Internal featured article' })).toBeInTheDocument();
  });

  it('provides article-specific title and description metadata', async () => {
    fetchSubstackPost.mockResolvedValue(article);
    renderArticlePage();

    await waitFor(() => expect(document.title).toBe('A Complete DAHI Article | DAHI'));
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', article.summary);
  });

  it('offers the original publication path when the post has left the RSS feed', async () => {
    fetchSubstackPost.mockResolvedValue(null);
    renderArticlePage('/blog/a-retired-post-0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');

    expect(await screen.findByRole('heading', { name: 'Article not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View original on Substack' })).toHaveAttribute(
      'href',
      'https://womenshealthwithdocadi.substack.com/p/a-retired-post',
    );
  });
});
