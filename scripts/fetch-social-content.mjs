#!/usr/bin/env node
// Fetch OpenGraph metadata for each social post URL and emit data/socialPosts.ts.
// Run before build: `node scripts/fetch-social-content.mjs`

import { writeFile } from 'node:fs/promises';

const SOURCES = [
  // ── original batch ──
  { id: 1,  type: 'facebook', url: 'https://www.facebook.com/share/p/18GvVs4K8V/' },
  { id: 2,  type: 'facebook', url: 'https://www.facebook.com/share/184gm31REJ/' },
  { id: 3,  type: 'twitter',  url: 'https://x.com/g_khamre/status/2050969680458727691' },
  { id: 4,  type: 'facebook', url: 'https://www.facebook.com/share/p/1FWdCCXQ8p/' },
  { id: 5,  type: 'facebook', url: 'https://www.facebook.com/share/1B2KJQvpE3/' },
  { id: 6,  type: 'facebook', url: 'https://www.facebook.com/share/18Pvuaraqb/' },
  { id: 7,  type: 'facebook', url: 'https://www.facebook.com/share/18XFqsHok9/' },
  { id: 8,  type: 'facebook', url: 'https://www.facebook.com/share/18PER5LFQ1/' },
  { id: 9,  type: 'facebook', url: 'https://www.facebook.com/share/1EFZUNcdPR/' },
  { id: 10, type: 'facebook', url: 'https://www.facebook.com/share/p/1B8rie1BAd/' },
  { id: 11, type: 'facebook', url: 'https://www.facebook.com/share/p/1AznrvByEn/' },
  { id: 12, type: 'facebook', url: 'https://www.facebook.com/share/18oWy6feyX/' },
  { id: 13, type: 'facebook', url: 'https://www.facebook.com/share/p/18otrMgbMH/' },
  { id: 14, type: 'facebook', url: 'https://www.facebook.com/share/p/1GCpMEkCvA/' },
  { id: 15, type: 'facebook', url: 'https://www.facebook.com/share/1JPEVA6emw/' },
  { id: 16, type: 'facebook', url: 'https://www.facebook.com/share/p/1Aq6wa2qiw/' },
  { id: 17, type: 'facebook', url: 'https://www.facebook.com/share/p/1bsvE2VGg8/' },
  { id: 18, type: 'facebook', url: 'https://www.facebook.com/share/1bXYNWcHtL/' },
  { id: 19, type: 'facebook', url: 'https://www.facebook.com/share/18gsWAAsXV/' },
  { id: 20, type: 'facebook', url: 'https://www.facebook.com/share/p/1LCuheyr6s/' },
  { id: 21, type: 'facebook', url: 'https://www.facebook.com/share/18U831WbQ4/' },
  { id: 22, type: 'facebook', url: 'https://www.facebook.com/share/p/1GQRwLRn3L/' },
  { id: 23, type: 'facebook', url: 'https://www.facebook.com/share/1D2My2SzNj/' },
  { id: 24, type: 'facebook', url: 'https://www.facebook.com/share/p/1apimmLbgC/' },
  // ── second batch (added 2026-05-16) ──
  { id: 25, type: 'facebook', url: 'https://www.facebook.com/share/v/1J42npMiKG/' },
  { id: 26, type: 'facebook', url: 'https://www.facebook.com/share/1CbTUqkrLx/' },
  { id: 27, type: 'facebook', url: 'https://www.facebook.com/share/1UNtH5URe9/' },
  { id: 28, type: 'twitter',  url: 'https://x.com/yemenscopsa/status/2017011455686541322' },
  { id: 29, type: 'twitter',  url: 'https://x.com/yemenp5jq/status/2017033738316660864' },
  { id: 30, type: 'facebook', url: 'https://www.facebook.com/share/1GZg4QheZ8/' },
  { id: 31, type: 'twitter',  url: 'https://x.com/albtool_3/status/2023885789713592777' },
  { id: 32, type: 'twitter',  url: 'https://x.com/holand_ye/status/2036374687127666785' },
  { id: 33, type: 'twitter',  url: 'https://x.com/drabusaad/status/2036194360027390259' },
  { id: 34, type: 'twitter',  url: 'https://x.com/salemalsehman/status/2036357614955630893' },
  { id: 35, type: 'twitter',  url: 'https://x.com/yahyaa12a/status/2036523299291721812' },
  { id: 36, type: 'twitter',  url: 'https://x.com/a_alomari_0505/status/2036628027103199303' },
  { id: 37, type: 'twitter',  url: 'https://x.com/n_b52otb/status/2036528386818953389' },
  { id: 38, type: 'twitter',  url: 'https://x.com/yemenscopsa/status/2036648696381612222' },
  { id: 39, type: 'twitter',  url: 'https://x.com/ksa2012f/status/2036821280733716816' },
  { id: 40, type: 'twitter',  url: 'https://x.com/c0olo/status/2037267828928041181' },
  { id: 41, type: 'facebook', url: 'https://www.facebook.com/1727010673/posts/10203175110575073/' },
];

const UA = 'Mozilla/5.0 (compatible; OGScraper/1.0; +https://gamilazzdeen.com)';

const decodeHtmlEntities = (s) =>
  s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const extractMeta = (html, prop) => {
  const re = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
  const m = html.match(re);
  return m ? decodeHtmlEntities(m[1]) : null;
};

// Known "post unavailable" indicators in Facebook's HTML response
const UNAVAILABLE_INDICATORS = [
  'لم يعد متوفر',
  'لم يعد متوفّر',
  'content isn\'t available',
  'content is no longer available',
  'this content isn\'t available',
  'this page isn\'t available',
  'sorry, this content',
];

async function fetchFacebookPost(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': UA, 'Accept-Language': 'ar,en;q=0.8' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const html = await res.text();
  const lowerHtml = html.toLowerCase();
  const hasUnavailableMarker = UNAVAILABLE_INDICATORS.some(s => lowerHtml.includes(s.toLowerCase()));
  const title = extractMeta(html, 'og:title') || '';
  const description = extractMeta(html, 'og:description') || '';
  // Post is available only if we got meaningful metadata AND no unavailable marker
  const available = !hasUnavailableMarker && title.trim().length > 0;
  return {
    title,
    description,
    image: extractMeta(html, 'og:image') || '',
    canonical: extractMeta(html, 'og:url') || url,
    available,
  };
}

async function fetchAll() {
  const results = [];
  for (const s of SOURCES) {
    process.stderr.write(`Fetching #${s.id} (${s.type}) … `);
    if (s.type === 'twitter') {
      // Extract @username from the URL so each X post is correctly labelled
      const m = s.url.match(/(?:x|twitter)\.com\/([^/]+)\/status\//);
      const handle = m ? m[1] : '';
      // Twitter availability is checked client-side by widgets.js — assume available here
      results.push({
        ...s,
        title: 'منشور على X (تويتر)',
        description: handle
          ? `منشور رسمي من حساب @${handle} على منصة X`
          : 'منشور رسمي على منصة X',
        image: '',
        canonical: s.url,
        available: true,
      });
      process.stderr.write(`twitter (@${handle})\n`);
      continue;
    }
    try {
      const meta = await fetchFacebookPost(s.url);
      results.push({ ...s, ...meta });
      process.stderr.write(`${meta.available ? '✓' : '⊘'} ${meta.title || '(unavailable)'}\n`);
    } catch (e) {
      results.push({ ...s, title: '', description: '', image: '', canonical: s.url, available: false });
      process.stderr.write(`✗ ${e.message}\n`);
    }
    // Gentle pause between requests
    await new Promise(r => setTimeout(r, 400));
  }
  return results;
}

function emitDataFile(posts) {
  const ts = `// AUTO-GENERATED by scripts/fetch-social-content.mjs — do not edit by hand.
// Regenerate with: node scripts/fetch-social-content.mjs
// Last fetch: ${new Date().toISOString()}

export interface SocialPost {
  id: number;
  type: 'facebook' | 'twitter';
  sourceUrl: string;
  canonicalUrl: string;
  title: string;
  description: string;
  image: string;
  /** false = post deleted, made private, or no longer reachable (auto-detected by scraper) */
  available: boolean;
}

export const SOCIAL_POSTS: SocialPost[] = ${JSON.stringify(
    posts.map(p => ({
      id: p.id,
      type: p.type,
      sourceUrl: p.url,
      canonicalUrl: p.canonical,
      title: p.title,
      description: p.description,
      image: p.image,
      available: p.available !== false,
    })),
    null,
    2,
  )};
`;
  return ts;
}

const posts = await fetchAll();
const out = emitDataFile(posts);
await writeFile(new URL('../data/socialPosts.ts', import.meta.url), out, 'utf8');
console.error(`\n✓ Wrote data/socialPosts.ts with ${posts.length} posts.`);
