import type { MetadataRoute } from "next";

/** Published content dates are authoritative. Database row creation is only a fallback. */
export type ArticleSitemapDates = {
  slug: string;
  published_at: string | null;
  updated_at: string | null;
  created_at: string | null;
};

function parseDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : undefined;
}

export function articleLastModifiedAt(article: ArticleSitemapDates): Date | undefined {
  const published = parseDate(article.published_at);
  const updated = parseDate(article.updated_at);
  if (published && updated) return published > updated ? published : updated;
  return published ?? updated ?? parseDate(article.created_at);
}

/** One canonical XML entry per published article, newest actual change first. */
export function buildSitemapEntries(
  origin: string,
  articles: readonly ArticleSitemapDates[],
  staticPaths: readonly string[],
): MetadataRoute.Sitemap {
  const base = origin.replace(/\/+$/, "");
  const entries = new Map<string, { url: string; lastModified?: Date; isArticle: boolean; publishedAt: number }>();
  let newestArticleModification: Date | undefined;

  for (const article of articles) {
    const slug = article.slug?.trim();
    if (!slug) continue;
    const url = base + "/blog/" + slug + "/";
    const lastModified = articleLastModifiedAt(article);
    const publishedAt = parseDate(article.published_at)?.getTime() ?? 0;
    const existing = entries.get(url);
    if (!existing || (lastModified?.getTime() ?? 0) > (existing.lastModified?.getTime() ?? 0)) {
      entries.set(url, { url, lastModified, isArticle: true, publishedAt });
    }
    if (lastModified && (!newestArticleModification || lastModified > newestArticleModification)) {
      newestArticleModification = lastModified;
    }
  }

  for (const path of staticPaths) {
    const url = base + path;
    const isArticleDriven = path === "/" || path === "/blog/";
    const lastModified = isArticleDriven ? newestArticleModification : undefined;
    if (!entries.has(url)) entries.set(url, { url, lastModified, isArticle: false, publishedAt: 0 });
  }

  return [...entries.values()]
    .sort((a, b) =>
      (b.lastModified?.getTime() ?? -1) - (a.lastModified?.getTime() ?? -1) ||
      Number(b.isArticle) - Number(a.isArticle) ||
      b.publishedAt - a.publishedAt ||
      a.url.localeCompare(b.url),
    )
    .map(({ url, lastModified }) => ({
      url,
      ...(lastModified ? { lastModified } : {}),
    }));
}
