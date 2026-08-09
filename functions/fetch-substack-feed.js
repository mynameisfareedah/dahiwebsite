const FEED_URL = process.env.SUBSTACK_FEED_URL || 'https://womenshealthwithdocadi.substack.com/feed';

import { XMLParser } from 'fast-xml-parser';

function stripHtml(value = '') {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '—')
    .replace(/&#8230;/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstString(node) {
  if (node == null) return '';
  if (typeof node === 'string') return node.trim();
  if (typeof node === 'number' || typeof node === 'boolean') return String(node);
  // fast-xml-parser represents CDATA in a property like '#cdata' or 'content:encoded' value
  if (typeof node === 'object') {
    if (node.hasOwnProperty('#cdata')) return String(node['#cdata']).trim();
    if (node.hasOwnProperty(':cdata')) return String(node[':cdata']).trim();
    if (node.hasOwnProperty('#text')) return String(node['#text']).trim();
    // if value is nested object with text
    const keys = Object.keys(node);
    for (const k of keys) {
      if (typeof node[k] === 'string') return node[k].trim();
    }
  }
  return '';
}

function findImageFromContent(html) {
  if (!html) return '';
  const m = /<img[^>]*src=["']([^"']+)["']/i.exec(html);
  return m ? m[1] : '';
}

function extractTextWithParagraphs(html, paragraphCount = 11) {
  if (!html) return '';
  const paragraphs = [];
  const paragraphRegex = /<p\b[^>]*>(.*?)<\/p>/gi;
  let match;

  while (paragraphs.length < paragraphCount && (match = paragraphRegex.exec(html))) {
    const paragraphText = stripHtml(match[1]);
    if (paragraphText) {
      paragraphs.push(paragraphText);
    }
  }

  if (paragraphs.length > 0) {
    return paragraphs.join('\n\n');
  }

  const cleanText = stripHtml(html.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<\/(?:div|section|article|li|h[1-6])>/gi, '\n\n'));
  return cleanText;
}

export const handler = async (event, context) => {
  // Handle CORS preflight
  const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event && event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({}),
    };
  }

  const feedUrl = FEED_URL;
  try {
    const upstreamResponse = await fetch(feedUrl, { redirect: 'follow' });

    console.log('[Substack] URL:', feedUrl);
    console.log('[Substack] Status:', upstreamResponse.status);
    console.log('[Substack] Content-Type:', upstreamResponse.headers.get('content-type'));

    const xml = await upstreamResponse.text();
    console.log('[Substack] Response length:', xml.length);
    // small preview
    console.log('[Substack] Response preview:', xml.slice(0, 1000));

    if (!upstreamResponse.ok) {
      console.error('[Substack] upstream fetch failed', { status: upstreamResponse.status });
      return {
        statusCode: upstreamResponse.status,
        headers: CORS_HEADERS,
        body: JSON.stringify({ posts: [] }),
      };
    }

    const contentType = upstreamResponse.headers.get('content-type') || '';
    const looksLikeHtml = xml && (xml.trim().toLowerCase().startsWith('<!doctype html') || xml.trim().toLowerCase().startsWith('<html') || contentType.includes('text/html'));
    if (looksLikeHtml) {
      console.error('[Substack] Upstream returned HTML instead of RSS/XML');
      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({ posts: [] }),
      };
    }

    // parse XML using fast-xml-parser
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      cdataPropName: '#cdata',
      ignoreNameSpace: false,
      trimValues: false,
    });

    let parsed;
    try {
      parsed = parser.parse(xml);
    } catch (err) {
      console.error('[Substack] XML parse error', err);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ posts: [] }),
      };
    }

    // locate items: RSS => rss.channel.item, Atom => feed.entry
    let items = [];
    if (parsed?.rss?.channel) {
      const ch = parsed.rss.channel;
      // channel.item may be array or single
      items = Array.isArray(ch.item) ? ch.item : ch.item ? [ch.item] : [];
    } else if (parsed?.feed?.entry) {
      items = Array.isArray(parsed.feed.entry) ? parsed.feed.entry : [parsed.feed.entry];
    } else if (parsed?.channel?.item) {
      items = Array.isArray(parsed.channel.item) ? parsed.channel.item : [parsed.channel.item];
    }

    console.log('[Substack] Parsed item count:', items.length);

    const posts = [];
    for (const item of items) {
      // extract fields with fallbacks
      const title = firstString(item.title) || firstString(item['title']);
      // link: RSS uses <link>text</link>, Atom uses <link href="..." rel="alternate" />
      let link = '';
      if (item.link) {
        if (typeof item.link === 'string') link = item.link.trim();
        else if (Array.isArray(item.link)) {
          // pick first link that has @_href or text
          for (const l of item.link) {
            if (typeof l === 'string') { link = l; break; }
            if (l['@_href']) { link = l['@_href']; break; }
            if (l['@_rel'] && l['@_rel'] === 'alternate' && l['@_href']) { link = l['@_href']; break; }
          }
        } else if (typeof item.link === 'object') {
          link = item.link['@_href'] || firstString(item.link) || '';
        }
      }
      // guid fallback
      if (!link && item.guid) {
        const g = firstString(item.guid);
        if (g && /^https?:\/\//i.test(g)) link = g;
      }

      const pubDate = firstString(item.pubDate) || firstString(item.pubdate) || firstString(item.updated) || firstString(item.published) || '';

      const descriptionRaw = firstString(item.description) || '';
      const contentRaw = firstString(item['content:encoded']) || firstString(item.content) || firstString(item.summary) || '';

      const description = descriptionRaw || contentRaw || '';
      const content = contentRaw || descriptionRaw || '';
      const summary = extractTextWithParagraphs(content || description, 11);

      // author
      let author = firstString(item['dc:creator']) || firstString(item.creator) || firstString(item.author) || '';
      if (!author && item.author && typeof item.author === 'object') {
        author = firstString(item.author.name) || firstString(item.author['#text']) || '';
      }

      // categories
      let categories = [];
      if (item.category) {
        if (Array.isArray(item.category)) categories = item.category.map((c) => firstString(c)).filter(Boolean);
        else categories = [firstString(item.category)].filter(Boolean);
      }

      // image: enclosure/@_url or media:content/@_url or image in content
      let image = '';
      if (item.enclosure && (item.enclosure['@_url'] || item.enclosure.url)) {
        image = item.enclosure['@_url'] || item.enclosure.url || '';
      }
      if (!image && item['media:content'] && (item['media:content']['@_url'] || item['media:content'].url)) {
        const m = item['media:content'];
        image = m['@_url'] || m.url || '';
      }
      if (!image) {
        image = findImageFromContent(content) || findImageFromContent(description) || '';
      }

      const post = {
        title: stripHtml(title) || '',
        link: link || '',
        pubDate: pubDate || '',
        description: description || '',
        content: content || '',
        summary: summary || '',
        author: author || '',
        image: image || '',
        categories: categories || [],
      };

      // only require title and link
      if (!post.title) {
        console.error('[Substack] Item rejected: missing title');
        continue;
      }
      if (!post.link) {
        // allow guid fallback already applied; if still missing, reject
        console.error('[Substack] Item rejected: missing link');
        continue;
      }

      posts.push(post);
    }

    console.log('[Substack] Parsed posts count:', posts.length);
    if (posts.length > 0) {
      const first = posts[0];
      console.log('[Substack] First post title:', first.title);
      console.log('[Substack] First post link:', first.link);
      console.log('[Substack] First post pubDate:', first.pubDate);
      console.log('[Substack] First post image:', first.image || '');
    }

    // sort newest-first
    posts.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime() || 0;
      const dateB = new Date(b.pubDate).getTime() || 0;
      return dateB - dateA;
    });

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ posts }),
    };
  } catch (err) {
    console.error('[Substack] Unexpected error fetching/parsing feed', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ posts: [] }),
    };
  }
};
