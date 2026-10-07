import type { Metadata } from "next";
import { PageFrame } from "@/components/site-shell";
import { listPublishedArticles } from "@/lib/data";
import { formatPublishDate, readLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Essays and notes on work, curiosity, and everyday life from the Miidasu journal.",
  alternates: { canonical: "/blog/" }
};

export default async function BlogPage() {
  const articles = await listPublishedArticles().catch(() => []);
  const lead = articles[0];
  const popular = articles.slice(1,5);
  const rest = articles.slice(5);

  return (
    <PageFrame current="blog">
      <header className="full-bleed journal-title-wrap">
        <div className="edge-row journal-title">
          <p className="eyebrow">THE MIIDASU JOURNAL</p>
          <div className="journal-title-grid">
            <h1>A few things <em>worth thinking about.</em></h1>
            <p>Essays and notes on work, curiosity, and everyday life.</p>
          </div>
        </div>
      </header>

      {lead && <section className="full-bleed journal-lead-wrap">
        <div className="edge-row journal-lead-card">
          {lead.cover_image_url && <a className="journal-lead-media" href={"/blog/"+lead.slug+"/"}><img src={lead.cover_image_url} alt="" /></a>}
          <div className="journal-lead-copy">
            <div className="card-meta"><span>{lead.category}</span><span>{readLabel(lead.read_time_minutes)}</span><span>{formatPublishDate(lead.published_at)}</span></div>
            <h2><a href={"/blog/"+lead.slug+"/"}>{lead.title}</a></h2>
            <p>{lead.excerpt}</p>
            <a className="reactive-button text-button" href={"/blog/"+lead.slug+"/"}>Read the story <span>↗</span></a>
          </div>
        </div>
      </section>}

      {popular.length>0 && <section className="full-bleed popular-strip">
        <div className="edge-row">
          <div className="section-title-row"><h2>Popular Right Now</h2><span>Worth opening next</span></div>
          <div className="popular-grid">
            {popular.map((a,i)=><article className="popular-card" key={a.id}>
              <span className="popular-index">{String(i+1).padStart(2,"0")}</span>
              <div className="card-meta"><span>{a.category}</span><span>{readLabel(a.read_time_minutes)}</span></div>
              <h3><a href={"/blog/"+a.slug+"/"}>{a.title}</a></h3>
            </article>)}
          </div>
        </div>
      </section>}

      <section className="full-bleed journal-list-wrap">
        <div className="edge-row">
          <div className="section-title-row"><h2>All Stories</h2><span>{articles.length} articles</span></div>
          <div className="journal-grid">
            {rest.map(a => <article className="journal-card" key={a.id}>
              {a.cover_image_url && <a className="journal-card-media" href={"/blog/"+a.slug+"/"}><img src={a.cover_image_url} alt="" /></a>}
              <div className="card-meta"><span>{a.category}</span><span>{readLabel(a.read_time_minutes)}</span></div>
              <h3><a href={"/blog/"+a.slug+"/"}>{a.title}</a></h3>
              <p>{a.excerpt}</p>
              <div className="journal-card-foot"><span>{formatPublishDate(a.published_at)}</span><a href={"/blog/"+a.slug+"/"}>Read ↗</a></div>
            </article>)}
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
