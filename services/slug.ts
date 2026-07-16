import { Article } from '../types';

// Keeps Arabic letters, latin word chars and dashes; everything else is dropped.
// Must stay in sync with the redirect lookup in server/index.mjs (slug is data).
export const slugify = (title: string): string =>
    title
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w؀-ۿ-]/g, '')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '');

/**
 * Slug for an article being created/edited:
 * - an existing non-empty slug is kept verbatim (shared links must not break
 *   when the title is edited later);
 * - otherwise derived from the title, falling back to the id when the title
 *   yields nothing sluggable;
 * - deduplicated against the other articles with a numeric suffix.
 */
export const ensureArticleSlug = (
    article: Pick<Article, 'id' | 'title'> & { slug?: string },
    others: Pick<Article, 'id' | 'slug'>[],
): string => {
    if (article.slug) return article.slug;
    const base = slugify(article.title) || article.id;
    const taken = new Set(
        others.filter(a => a.id !== article.id).map(a => a.slug).filter(Boolean),
    );
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
    return slug;
};
