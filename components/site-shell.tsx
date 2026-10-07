import type { ReactNode } from "react";

export function SiteHeader({current}:{current?:"home"|"blog"|"about"}) {
  return (
    <>
      <div className="topline">
        <div className="site-wrap topline-inner">
          <span>MIIDASU JOURNAL</span>
          <a href="#newsletter">SUBSCRIBE</a>
        </div>
      </div>
      <header className="site-header">
        <div className="site-wrap masthead-row">
          <a className="brand-mark" href="/" aria-label="Miidasu home">miidasu<span>.</span></a>
        </div>
        <div className="nav-rule">
          <nav className="site-wrap main-nav" aria-label="Main navigation">
            <a href="/" aria-current={current==="home" ? "page" : undefined}>Home</a>
            <a href="/blog/" aria-current={current==="blog" ? "page" : undefined}>Journal</a>
            <a href="/about/" aria-current={current==="about" ? "page" : undefined}>About</a>
            <a href="/authors/yash/">Authors</a>
            <a href="/contact/">Contact</a>
          </nav>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer" id="newsletter">
      <section className="newsletter">
        <div className="site-wrap newsletter-grid">
          <div>
            <p className="eyebrow">THE MIIDASU LETTER</p>
            <h2>Stay curious. Keep a fresh perspective.</h2>
          </div>
          <form className="newsletter-form" action="/api/subscribe/" method="post">
            <label htmlFor="newsletter-email">Email address</label>
            <div className="newsletter-input-row">
              <input id="newsletter-email" name="email" type="email" placeholder="you@example.com" required />
              <button type="submit">Subscribe</button>
            </div>
            <p>Occasional notes from the journal. No noise.</p>
          </form>
        </div>
      </section>

      <div className="footer-main">
        <div className="site-wrap footer-grid">
          <a className="footer-brand" href="/">miidasu<span>.</span></a>
          <div className="footer-col"><span>Explore</span><a href="/">Home</a><a href="/blog/">Journal</a><a href="/about/">About</a></div>
          <div className="footer-col"><span>More</span><a href="/contact/">Contact</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/cookies/">Cookies</a></div>
          <div className="footer-note"><p>A little space for a different perspective.</p><small>© 2026 Miidasu</small></div>
        </div>
      </div>
    </footer>
  );
}

export function PageFrame({children,current}:{children:ReactNode;current?:"home"|"blog"|"about"}) {
  return <><SiteHeader current={current}/><main id="main">{children}</main><SiteFooter/></>;
}
