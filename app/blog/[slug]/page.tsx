import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageFrame } from "@/components/site-shell";
import { getArticleBySlug, listPublishedArticles } from "@/lib/data";
import { authorSlug, formatPublishDate, markdownToHtml, readLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const article=await getArticleBySlug(slug).catch(()=>null);
  if(!article) return {};
  return {
    title:article.meta_title||article.title,
    description:article.meta_description||article.excerpt,
    alternates:{canonical:"/blog/"+article.slug+"/"},
    openGraph:{
      title:article.meta_title||article.title,
      description:article.meta_description||article.excerpt,
      type:"article",
      images:article.cover_image_url?[article.cover_image_url]:undefined
    }
  };
}

export default async function ArticlePage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const article=await getArticleBySlug(slug).catch(()=>null);
  if(!article) notFound();

  const related=(await listPublishedArticles().catch(()=>[])).filter(a=>a.id!==article.id).slice(0,3);
  const aSlug=authorSlug(article.author);

  return (
    <PageFrame current="blog">
      <article className="article-page">
        <header className="site-wrap article-head">
          <div className="article-kicker">{article.category||"Journal"}</div>
          <h1>{article.title}</h1>
          {article.excerpt && <p className="article-excerpt">{article.excerpt}</p>}
          <div className="article-meta-row">
            <div><span>By</span>{aSlug?<a href={"/authors/"+aSlug+"/"}>{article.author}</a>:<strong>{article.author}</strong>}</div>
            <div><span>Published</span><strong>{formatPublishDate(article.published_at)}</strong></div>
            <div><span>Read time</span><strong>{readLabel(article.read_time_minutes)}</strong></div>
          </div>
        </header>

        {article.cover_image_url && <figure className="site-wrap article-cover"><img src={article.cover_image_url} alt="" /></figure>}

        <div className="site-wrap article-content-grid">
          <aside className="article-side">
            <span>MIIDASU JOURNAL</span>
            <a href="/blog/">All stories</a>
          </aside>
          <div className="article-copy" dangerouslySetInnerHTML={{__html:markdownToHtml(article.content||"")}} />
        </div>
      </article>

      {related.length>0 && <section className="site-wrap section-block related-block">
        <div className="section-title-row"><h2>Keep Reading</h2><a href="/blog/">Journal</a></div>
        <div className="latest-grid">
          {related.map(a=><article className="latest-card" key={a.id}>
            {a.cover_image_url&&<a className="latest-media" href={"/blog/"+a.slug+"/"}><img src={a.cover_image_url} alt="" /></a>}
            <div className="card-meta"><span>{a.category}</span><span>{readLabel(a.read_time_minutes)}</span></div>
            <h3><a href={"/blog/"+a.slug+"/"}>{a.title}</a></h3>
            <p>{a.excerpt}</p>
          </article>)}
        </div>
      </section>}
    </PageFrame>
  );
}
