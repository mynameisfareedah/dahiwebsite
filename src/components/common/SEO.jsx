import { useEffect } from 'react';

function SEO({ title, description, image = '/logo.jpeg', path = '/' }) {
  useEffect(() => {
    const origin = 'https://thedahi.org';
    const resolvedPath = path === '/' ? (window.location.pathname || '/') : path;
    const normalizedPath = resolvedPath === '/' ? '/' : `/${resolvedPath.replace(/^\/+|\/+$/g, '')}`;
    const canonicalUrl = `${origin}${normalizedPath}`;
    const absoluteImage = image.startsWith('http') ? image : `${origin}${image}`;

    const siteTitle = 'Doc Adi Health Initiative | Trusted Health Education for Muslim Women';
    const siteDescription = 'Doc Adi Health Initiative (DAHI) provides trusted, evidence-based health education, practical resources and community outreach for Muslim women and girls.';
    const siteLocale = 'en_US';
    const fullTitle = title ? (title.includes('|') ? title : `${title} | DAHI`) : siteTitle;
    document.title = fullTitle;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', description || siteDescription);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', canonicalUrl);

    const robots = document.querySelector('meta[name="robots"]');
    if (robots) robots.setAttribute('content', 'index, follow');

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', fullTitle);

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', description || siteDescription);

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', absoluteImage);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);

    const ogType = document.querySelector('meta[property="og:type"]');
    if (ogType) ogType.setAttribute('content', 'website');

    const ogSiteName = document.querySelector('meta[property="og:site_name"]');
    if (ogSiteName) ogSiteName.setAttribute('content', 'Doc Adi Health Initiative');

    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute('content', siteLocale);

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', fullTitle);

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute('content', description || siteDescription);

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) twitterImage.setAttribute('content', absoluteImage);

    const page = {
      '@type': 'WebPage',
      name: fullTitle,
      description: description || siteDescription,
      url: canonicalUrl,
      image: absoluteImage,
      inLanguage: 'en-US',
      about: { '@id': `${origin}/#organization` },
      isPartOf: { '@id': `${origin}/#website` },
      publisher: { '@id': `${origin}/#organization` },
    };
    if (normalizedPath === '/blog/first-community-outreach') {
      page.author = { '@id': `${origin}/#doc-adi` };
    }
    const structuredData = { '@context': 'https://schema.org', '@graph': [page] };

    let scriptTag = document.querySelector('script[data-seo-ld="page"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      scriptTag.setAttribute('data-seo-ld', 'page');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData);
  }, [description, image, path, title]);

  return null;
}

export default SEO;
