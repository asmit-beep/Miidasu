import type { Metadata } from "next";
import { PageFrame } from "@/components/site-shell";
import { listPublishedArticles } from "@/lib/data";
import { articleSummary, formatPublishDate, readLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Essays and notes on work, curiosity, and everyday life from the Miidasu journal.",
  alternates: { canonical: "/blog/" }
};

function Meta({category,minutes,date}:{category:string;minutes:number|null;date?:string|null}) {
  return <div className="card-meta"><span>{category || "Journal"}</span><span>{readLabel(minutes)}</span>{date&&<span>{formatPublishDate(date)}</span>}</div>;
}

export default async function BlogPage() {
  const articles = await listPublishedArticles().catch(() => []);
  const lead = articles[0];
  const side = articles.slice(1,4);
  const feed = articles.slice(4);

  return (
    <PageFrame current="blog">
      <header className="full-bleed journal-title-wrap tech-journal-title">
        <div className="edge-row journal-title">
          <p className="eyebrow">MIIDASU / JOURNAL</p>
          <div className="journal-title-grid">
            <h1>Technology, systems, tools, and the <em>decisions behind them.</em></h1>
            <p>Practical explainers, comparisons, and perspectives with the answer up front and the context underneath it.</p>
          </div>
        </div>
      </header>

      {lead && <section className="full-bleed journal-lead-wrap">
        <div className="edge-row tech-blog-lead">
          <article className="blog-lead-main">
            {lead.cover_image_url && <a className="journal-lead-media" href={"/blog/"+lead.slug+"/"}><img src={lead.cover_image_url} alt="" /></a>}
            <Meta category={lead.category} minutes={lead.read_time_minutes} date={lead.published_at}/>
            <h2><a href={"/blog/"+lead.slug+"/"}>{lead.title}</a></h2>
            <p>{articleSummary(lead,230)}</p>
            <a className="reactive-button text-button" href={"/blog/"+lead.slug+"/"}>Read the story <span>↗</span></a>
          </article>

          <aside className="blog-lead-side">
            <div className="panel-title">More to read</div>
            {side.map((a,i)=><article className="blog-side-row" key={a.id}>
              <span>{String(i+1).padStart(2,"0")}</span>
              <div>
                <Meta category={a.category} minutes={a.read_time_minutes}/>
                <h3><a href={"/blog/"+a.slug+"/"}>{a.title}</a></h3>
                <p>{articleSummary(a,120)}</p>
              </div>
            </article>)}
          </aside>
        </div>
      </section>}

      <section className="full-bleed journal-feed-wrap">
        <div className="edge-row">
          <div className="section-title-row"><h2>Latest Stories</h2><span>{articles.length} published</span></div>
          <div className="tech-feed">
            {feed.map((a,i)=><article className="tech-feed-row" key={a.id}>
              <span className="feed-index">{String(i+1).padStart(2,"0")}</span>
              {a.cover_image_url && <a className="feed-media" href={"/blog/"+a.slug+"/"}><img src={a.cover_image_url} alt="" /></a>}
              <div className="feed-copy">
                <Meta category={a.category} minutes={a.read_time_minutes} date={a.published_at}/>
                <h2><a href={"/blog/"+a.slug+"/"}>{a.title}</a></h2>
                <p>{articleSummary(a,190)}</p>
              </div>
              <a className="feed-open reactive-button" href={"/blog/"+a.slug+"/"} aria-label={"Read "+a.title}>↗</a>
            </article>)}
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
