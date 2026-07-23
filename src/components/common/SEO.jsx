import { useEffect } from 'react';

function SEO({ title, description, image = '/logo.jpeg', path = '/' }) {
  useEffect(() => {
    const origin = 'https://thedahi.org';
    const resolvedPath = path === '/' ? (window.location.pathname || '/') : path;
    const absoluteImage = image.startsWith('http') ? image : `${origin}${image}`;

    const siteTitle = 'DAHI — Empowering Muslim Women Through Trusted Health Education';
    const siteLocale = 'en_US';
    const siteType = 'website';
    const fullTitle = title ? `${title} | DAHI` : siteTitle;
    document.title = fullTitle;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', description || siteTitle);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', `${origin}${resolvedPath}`);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', fullTitle);

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', description || siteTitle);

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', absoluteImage);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', `${origin}${resolvedPath}`);

    const ogType = document.querySelector('meta[property="og:type"]');
    if (ogType) ogType.setAttribute('content', siteType);

    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute('content', siteLocale);

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', fullTitle);

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute('content', description || siteTitle);

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) twitterImage.setAttribute('content', absoluteImage);

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: fullTitle,
      description: description || siteTitle,
      url: `${origin}${resolvedPath}`,
      image: absoluteImage,
      inLanguage: 'en-US',
      isPartOf: {
        '@type': 'WebSite',
        name: 'Doc Adi Health Initiative',
        url: origin,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Doc Adi Health Initiative',
        url: origin,
        logo: {
          '@type': 'ImageObject',
          url: `${origin}/logo.jpeg`,
        },
      },
    };

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
