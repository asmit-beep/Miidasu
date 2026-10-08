import type { Metadata } from "next";
import { PageFrame } from "@/components/site-shell";
import { getHomepageFeature, listPublishedArticles } from "@/lib/data";
import { AUTHORS } from "@/lib/types";
import { articleSummary, formatPublishDate, readLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Stay curious. Find your perspective. | Miidasu" },
  description: "Thoughts on work, life, and the interesting things in between. Explore the Miidasu journal.",
  alternates: { canonical: "https://miidasu.co/" }
};

function Meta({category,minutes,date}:{category:string;minutes:number|null;date?:string|null}) {
  return <div className="card-meta"><span>{category || "Journal"}</span><span>{readLabel(minutes)}</span>{date&&<span>{formatPublishDate(date)}</span>}</div>;
}

function ArticleLink({href,label}:{href:string;label:string}) {
  return <a className="reactive-button text-button" href={href}>{label}<span>↗</span></a>;
}

export default async function HomePage() {
  let articles = await listPublishedArticles().catch(() => []);
  const featured = await getHomepageFeature().catch(() => null) ?? articles[0] ?? null;
  if (featured) articles = articles.filter(a => a.id !== featured.id);

  const top = articles.slice(0,4);
  const latest = articles.slice(4,10);
  const quick = articles.filter(a => (a.read_time_minutes ?? 99) <= 10).slice(0,4);
  const deep = articles.filter(a => (a.read_time_minutes ?? 0) >= 15).slice(0,3);
  const stream = articles.slice(0,12);

  return (
    <PageFrame current="home">
      <section className="full-bleed home-intro tech-home-intro">
        <div className="edge-row intro-grid">
          <div>
            <p className="eyebrow">MIIDASU / IDEAS & TECHNOLOGY</p>
            <h1>Useful ideas, sharper context, <em>less noise.</em></h1>
          </div>
          <div className="intro-side">
            <p>Miidasu publishes practical explainers, comparisons, and perspectives on the systems, tools, and decisions shaping modern work.</p>
            <ArticleLink href="/blog/" label="Browse all stories"/>
          </div>
        </div>
      </section>

      <section className="full-bleed section-shell">
        <div className="edge-row">
          <div className="section-title-row"><h2>Top Stories</h2><span>What to read first</span></div>
          <div className="tech-lead-grid">
            {featured && <article className="tech-feature">
              {featured.cover_image_url && <a className="hero-media" href={"/blog/"+featured.slug+"/"}><img decoding="async" fetchPriority="high" src={featured.cover_image_url} alt="" /></a>}
              <Meta category={featured.category} minutes={featured.read_time_minutes} date={featured.published_at}/>
              <h2><a href={"/blog/"+featured.slug+"/"}>{featured.title}</a></h2>
              <p>{articleSummary(featured,220)}</p>
              <ArticleLink href={"/blog/"+featured.slug+"/"} label="Read the story"/>
            </article>}

            <aside className="tech-top-stack">
              <div className="panel-title">More Top Stories</div>
              {top.map((a,i) => <article className="tech-stack-card tech-stack-row" key={a.id}>
                <span className="stack-index">{String(i+1).padStart(2,"0")}</span>
                {a.cover_image_url && <a className="stack-media" href={"/blog/"+a.slug+"/"}><img loading="lazy" decoding="async" src={a.cover_image_url} alt="" /></a>}
                <div className="stack-copy">
                  <Meta category={a.category} minutes={a.read_time_minutes}/>
                  <h3><a href={"/blog/"+a.slug+"/"}>{a.title}</a></h3>
                  <p>{articleSummary(a,125)}</p>
                </div>
              </article>)}
            </aside>
          </div>
        </div>
      </section>

      <section className="full-bleed section-shell">
        <div className="edge-row">
          <div className="section-title-row"><h2>Latest</h2><a href="/blog/">View all</a></div>
          <div className="latest-grid">
            {latest.map(a => <article className="latest-card" key={a.id}>
              {a.cover_image_url && <a className="latest-media" href={"/blog/"+a.slug+"/"}><img loading="lazy" decoding="async" src={a.cover_image_url} alt="" /></a>}
              <Meta category={a.category} minutes={a.read_time_minutes}/>
              <h3><a href={"/blog/"+a.slug+"/"}>{a.title}</a></h3>
              <p>{articleSummary(a,165)}</p>
            </article>)}
          </div>
        </div>
      </section>

      {quick.length>0 && <section className="full-bleed section-shell compact-reads">
        <div className="edge-row">
          <div className="section-title-row"><h2>Quick Reads</h2><span>Fast context, useful answer</span></div>
          <div className="quick-grid">
            {quick.map((a,i)=><article className="quick-card" key={a.id}>
              <div className="quick-index">{String(i+1).padStart(2,"0")}</div>
              <Meta category={a.category} minutes={a.read_time_minutes}/>
              <h3><a href={"/blog/"+a.slug+"/"}>{a.title}</a></h3>
              <p>{articleSummary(a,125)}</p>
              <ArticleLink href={"/blog/"+a.slug+"/"} label="Open"/>
            </article>)}
          </div>
        </div>
      </section>}

      {deep.length>0 && <section className="full-bleed feature-band">
        <div className="edge-row">
          <div className="section-title-row light-row"><h2>Deep Reads</h2><span>Longer analysis</span></div>
          <div className="deep-grid">
            {deep.map((a,i)=><article className="deep-card" key={a.id}>
              <div className="deep-card-top"><span>{String(i+1).padStart(2,"0")}</span><Meta category={a.category} minutes={a.read_time_minutes}/></div>
              <h3><a href={"/blog/"+a.slug+"/"}>{a.title}</a></h3>
              <p>{articleSummary(a,180)}</p>
              <ArticleLink href={"/blog/"+a.slug+"/"} label="Read deeply"/>
            </article>)}
          </div>
        </div>
      </section>}

      <section className="full-bleed stream-section">
        <div className="edge-row">
          <div className="section-title-row"><h2>Latest Stream</h2><span>Newest from Miidasu</span></div>
          <div className="stream-list">
            {stream.map((a,i)=><article className="stream-row" key={a.id}>
              <span className="stream-index">{String(i+1).padStart(2,"0")}</span>
              <div className="stream-main">
                <Meta category={a.category} minutes={a.read_time_minutes} date={a.published_at}/>
                <h3><a href={"/blog/"+a.slug+"/"}>{a.title}</a></h3>
                <p>{articleSummary(a,150)}</p>
              </div>
              {a.cover_image_url && <a className="stream-media" href={"/blog/"+a.slug+"/"}><img loading="lazy" decoding="async" src={a.cover_image_url} alt="" /></a>}
            </article>)}
          </div>
        </div>
      </section>

      <section className="full-bleed author-feature">
        <div className="edge-row">
          <div className="section-title-row"><h2>Contributors</h2><span>Who writes Miidasu</span></div>
          <div className="authors-home-grid">
            {AUTHORS.map((a,i)=><article className="author-home-card" key={a.key}>
              <span className="author-home-index">{String(i+1).padStart(2,"0")}</span>
              <h3><a href={"/authors/"+a.key+"/"}>{a.name}</a></h3>
              <p>{a.bio}</p>
              <ArticleLink href={"/authors/"+a.key+"/"} label="View stories"/>
            </article>)}
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
