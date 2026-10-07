import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageFrame } from "@/components/site-shell";
import { ArticleToc } from "@/components/article-toc";
import { getArticleBySlug, listPublishedArticles } from "@/lib/data";
import { articleSummary, authorSlug, extractHeadings, formatPublishDate, renderMarkdown, readLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const article=await getArticleBySlug(slug).catch(()=>null);
  if(!article)return {};
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
  if(!article)notFound();

  const related=(await listPublishedArticles().catch(()=>[]))
    .filter(a=>a.id!==article.id)
    .slice(0,4);

  const aSlug=authorSlug(article.author);
  const displayAuthor=article.author.toLowerCase().includes("nikita") ? "Ata Shaikh" : article.author;
  const headings=extractHeadings(article.content||"");
  const body=renderMarkdown(article.content||"");

  return (
    <PageFrame current="blog">
      <article className="article-page">
        <header className="full-bleed article-head-wrap">
          <div className="edge-row article-head">
            <div className="article-kicker">{article.category||"Journal"}</div>
            <h1>{article.title}</h1>
            <p className="article-excerpt">{articleSummary(article,260)}</p>
            <div className="article-meta-row">
              <div><span>By</span>{aSlug?<a href={"/authors/"+aSlug+"/"}>{displayAuthor}</a>:<strong>{displayAuthor}</strong>}</div>
              <div><span>Published</span><strong>{formatPublishDate(article.published_at)}</strong></div>
              <div><span>Read time</span><strong>{readLabel(article.read_time_minutes)}</strong></div>
            </div>
          </div>
        </header>

        {article.cover_image_url && <figure className="full-bleed article-cover-wrap">
          <div className="article-cover-shell">
            <div className="article-cover"><img src={article.cover_image_url} alt="" /></div>
          </div>
        </figure>}

        <section className="full-bleed article-body-wrap">
          <div className="edge-row article-content-grid">
            <aside className="article-side">
              <ArticleToc headings={headings}/>
            </aside>

            <div className="article-copy" dangerouslySetInnerHTML={{__html:body}} />

            <aside className="article-context">
              <div className="context-card">
                <span className="context-label">Story details</span>
                <strong>{article.category || "Journal"}</strong>
                <span>{readLabel(article.read_time_minutes)}</span>
                <span>{formatPublishDate(article.published_at)}</span>
                <a className="reactive-button text-button" href="/blog/">All stories <span>↗</span></a>
              </div>
            </aside>
          </div>
        </section>
      </article>

      {related.length>0 && <section className="full-bleed related-wrap">
        <div className="edge-row">
          <div className="section-title-row"><h2>Keep Reading</h2><a href="/blog/">Journal</a></div>
          <div className="related-grid">
            {related.map(a=><article className="related-card" key={a.id}>
              {a.cover_image_url&&<a className="related-media" href={"/blog/"+a.slug+"/"}><img src={a.cover_image_url} alt="" /></a>}
              <div className="card-meta"><span>{a.category}</span><span>{readLabel(a.read_time_minutes)}</span></div>
              <h3><a href={"/blog/"+a.slug+"/"}>{a.title}</a></h3>
              <p>{articleSummary(a,150)}</p>
              <a className="reactive-button text-button" href={"/blog/"+a.slug+"/"}>Read <span>↗</span></a>
            </article>)}
          </div>
        </div>
      </section>}
    </PageFrame>
  );
}
