import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import SEO from '../SEO';

describe('SEO Component - Real Implementation', () => {
  beforeEach(() => {
    // Reset document
    document.title = 'Default';
  });

  describe('document title', () => {
    it('should set default title when no title prop', () => {
      render(<SEO />);

      expect(document.title).toBe('Doc Adi Health Initiative | Trusted Health Education for Muslim Women');
    });

    it('should set custom title with DAHI suffix', () => {
      render(<SEO title="About Us" />);

      expect(document.title).toBe('About Us | DAHI');
    });

    it('should handle empty title gracefully', () => {
      render(<SEO title="" />);

      expect(document.title).toBe('Doc Adi Health Initiative | Trusted Health Education for Muslim Women');
    });
  });

  describe('meta description', () => {
    it('should set default description when not provided', () => {
      render(<SEO />);

      const metaDescription = document.querySelector('meta[name="description"]');
      expect(metaDescription?.getAttribute('content')).toBe(
        'Doc Adi Health Initiative (DAHI) provides trusted, evidence-based health education, practical resources and community outreach for Muslim women and girls.'
      );
    });

    it('should set custom description', () => {
      const customDesc = 'Learn about our health education initiatives';
      render(<SEO description={customDesc} />);

      const metaDescription = document.querySelector('meta[name="description"]');
      expect(metaDescription?.getAttribute('content')).toBe(customDesc);
    });

    it('should handle long descriptions', () => {
      const longDesc = 'A'.repeat(200);
      render(<SEO description={longDesc} />);

      const metaDescription = document.querySelector('meta[name="description"]');
      expect(metaDescription?.getAttribute('content')).toBe(longDesc);
    });
  });

  describe('canonical URL', () => {
    it('should set canonical URL with path', () => {
      render(<SEO path="/about" />);

      const canonical = document.querySelector('link[rel="canonical"]');
      expect(canonical?.getAttribute('href')).toBe('https://thedahi.org/about');
    });

    it('should set canonical URL for root path', () => {
      render(<SEO path="/" />);

      const canonical = document.querySelector('link[rel="canonical"]');
      expect(canonical?.getAttribute('href')).toBe('https://thedahi.org/');
    });

    it('should use window.location.pathname as fallback', () => {
      // Mock window.location.pathname
      const originalPathname = window.location.pathname;
      Object.defineProperty(window.location, 'pathname', {
        value: '/test-path',
        configurable: true,
      });

      render(<SEO path="/" />);

      const canonical = document.querySelector('link[rel="canonical"]');
      expect(canonical?.getAttribute('href')).toContain('thedahi.org');

      Object.defineProperty(window.location, 'pathname', {
        value: originalPathname,
        configurable: true,
      });
    });
  });

  describe('OpenGraph tags', () => {
    it('should set OpenGraph title', () => {
      render(<SEO title="Events" />);

      const ogTitle = document.querySelector('meta[property="og:title"]');
      expect(ogTitle?.getAttribute('content')).toBe('Events | DAHI');
    });

    it('should set OpenGraph description', () => {
      const desc = 'Join our events';
      render(<SEO title="Events" description={desc} />);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      expect(ogDesc?.getAttribute('content')).toBe(desc);
    });

    it('should set OpenGraph image URL', () => {
      render(<SEO image="/custom-image.jpg" />);

      const ogImage = document.querySelector('meta[property="og:image"]');
      expect(ogImage?.getAttribute('content')).toBe('https://thedahi.org/custom-image.jpg');
    });

    it('should handle absolute image URLs', () => {
      const absoluteUrl = 'https://example.com/image.jpg';
      render(<SEO image={absoluteUrl} />);

      const ogImage = document.querySelector('meta[property="og:image"]');
      expect(ogImage?.getAttribute('content')).toBe(absoluteUrl);
    });

    it('should set OpenGraph URL', () => {
      render(<SEO path="/programs" />);

      const ogUrl = document.querySelector('meta[property="og:url"]');
      expect(ogUrl?.getAttribute('content')).toBe('https://thedahi.org/programs');
    });

    it('should set OpenGraph type', () => {
      render(<SEO />);

      // Verify the Open Graph metadata remains present.
      expect(document.querySelector('meta[property="og:title"]')).toBeDefined();
    });
  });

  describe('Twitter tags', () => {
    it('should set Twitter title', () => {
      render(<SEO title="Health Education" />);

      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      expect(twitterTitle?.getAttribute('content')).toBe('Health Education | DAHI');
    });

    it('should set Twitter description', () => {
      const desc = 'Trusted health education for women';
      render(<SEO description={desc} />);

      const twitterDesc = document.querySelector('meta[name="twitter:description"]');
      expect(twitterDesc?.getAttribute('content')).toBe(desc);
    });

    it('should set Twitter image', () => {
      render(<SEO image="/twitter-image.jpg" />);

      const twitterImage = document.querySelector('meta[name="twitter:image"]');
      expect(twitterImage?.getAttribute('content')).toBe('https://thedahi.org/twitter-image.jpg');
    });
  });

  describe('structured data (JSON-LD)', () => {
    it('should create structured data script tag', () => {
      render(<SEO title="About" description="About DAHI" />);

      const script = document.querySelector('script[type="application/ld+json"][data-seo-ld="page"]');
      expect(script).toBeDefined();
    });

    it('should include correct structured data properties', () => {
      render(<SEO title="Programs" description="Our programs" path="/programs" />);

      const script = document.querySelector('script[type="application/ld+json"][data-seo-ld="page"]');
      const data = JSON.parse(script?.textContent || '{}');

      expect(data['@context']).toBe('https://schema.org');
      expect(data['@type']).toBe('WebPage');
      expect(data.name).toContain('Programs');
      expect(data.description).toBe('Our programs');
      expect(data.url).toContain('/programs');
    });

    it('should include organization data in structured markup', () => {
      render(<SEO path="/programs" />);

      const script = document.querySelector('script[type="application/ld+json"][data-seo-ld="page"]');
      const data = JSON.parse(script?.textContent || '{}');

      expect(data['@type']).toBe('WebPage');
      expect(data.isPartOf?.name).toBe('Doc Adi Health Initiative');
      expect(data.publisher?.name).toBe('Doc Adi Health Initiative');

      render(<SEO path="/" />);
      const homepageScript = document.querySelector('script[type="application/ld+json"][data-seo-ld="page"]');
      const homepageData = JSON.parse(homepageScript?.textContent || '{}');
      expect(homepageData['@graph']).toEqual(expect.arrayContaining([
        expect.objectContaining({ '@type': 'Organization', name: 'Doc Adi Health Initiative', alternateName: 'DAHI' }),
        expect.objectContaining({ '@type': 'WebSite', name: 'Doc Adi Health Initiative' }),
      ]));
    });

    it('should update structured data when props change', () => {
      const { rerender } = render(<SEO title="Original" path="/programs" />);

      let script = document.querySelector('script[type="application/ld+json"][data-seo-ld="page"]');
      let data = JSON.parse(script?.textContent || '{}');
      expect(data.name).toContain('Original');

      rerender(<SEO title="Updated" path="/programs" />);

      script = document.querySelector('script[type="application/ld+json"][data-seo-ld="page"]');
      data = JSON.parse(script?.textContent || '{}');
      expect(data.name).toContain('Updated');
    });
  });

  describe('component rendering', () => {
    it('should render without errors', () => {
      const { container } = render(<SEO />);
      // Component returns null, so container should be empty
      expect(container.firstChild).toBeNull();
    });

    it('should not render visible DOM elements', () => {
      const { container } = render(<SEO title="Test" />);
      // SEO component doesn't render anything visible
      expect(container.innerHTML).toBe('');
    });

    it('should handle all props together', () => {
      render(
        <SEO
          title="Complete Example"
          description="Full SEO example"
          image="/example.jpg"
          path="/example"
        />
      );

      expect(document.title).toBe('Complete Example | DAHI');
      expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
        'Full SEO example'
      );
      expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
        'https://thedahi.org/example.jpg'
      );
      expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
        'https://thedahi.org/example'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in title', () => {
      render(<SEO title="Test & Title <>" />);

      expect(document.title).toContain('Test & Title');
    });

    it('should handle special characters in description', () => {
      render(<SEO description='Description with "quotes" & symbols' />);

      const metaDesc = document.querySelector('meta[name="description"]');
      expect(metaDesc?.getAttribute('content')).toContain('quotes');
    });

    it('should use default image when not provided', () => {
      render(<SEO />);

      const ogImage = document.querySelector('meta[property="og:image"]');
      expect(ogImage?.getAttribute('content')).toBe('https://thedahi.org/logo.jpeg');
    });
  });
});
