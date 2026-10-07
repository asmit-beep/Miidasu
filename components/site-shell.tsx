import type { ReactNode } from "react";

export function SiteHeader({current}:{current?:"home"|"blog"|"about"}) {
  return (
    <>
      <div className="topline">
        <div className="edge-row topline-inner">
          <span>MIIDASU JOURNAL</span>
          <div className="topline-actions">
            <a className="micro-link" href="/blog/">Latest stories</a>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="edge-row masthead-row">
          <a className="header-action reactive-button ghost-button" href="/blog/">Browse stories <span>↗</span></a>
          <a className="brand-mark" href="/" aria-label="Miidasu home">miidasu<span>.</span></a>
          <a className="header-action reactive-button solid-button" href="#newsletter">Subscribe <span>↗</span></a>
        </div>
      </header>

      <div className="nav-rule">
        <nav className="edge-row main-nav" aria-label="Main navigation">
          <a href="/" aria-current={current==="home" ? "page" : undefined}>Home</a>
          <a href="/blog/" aria-current={current==="blog" ? "page" : undefined}>Journal</a>
          <a href="/about/" aria-current={current==="about" ? "page" : undefined}>About</a>
          <a href="/contact/">Contact</a>
        </nav>
      </div>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer" id="newsletter">
      <section className="newsletter">
        <div className="edge-row newsletter-grid">
          <div className="newsletter-copy">
            <p className="eyebrow">THE MIIDASU LETTER</p>
            <h2>Stay curious. Keep a fresh perspective.</h2>
            <p>A small note when there is something worth reading.</p>
          </div>
          <form className="newsletter-form" action="/api/subscribe/" method="post">
            <label htmlFor="newsletter-email">Email address</label>
            <div className="newsletter-input-row">
              <input id="newsletter-email" name="email" type="email" placeholder="you@example.com" required />
              <button className="reactive-button newsletter-button" type="submit">Subscribe <span>↗</span></button>
            </div>
            <p>Occasional notes from the journal. No noise.</p>
          </form>
        </div>
      </section>

      <div className="footer-main">
        <div className="edge-row footer-grid">
          <div className="footer-brand-block">
            <a className="footer-brand" href="/">miidasu<span>.</span></a>
            <p>Independent ideas, explainers, and perspectives on modern work, technology, and the systems around them.</p>
            <a className="footer-email" href="mailto:hello@miidasu.co">hello@miidasu.co</a>
          </div>

          <div className="footer-col">
            <span>Explore</span>
            <a href="/">Home</a>
            <a href="/blog/">Journal</a>
            <a href="/about/">About</a>
          </div>

          <div className="footer-col">
            <span>Information</span>
            <a href="/contact/">Contact</a>
            <a href="#newsletter">Newsletter</a>
          </div>

          <div className="footer-col">
            <span>Legal</span>
            <a href="/privacy/">Privacy</a>
            <a href="/terms/">Terms</a>
            <a href="/cookies/">Cookies</a>
          </div>
        </div>

        <div className="edge-row footer-bottom">
          <span>© 2026 Miidasu. All rights reserved.</span>
          <span>miidasu.co</span>
        </div>
      </div>
    </footer>
  );
}

export function PageFrame({children,current}:{children:ReactNode;current?:"home"|"blog"|"about"}) {
  return <><SiteHeader current={current}/><main id="main">{children}</main><SiteFooter/></>;
}
