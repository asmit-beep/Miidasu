import type { MetadataRoute } from "next";
import { listPublishedSitemapArticles } from "@/lib/data";
import { buildSitemapEntries } from "@/lib/sitemap-utils";

// Always fetch fresh published rows for the sitemap, not the cached blog feed.
// Do not allow Next.js to serve a build-time or stale sitemap after publication.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const staticPaths = [
  "/",
  "/blog/",
  "/about/",
  "/authors/",
  "/authors/yash/",
  "/authors/ata/",
  "/authors/snehil/",
  "/contact/",
  "/privacy/",
  "/terms/",
  "/cookies/",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A CMS error must fail this request instead of silently dropping published pages.
  const published = await listPublishedSitemapArticles();
  return buildSitemapEntries("https://miidasu.co", published, staticPaths);
}
