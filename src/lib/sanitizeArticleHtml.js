import DOMPurify from 'dompurify';

const ARTICLE_TAGS = [
  'a', 'b', 'blockquote', 'br', 'caption', 'code', 'del', 'div', 'em', 'figcaption',
  'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'li', 'ol', 'p',
  'pre', 's', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th',
  'thead', 'tr', 'u', 'ul',
];
const ARTICLE_ATTRIBUTES = [
  'alt', 'colspan', 'height', 'href', 'rowspan', 'scope', 'src', 'start', 'title', 'width',
];
const SAFE_URI_PATTERN = /^(?:(?:https?):|mailto:|tel:|\/(?!\/)|#|\?)/i;

export function sanitizeArticleHtml(html) {
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ARTICLE_TAGS,
    ALLOWED_ATTR: ARTICLE_ATTRIBUTES,
    ALLOWED_URI_REGEXP: SAFE_URI_PATTERN,
    ALLOW_ARIA_ATTR: false,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['audio', 'button', 'embed', 'form', 'iframe', 'input', 'math', 'object', 'script', 'style', 'svg', 'video'],
  });
  const template = document.createElement('template');
  template.innerHTML = sanitizedHtml;

  template.content.querySelectorAll('a[href]').forEach((anchor) => {
    let url;
    try {
      url = new URL(anchor.getAttribute('href'), window.location.origin);
    } catch {
      anchor.removeAttribute('href');
      return;
    }

    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) {
      anchor.removeAttribute('href');
      return;
    }

    if (url.protocol === 'http:' || url.protocol === 'https:') {
      if (url.origin !== window.location.origin) {
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('rel', 'noopener noreferrer');
      }
    }
  });

  template.content.querySelectorAll('img').forEach((image) => {
    const src = image.getAttribute('src');
    if (!src) {
      image.remove();
      return;
    }

    try {
      const url = new URL(src, window.location.origin);
      if (!['http:', 'https:'].includes(url.protocol)) {
        image.remove();
        return;
      }
    } catch {
      image.remove();
      return;
    }

    image.setAttribute('loading', 'lazy');
    image.setAttribute('decoding', 'async');
  });

  return template.innerHTML;
}
