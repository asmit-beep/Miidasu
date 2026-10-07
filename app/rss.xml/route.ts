import { listPublishedArticles } from "@/lib/data";

export const dynamic="force-dynamic";

function esc(s:string){
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
}

export async function GET(){
  const base="https://miidasu.co";
  const articles=await listPublishedArticles().catch(()=>[]);
  const items=articles.map(a=>{
    const link=base+"/blog/"+a.slug+"/";
    const pub=a.published_at||a.updated_at||a.created_at;
    const desc=esc(a.excerpt||a.meta_description||"");
    return `<item><title>${esc(a.title)}</title><link>${link}</link><guid isPermaLink="true">${link}</guid><pubDate>${new Date(pub).toUTCString()}</pubDate><description>${desc}</description>${a.author?`<dc:creator>${esc(a.author)}</dc:creator>`:""}</item>`;
  }).join("");
  const xml=`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Miidasu</title><link>${base}/</link><description>Thoughts on work, life, and the interesting things in between. Stay curious. Find your perspective.</description><atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  return new Response(xml,{headers:{"Content-Type":"application/rss+xml; charset=utf-8","Cache-Control":"public, max-age=0, s-maxage=900"}});
}
