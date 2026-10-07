import type { MetadataRoute } from "next";
import { listPublishedArticles } from "@/lib/data";

export const dynamic="force-dynamic";

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const base="https://miidasu.co";
  const staticPages=[
    {path:"/",changeFrequency:"weekly" as const,priority:1},
    {path:"/blog/",changeFrequency:"weekly" as const,priority:.9},
    {path:"/about/",changeFrequency:"monthly" as const,priority:.8},
    {path:"/authors/",changeFrequency:"monthly" as const,priority:.6},
    {path:"/authors/yash/",changeFrequency:"monthly" as const,priority:.6},
    {path:"/authors/ata/",changeFrequency:"monthly" as const,priority:.6},
    {path:"/authors/snehil/",changeFrequency:"monthly" as const,priority:.6},
    {path:"/contact/",changeFrequency:"yearly" as const,priority:.5},
    {path:"/privacy/",changeFrequency:"yearly" as const,priority:.3},
    {path:"/terms/",changeFrequency:"yearly" as const,priority:.3},
    {path:"/cookies/",changeFrequency:"yearly" as const,priority:.3}
  ];
  const now=new Date();
  const pages:MetadataRoute.Sitemap=staticPages.map(p=>({
    url:base+p.path,
    lastModified:now,
    changeFrequency:p.changeFrequency,
    priority:p.priority
  }));
  const articles=(await listPublishedArticles().catch(()=>[])).map(a=>({
    url:base+"/blog/"+a.slug+"/",
    lastModified:new Date(a.updated_at||a.published_at||a.created_at),
    changeFrequency:"monthly" as const,
    priority:.7
  }));
  return pages.concat(articles);
}
