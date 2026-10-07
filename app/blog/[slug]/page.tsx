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
  const articleUrl="https://miidasu.co/blog/"+article.slug+"/";
  const authorUrl=aSlug ? "https://miidasu.co/authors/"+aSlug+"/" : undefined;

  const articleSchema={
    "@context":"https://schema.org",
    "@type":"BlogPosting",
    "headline":article.title,
    "description":article.meta_description||article.excerpt||articleSummary(article,260),
    "datePublished":article.published_at||article.created_at,
    "dateModified":article.updated_at||article.published_at||article.created_at,
    ...(article.cover_image_url?{"image":[article.cover_image_url]}:{}),
    "mainEntityOfPage":{"@type":"WebPage","@id":articleUrl},
    "author":{
      "@type":"Person",
      "name":displayAuthor,
      ...(authorUrl?{"url":authorUrl}:{})
    },
    "publisher":{
      "@type":"Organization",
      "name":"Miidasu",
      "url":"https://miidasu.co",
      "logo":{"@type":"ImageObject","url":"https://miidasu.co/icon-192.png"}
    },
    "isPartOf":{"@type":"Blog","@id":"https://miidasu.co/blog/","name":"Miidasu journal"},
    "inLanguage":"en",
    "articleSection":article.category||"Journal"
  };

  const breadcrumbSchema={
    "@context":"https://schema.org",
    "@type":"BreadcrumbList",
    "itemListElement":[
      {"@type":"ListItem","position":1,"name":"Home","item":"https://miidasu.co/"},
      {"@type":"ListItem","position":2,"name":"Blog","item":"https://miidasu.co/blog/"},
      {"@type":"ListItem","position":3,"name":article.title,"item":articleUrl}
    ]
  };

  return (
    <PageFrame current="blog">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(articleSchema)}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbSchema)}} />
      <article className="article-page">
        <header className="full-bleed article-head-wrap">
          <div className={"edge-row article-hero-grid"+(!article.cover_image_url?" no-cover":"")}>
            <div className="article-hero-copy">
              <div className="article-kicker">{article.category||"Journal"}</div>
              <h1>{article.title}</h1>
              <p className="article-excerpt">{articleSummary(article,260)}</p>

              <div className="article-meta-row">
                <div><span>By</span>{aSlug?<a href={"/authors/"+aSlug+"/"}>{displayAuthor}</a>:<strong>{displayAuthor}</strong>}</div>
                <div><span>Published</span><strong>{formatPublishDate(article.published_at)}</strong></div>
                <div><span>Read time</span><strong>{readLabel(article.read_time_minutes)}</strong></div>
              </div>
            </div>

            {article.cover_image_url && (
              <figure className="article-hero-media">
                <img src={article.cover_image_url} alt="" />
              </figure>
            )}
          </div>
        </header>

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
