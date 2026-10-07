import type { Metadata } from "next";
import { PageFrame } from "@/components/site-shell";
import { getHomepageFeature, listPublishedArticles } from "@/lib/data";
import { AUTHORS } from "@/lib/types";
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

function ArticleLink({href,label}:{href:string;label:string}) {
  return <a className="reactive-button text-button" href={href}>{label}<span>↗</span></a>;
}

export default async function HomePage() {
  let articles = await listPublishedArticles().catch(() => []);
  const featured = await getHomepageFeature().catch(() => null) ?? articles[0] ?? null;
  if (featured) articles = articles.filter(a => a.id !== featured.id);

  const secondary = articles.slice(0,2);
  const trending = articles.slice(2,7);
  const latest = articles.slice(7,13);
  const quick = articles.filter(a => (a.read_time_minutes ?? 99) <= 10).slice(0,4);
  const deep = articles.filter(a => (a.read_time_minutes ?? 0) >= 15).slice(0,3);
  const stream = articles.slice(0,10);

  const allForStats = featured ? [featured, ...articles] : articles;
  const totalStories = allForStats.length;
  const avgRead = totalStories
    ? Math.max(1, Math.round(allForStats.reduce((sum,a)=>sum+(a.read_time_minutes ?? 0),0) / totalStories))
    : 0;

  const categoryCounts = new Map<string,number>();
  for (const a of allForStats) {
    const key = a.category || "Journal";
    categoryCounts.set(key,(categoryCounts.get(key) ?? 0)+1);
  }
  const categoryMix = Array.from(categoryCounts.entries())
    .sort((a,b)=>b[1]-a[1])
    .slice(0,5);

  const quickCount = allForStats.filter(a => (a.read_time_minutes ?? 99) <= 10).length;
  const deepCount = allForStats.filter(a => (a.read_time_minutes ?? 0) >= 15).length;
  const mediumCount = Math.max(0,totalStories-quickCount-deepCount);

  const authorCounts = AUTHORS.map(author => ({
    ...author,
    count: allForStats.filter(a => a.author.toLowerCase().includes(author.name.toLowerCase().split(" ")[0])).length
  }));

  return (
    <PageFrame current="home">
      <section className="full-bleed home-intro">
        <div className="edge-row intro-grid">
          <div>
            <p className="eyebrow">IDEAS. OBSERVATIONS. POSSIBILITIES.</p>
            <h1>Stay curious. Find your <em>perspective.</em></h1>
          </div>
          <div className="intro-side">
            <p>Thoughts on work, life, and the interesting things in between. A place to pause, explore, and see things a little differently.</p>
            <ArticleLink href="/blog/" label="Explore the journal"/>
          </div>
        </div>
      </section>

      <section className="full-bleed section-shell">
        <div className="edge-row">
          <div className="section-title-row"><h2>Today’s Picks</h2><span>Curated from the journal</span></div>

          <div className="picks-grid">
            <div className="picks-main">
              {featured && <article className="hero-card">
                {featured.cover_image_url && <a className="hero-media" href={"/blog/"+featured.slug+"/"}><img src={featured.cover_image_url} alt="" /></a>}
                <Meta category={featured.category} minutes={featured.read_time_minutes} date={featured.published_at}/>
                <h2><a href={"/blog/"+featured.slug+"/"}>{featured.title}</a></h2>
                <p>{featured.excerpt}</p>
                <ArticleLink href={"/blog/"+featured.slug+"/"} label="Read the story"/>
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
        </div>
      </section>

      <section className="full-bleed signal-section">
        <div className="edge-row">
          <div className="section-title-row light-row"><h2>Journal Signal</h2><span>Live view of the published library</span></div>

          <div className="signal-grid">
            <div className="signal-stat">
              <span className="signal-number">{totalStories}</span>
              <span className="signal-label">Published stories</span>
            </div>
            <div className="signal-stat">
              <span className="signal-number">{avgRead}</span>
              <span className="signal-label">Average minutes to read</span>
            </div>
            <div className="signal-stat">
              <span className="signal-number">{categoryCounts.size}</span>
              <span className="signal-label">Active themes</span>
            </div>
            <div className="signal-stat">
              <span className="signal-number">{AUTHORS.length}</span>
              <span className="signal-label">Contributors</span>
            </div>
          </div>

          <div className="infographic-grid">
            <div className="infographic-card">
              <div className="infographic-head"><span>Topic mix</span><span>{totalStories} total</span></div>
              <div className="bar-list">
                {categoryMix.map(([name,count]) => {
                  const pct = totalStories ? Math.max(8,Math.round((count/totalStories)*100)) : 0;
                  return <div className="bar-row" key={name}>
                    <div className="bar-label"><span>{name}</span><strong>{count}</strong></div>
                    <div className="bar-track"><span style={{width:pct+"%"}}/></div>
                  </div>
                })}
              </div>
            </div>

            <div className="infographic-card">
              <div className="infographic-head"><span>Reading depth</span><span>By estimated time</span></div>
              <div className="depth-stack">
                <div><span>Quick</span><strong>{quickCount}</strong><small>≤ 10 min</small></div>
                <div><span>Medium</span><strong>{mediumCount}</strong><small>11–14 min</small></div>
                <div><span>Deep</span><strong>{deepCount}</strong><small>15+ min</small></div>
              </div>
            </div>

            <div className="infographic-card author-mix-card">
              <div className="infographic-head"><span>Author mix</span><span>Current library</span></div>
              <div className="author-mix">
                {authorCounts.map(a => <div className="author-mix-row" key={a.key}>
                  <a href={"/authors/"+a.key+"/"}>{a.name}</a><strong>{a.count}</strong>
                </div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {quick.length>0 && <section className="full-bleed section-shell">
        <div className="edge-row">
          <div className="section-title-row"><h2>Quick Reads</h2><span>Shorter pieces for a fast pass</span></div>
          <div className="quick-grid">
            {quick.map((a,i)=><article className="quick-card" key={a.id}>
              <div className="quick-index">{String(i+1).padStart(2,"0")}</div>
              <Meta category={a.category} minutes={a.read_time_minutes}/>
              <h3><a href={"/blog/"+a.slug+"/"}>{a.title}</a></h3>
              <ArticleLink href={"/blog/"+a.slug+"/"} label="Open"/>
            </article>)}
          </div>
        </div>
      </section>}

      <section className="full-bleed section-shell alt-shell">
        <div className="edge-row">
          <div className="section-title-row"><h2>From the Journal</h2><a href="/blog/">View all</a></div>
          <div className="latest-grid">
            {latest.map(a => <article className="latest-card" key={a.id}>
              {a.cover_image_url && <a className="latest-media" href={"/blog/"+a.slug+"/"}><img src={a.cover_image_url} alt="" /></a>}
              <Meta category={a.category} minutes={a.read_time_minutes}/>
              <h3><a href={"/blog/"+a.slug+"/"}>{a.title}</a></h3>
              <p>{a.excerpt}</p>
            </article>)}
          </div>
        </div>
      </section>

      {deep.length>0 && <section className="full-bleed feature-band">
        <div className="edge-row">
          <div className="section-title-row light-row"><h2>Deep Reads</h2><span>Longer pieces worth staying with</span></div>
          <div className="deep-grid">
            {deep.map((a,i)=><article className="deep-card" key={a.id}>
              <div className="deep-card-top">
                <span>{String(i+1).padStart(2,"0")}</span>
                <Meta category={a.category} minutes={a.read_time_minutes}/>
              </div>
              <h3><a href={"/blog/"+a.slug+"/"}>{a.title}</a></h3>
              <p>{a.excerpt}</p>
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
              </div>
              {a.cover_image_url && <a className="stream-media" href={"/blog/"+a.slug+"/"}><img src={a.cover_image_url} alt="" /></a>}
            </article>)}
          </div>
        </div>
      </section>

      <section className="full-bleed author-feature">
        <div className="edge-row">
          <div className="section-title-row"><h2>Voices at Miidasu</h2><span>Three perspectives, one journal</span></div>
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

      <section className="full-bleed quote-band-wrap">
        <div className="edge-row quote-band">
          <p className="eyebrow">MIIDASU</p>
          <h2>A little curiosity goes a long way.</h2>
          <p>Start with whatever catches your attention, stay with a thought for a while, and see where it takes you.</p>
          <ArticleLink href="/blog/" label="Keep exploring"/>
        </div>
      </section>
    </PageFrame>
  );
}
