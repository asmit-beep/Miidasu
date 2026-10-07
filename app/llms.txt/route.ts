import { listPublishedArticles } from "@/lib/data";
import { AUTHORS } from "@/lib/types";

export const revalidate=3600;

export async function GET(){
  const base="https://miidasu.co";
  const articles=await listPublishedArticles().catch(()=>[]);
  const articleLines=articles.map(a=>`- [${a.title}](${base}/blog/${a.slug}/)`).join("\n");
  const authorLines=AUTHORS.map(a=>`- [${a.name}](${base}/authors/${a.key}/)`).join("\n");
  const body=`# Miidasu

> Miidasu is an independent journal publishing practical explainers, comparisons, and perspectives on modern work, technology, and the systems around them.

## Primary pages

- [Home](${base}/)
- [Journal](${base}/blog/)
- [About](${base}/about/)
- [Authors](${base}/authors/)
- [Contact](${base}/contact/)

## Journal

${articleLines||"- No published stories yet."}

## Authors

${authorLines}

## Feeds

- [RSS](${base}/rss.xml)
- [Sitemap](${base}/sitemap.xml)
`;
  return new Response(body,{headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"public, max-age=0, s-maxage=3600"}});
}
