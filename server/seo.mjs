// Pure OG/SEO meta-injection helpers for article pages.
// No I/O and no shared state — safe under concurrent requests and unit-testable
// without a database (see scripts/test-seo.mjs).

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// og:image must be an absolute URL. https URLs pass through, site-relative
// paths get the public origin prefixed; anything else (data: base64 images,
// plain http:) can't be used by crawlers over https, so fall back to the
// default portrait that the static template already uses.
export function absoluteImageUrl(image, origin) {
  if (typeof image === 'string') {
    if (/^https:\/\//i.test(image)) return image;
    if (image.startsWith('/') && !image.startsWith('//')) return origin + image;
  }
  return `${origin}/gamil.jpg`;
}

// Pure function: template string + article -> HTML with article-specific
// <title>/description/canonical/OG/Twitter tags. Every dynamic value is
// HTML-escaped, and replacements use callbacks so `$` sequences in article
// text are never interpreted as regex replacement patterns.
export function renderArticleHtml(template, article, origin) {
  const rawTitle = typeof article.title === 'string' ? article.title.trim() : '';
  const rawExcerpt = typeof article.excerpt === 'string' ? article.excerpt : '';
  const plainExcerpt = rawExcerpt.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);

  const title = escapeHtml(rawTitle ? `${rawTitle} | جميل عزالدين` : 'جميل عزالدين | Gamil Azzdeen');
  const description = escapeHtml(plainExcerpt);
  const url = escapeHtml(`${origin}/articles/${encodeURIComponent(article.slug)}`);
  const image = escapeHtml(absoluteImageUrl(article.image, origin));

  const replaceAttr = (html, pattern, value) =>
    html.replace(pattern, (_m, before, after) => `${before}${value}${after}`);

  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${title}</title>`);
  html = replaceAttr(html, /(<meta name="description" content=")[^"]*(")/, description);
  html = replaceAttr(html, /(<link rel="canonical" href=")[^"]*(")/, url);
  html = replaceAttr(html, /(<meta property="og:type" content=")[^"]*(")/, 'article');
  html = replaceAttr(html, /(<meta property="og:url" content=")[^"]*(")/, url);
  html = replaceAttr(html, /(<meta property="og:title" content=")[^"]*(")/, title);
  html = replaceAttr(html, /(<meta property="og:description" content=")[^"]*(")/, description);
  html = replaceAttr(html, /(<meta property="og:image" content=")[^"]*(")/, image);
  html = replaceAttr(html, /(<meta property="twitter:url" content=")[^"]*(")/, url);
  html = replaceAttr(html, /(<meta property="twitter:title" content=")[^"]*(")/, title);
  html = replaceAttr(html, /(<meta property="twitter:description" content=")[^"]*(")/, description);
  html = replaceAttr(html, /(<meta property="twitter:image" content=")[^"]*(")/, image);
  return html;
}
