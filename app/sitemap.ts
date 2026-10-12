import type { MetadataRoute } from "next";
import { listPublishedArticles } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://miidasu.co";
  const staticPages = [
    { path: "/", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/blog/", changeFrequency: "weekly" as const, priority: .9 },
    { path: "/about/", changeFrequency: "monthly" as const, priority: .8 },
    { path: "/authors/", changeFrequency: "monthly" as const, priority: .6 },
    { path: "/authors/yash/", changeFrequency: "monthly" as const, priority: .6 },
    { path: "/authors/ata/", changeFrequency: "monthly" as const, priority: .6 },
    { path: "/authors/snehil/", changeFrequency: "monthly" as const, priority: .6 },
    { path: "/contact/", changeFrequency: "yearly" as const, priority: .5 },
    { path: "/privacy/", changeFrequency: "yearly" as const, priority: .3 },
    { path: "/terms/", changeFrequency: "yearly" as const, priority: .3 },
    { path: "/cookies/", changeFrequency: "yearly" as const, priority: .3 }
  ];

  // Do not return a silently incomplete sitemap if the CMS is temporarily unavailable.
  // Search crawlers can retry a failed response without interpreting missing articles as deletions.
  const published = await listPublishedArticles();
  const modified = (value: string | null | undefined) => {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
  };

  const articlePages: MetadataRoute.Sitemap = published.map(article => ({
    url: base + "/blog/" + article.slug + "/",
    ...(modified(article.updated_at || article.published_at || article.created_at)
      ? { lastModified: modified(article.updated_at || article.published_at || article.created_at) }
      : {}),
    changeFrequency: "monthly" as const,
    priority: .7,
  }));

  // The homepage and blog hub show published posts; their freshness follows the actual
  // latest published article, never the instant a crawler requests sitemap.xml.
  const latestArticleModification = published
    .map(article => modified(article.updated_at || article.published_at || article.created_at))
    .filter((value): value is Date => Boolean(value))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const hubs = new Set(["/", "/blog/"]);
  const pages: MetadataRoute.Sitemap = staticPages.map(page => ({
    url: base + page.path,
    ...(hubs.has(page.path) && latestArticleModification
      ? { lastModified: latestArticleModification }
      : {}),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // For other static pages, no lastmod is more accurate than a fabricated "now" date.
  return pages.concat(articlePages);
}
