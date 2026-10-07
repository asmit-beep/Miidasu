import type { Metadata } from "next";
import { PageFrame } from "@/components/site-shell";
import { AUTHORS } from "@/lib/types";

export const metadata:Metadata={
  title:"Authors",
  description:"Meet the contributors writing for the Miidasu journal.",
  alternates:{canonical:"/authors/"}
};

export default function AuthorsPage(){
  return <PageFrame>
    <header className="journal-header">
      <p className="eyebrow">MIIDASU / CONTRIBUTORS</p>
      <h1>Meet the <em>authors.</em></h1>
      <p>Three perspectives contributing to the Miidasu journal.</p>
    </header>
    <section className="authors-section">
      <div className="author-grid">
        {AUTHORS.map(author=><article key={author.key}>
          <p className="eyebrow">CONTRIBUTOR</p>
          <h3><a href={"/authors/"+author.key+"/"}>{author.name}</a></h3>
          <p>{author.bio}</p>
          <a className="reactive-button text-button" href={"/authors/"+author.key+"/"}>View stories <span>↗</span></a>
        </article>)}
      </div>
    </section>
  </PageFrame>;
}
