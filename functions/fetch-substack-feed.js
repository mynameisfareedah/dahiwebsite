const FEED_URL = 'https://womenshealthwithdocadi.substack.com/feed';

function extractTagText(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, 'gi');
  const match = regex.exec(xml);
  return match ? match[1].trim() : '';
}

function extractAllTagText(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, 'gi');
  const matches = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
}

function extractAttribute(xml, tag, attribute) {
  const regex = new RegExp(`<${tag}[^>]*${attribute}=['\"]([^'\"]+)['\"][^>]*>`, 'i');
  const match = regex.exec(xml);
  return match ? match[1] : '';
}

function stripHtml(value) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function parseItems(xml) {
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  const items = [];
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[0];
    const title = extractTagText(itemXml, 'title');
    const description = extractTagText(itemXml, 'description');
    const link = extractTagText(itemXml, 'link');
    const creator = extractTagText(itemXml, 'dc:creator') || extractTagText(itemXml, 'author');
    const pubDate = extractTagText(itemXml, 'pubDate');
    const categoryTags = extractAllTagText(itemXml, 'category');
    const enclosureUrl = extractAttribute(itemXml, 'enclosure', 'url');
    const imageUrl = enclosureUrl || extractAttribute(itemXml, 'media:content', 'url') || '';
    const contentEncodedMatch = itemXml.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i);
    const contentEncoded = contentEncodedMatch ? contentEncodedMatch[1] : '';

    items.push({
      title,
      description: description || contentEncoded || '',
      link,
      author: creator,
      pubDate,
      categories: categoryTags,
      image: imageUrl,
      content: contentEncoded,
    });
  }
  return items;
}

exports.handler = async function (event, context) {
  try {
    const response = await fetch(FEED_URL);
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Unable to fetch Substack feed (${response.status})` }),
      };
    }

    const xml = await response.text();
    const posts = parseItems(xml).slice(0, 10);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
      body: JSON.stringify({ posts }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: error.message || 'Unexpected error fetching Substack feed' }),
    };
  }
};
