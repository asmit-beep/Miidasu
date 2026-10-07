"use client";

import { useEffect, useMemo, useState } from "react";
import type { TocHeading } from "@/lib/format";

export function ArticleToc({headings}:{headings:TocHeading[]}) {
  const ids=useMemo(()=>headings.map(h=>h.id),[headings]);
  const [active,setActive]=useState(ids[0]||"");

  useEffect(()=>{
    if(!ids.length)return;
    const elements=ids.map(id=>document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if(!elements.length)return;

    const observer=new IntersectionObserver((entries)=>{
      const visible=entries
        .filter(entry=>entry.isIntersecting)
        .sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
      if(visible[0]?.target?.id)setActive(visible[0].target.id);
    },{
      rootMargin:"-18% 0px -68% 0px",
      threshold:[0,1]
    });

    elements.forEach(el=>observer.observe(el));
    return ()=>observer.disconnect();
  },[ids]);

  if(!headings.length)return null;

  return (
    <nav className="article-toc" aria-label="Table of contents">
      <div className="toc-head">
        <span>On this page</span>
        <span>{headings.length}</span>
      </div>
      <div className="toc-links">
        {headings.map(item=>(
          <a
            key={item.id}
            className={(item.level===3?"toc-link toc-link-sub":"toc-link")+(active===item.id?" is-active":"")}
            href={"#"+item.id}
            onClick={()=>setActive(item.id)}
          >
            <span>{item.text}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
