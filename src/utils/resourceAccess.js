function normalizeUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return null;
  }
  return null;
}

export function resolveResourceAccess(resource) {
  const href =
    normalizeUrl(resource?.external_url) ||
    normalizeUrl(resource?.externalUrl) ||
    normalizeUrl(resource?.url) ||
    normalizeUrl(resource?.link);

  const buttonText = String(resource?.button_text || resource?.buttonText || '').trim();

  return {
    href,
    label: buttonText || 'Get Resource',
    enabled: Boolean(href),
    external: true,
  };
}
