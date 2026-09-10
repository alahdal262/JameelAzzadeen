// Repeatable unit tests for the article OG/SEO meta injection (seo.mjs).
// Run: node server/scripts/test-seo.mjs — exits non-zero on any failure.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { escapeHtml, absoluteImageUrl, renderArticleHtml } from '../seo.mjs';

const ORIGIN = 'https://gamilazzdeen.com';

const TEMPLATE = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <title>جميل عزالدين | Gamil Azzdeen</title>
    <meta name="description" content="الموقع الرسمي" />
    <link rel="canonical" href="https://gamilazzdeen.com/" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://gamilazzdeen.com/" />
    <meta property="og:title" content="جميل عزالدين | Gamil Azzdeen" />
    <meta property="og:description" content="الموقع الرسمي" />
    <meta property="og:image" content="https://gamilazzdeen.com/gamil.jpg" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://gamilazzdeen.com/" />
    <meta property="twitter:title" content="جميل عزالدين | Gamil Azzdeen" />
    <meta property="twitter:description" content="الموقع الرسمي" />
    <meta property="twitter:image" content="https://gamilazzdeen.com/gamil.jpg" />
  </head>
  <body><div id="root"></div></body>
</html>`;

let failures = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`ok   ${name}`);
  } catch (err) {
    failures += 1;
    console.error(`FAIL ${name}\n     ${err.message}`);
  }
}

test('escapeHtml escapes all special characters', () => {
  assert.equal(escapeHtml(`<a href="x">&'`), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;');
});

test('absoluteImageUrl passes https through', () => {
  assert.equal(absoluteImageUrl('https://cdn.example.com/a.jpg', ORIGIN), 'https://cdn.example.com/a.jpg');
});

test('absoluteImageUrl prefixes site-relative paths', () => {
  assert.equal(absoluteImageUrl('/uploads/a.jpg', ORIGIN), `${ORIGIN}/uploads/a.jpg`);
});

test('absoluteImageUrl falls back for data:, http: and missing images', () => {
  for (const bad of ['data:image/png;base64,AAAA', 'http://insecure.example/a.jpg', '//evil.example/a.jpg', '', undefined, null, 42]) {
    assert.equal(absoluteImageUrl(bad, ORIGIN), `${ORIGIN}/gamil.jpg`);
  }
});

test('renderArticleHtml injects title, description, canonical, OG and Twitter tags', () => {
  const html = renderArticleHtml(TEMPLATE, {
    slug: 'test-article',
    title: 'عنوان تجريبي',
    excerpt: 'ملخص المقال',
    image: '/uploads/pic.jpg',
  }, ORIGIN);
  assert.match(html, /<title>عنوان تجريبي \| جميل عزالدين<\/title>/);
  assert.match(html, /<meta name="description" content="ملخص المقال"/);
  assert.match(html, /<link rel="canonical" href="https:\/\/gamilazzdeen\.com\/articles\/test-article"/);
  assert.match(html, /<meta property="og:type" content="article"/);
  assert.match(html, /<meta property="og:url" content="https:\/\/gamilazzdeen\.com\/articles\/test-article"/);
  assert.match(html, /<meta property="og:title" content="عنوان تجريبي \| جميل عزالدين"/);
  assert.match(html, /<meta property="og:image" content="https:\/\/gamilazzdeen\.com\/uploads\/pic\.jpg"/);
  assert.match(html, /<meta property="twitter:title" content="عنوان تجريبي \| جميل عزالدين"/);
  assert.match(html, /<meta property="twitter:image" content="https:\/\/gamilazzdeen\.com\/uploads\/pic\.jpg"/);
});

test('renderArticleHtml escapes hostile title/excerpt (XSS attempt stays inert)', () => {
  const html = renderArticleHtml(TEMPLATE, {
    slug: 'xss',
    title: `"><script>alert(1)</script>`,
    excerpt: `<img src=x onerror=alert(1)> "quoted" & 'single'`,
    image: 'data:image/png;base64,AAAA',
  }, ORIGIN);
  assert.ok(!html.includes('<script>alert(1)</script>'), 'raw script tag must not appear');
  assert.ok(!/content="[^"]*"><script/.test(html), 'attribute breakout must not occur');
  assert.match(html, /&quot;&gt;&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  // excerpt HTML tags are stripped before escaping; the quoted text survives escaped
  assert.match(html, /&quot;quoted&quot; &amp; &#39;single&#39;/);
});

test('renderArticleHtml is not confused by $ replacement patterns in text', () => {
  const html = renderArticleHtml(TEMPLATE, {
    slug: 'dollar',
    title: `سعر الصرف $& اليوم $' مقابل $1`,
    excerpt: '$&',
  }, ORIGIN);
  assert.match(html, /سعر الصرف \$&amp; اليوم \$&#39; مقابل \$1 \| جميل عزالدين/);
});

test('renderArticleHtml URL-encodes the slug in canonical/og:url', () => {
  const html = renderArticleHtml(TEMPLATE, {
    slug: 'مقال-تجريبي',
    title: 'عنوان',
    excerpt: 'ملخص',
  }, ORIGIN);
  assert.match(html, new RegExp(`/articles/${encodeURIComponent('مقال-تجريبي').replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}"`));
});

test('renderArticleHtml truncates long excerpts to 300 chars and strips tags', () => {
  const html = renderArticleHtml(TEMPLATE, {
    slug: 'long',
    title: 'ع',
    excerpt: `<p>${'كلمة '.repeat(200)}</p>`,
  }, ORIGIN);
  const m = /<meta name="description" content="([^"]*)"/.exec(html);
  assert.ok(m, 'description meta present');
  assert.ok(m[1].length <= 300, `description too long: ${m[1].length}`);
  assert.ok(!m[1].includes('<p>'), 'tags stripped');
});

test('renderArticleHtml against the real built dist/index.html when present', () => {
  const path = new URL('../../dist/index.html', import.meta.url);
  if (!fs.existsSync(path)) {
    console.log('     (dist/index.html absent — skipped)');
    return;
  }
  const built = fs.readFileSync(path, 'utf8');
  const html = renderArticleHtml(built, { slug: 's', title: 'عنوان مبني', excerpt: 'وصف' }, ORIGIN);
  assert.match(html, /<title>عنوان مبني \| جميل عزالدين<\/title>/);
  assert.match(html, /<meta property="og:type" content="article"/);
  assert.match(html, /og:url" content="https:\/\/gamilazzdeen\.com\/articles\/s"/);
});

if (failures > 0) {
  console.error(`\n${failures} test(s) failed`);
  process.exit(1);
}
console.log('\nall tests passed');
