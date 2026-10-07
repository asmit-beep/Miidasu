import type { Metadata } from "next";
import { PageFrame } from "@/components/site-shell";
import { getHomepageFeature, listPublishedArticles } from "@/lib/data";
import { formatPublishDate, readLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Stay curious. Find your perspective. | Miidasu" },
  description: "Thoughts on work, life, and the interesting things in between. Explore the Miidasu journal.",
  alternates: { canonical: "/" }
};

function Meta({category,minutes,date}:{category:string;minutes:number|null;date?:string|null}) {
  return <div className="card-meta"><span>{category}</span><span>{readLabel(minutes)}</span>{date&&<span>{formatPublishDate(date)}</span>}</div>;
}

export default async function HomePage() {
  let articles = await listPublishedArticles().catch(() => []);
  const featured = await getHomepageFeature().catch(() => null) ?? articles[0] ?? null;
  if (featured) articles = articles.filter(a => a.id !== featured.id);

  const secondary = articles.slice(0,2);
  const trending = articles.slice(2,7);
  const latest = articles.slice(7,13);

  return (
    <PageFrame current="home">
      <section className="site-wrap home-intro">
        <p className="eyebrow">IDEAS. OBSERVATIONS. POSSIBILITIES.</p>
        <h1>Stay curious. Find your <em>perspective.</em></h1>
        <p>Thoughts on work, life, and the interesting things in between. A place to pause, explore, and see things a little differently.</p>
      </section>

      <section className="site-wrap section-block">
        <div className="section-title-row"><h2>Today’s Picks</h2></div>

        <div className="picks-grid">
          <div className="picks-main">
            {featured && <article className="hero-card">
              {featured.cover_image_url && <a className="hero-media" href={"/blog/"+featured.slug+"/"}><img src={featured.cover_image_url} alt="" /></a>}
              <Meta category={featured.category} minutes={featured.read_time_minutes} date={featured.published_at}/>
              <h2><a href={"/blog/"+featured.slug+"/"}>{featured.title}</a></h2>
              <p>{featured.excerpt}</p>
            </article>}
          </div>

          <div className="picks-secondary">
            {secondary.map(a => <article className="secondary-card" key={a.id}>
              {a.cover_image_url && <a className="secondary-media" href={"/blog/"+a.slug+"/"}><img src={a.cover_image_url} alt="" /></a>}
              <Meta category={a.category} minutes={a.read_time_minutes}/>
              <h3><a href={"/blog/"+a.slug+"/"}>{a.title}</a></h3>
              <p>{a.excerpt}</p>
            </article>)}
          </div>

          <aside className="trending-panel">
            <div className="panel-title">Trending Stories</div>
            {trending.map((a,i) => <article className="trending-item" key={a.id}>
              <span>{String(i+1).padStart(2,"0")}</span>
              <div>
                <Meta category={a.category} minutes={a.read_time_minutes}/>
                <h3><a href={"/blog/"+a.slug+"/"}>{a.title}</a></h3>
              </div>
            </article>)}
          </aside>
        </div>
      </section>

      <section className="site-wrap section-block">
        <div className="section-title-row"><h2>From the Journal</h2><a href="/blog/">View all</a></div>
        <div className="latest-grid">
          {latest.map(a => <article className="latest-card" key={a.id}>
            {a.cover_image_url && <a className="latest-media" href={"/blog/"+a.slug+"/"}><img src={a.cover_image_url} alt="" /></a>}
            <Meta category={a.category} minutes={a.read_time_minutes}/>
            <h3><a href={"/blog/"+a.slug+"/"}>{a.title}</a></h3>
            <p>{a.excerpt}</p>
          </article>)}
        </div>
      </section>

      <section className="site-wrap quote-band">
        <p className="eyebrow">MIIDASU</p>
        <h2>A little curiosity goes a long way.</h2>
        <p>Start with whatever catches your attention, stay with a thought for a while, and see where it takes you.</p>
      </section>
    </PageFrame>
  );
}
