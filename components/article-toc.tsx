"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { TocHeading } from "@/lib/format";

export function ArticleToc({headings}:{headings:TocHeading[]}) {
  const ids=useMemo(()=>headings.map(h=>h.id),[headings]);
  const [active,setActive]=useState(ids[0]||"");
  const linksRef=useRef<HTMLDivElement>(null);
  const tocId=useId();
  const [open,setOpen]=useState(false);

  useEffect(()=>{
    if(!ids.length)return;

    const elements=ids.map(id=>document.getElementById(id));
    let frame=0;

    const updateActive=()=>{
      let current=ids[0]||"";
      const threshold=Math.max(120,window.innerHeight*.22);

      for(let index=0;index<ids.length;index++){
        const el=elements[index];
        if(!el)continue;
        if(el.getBoundingClientRect().top<=threshold)current=ids[index];
        else break;
      }

      if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-6){
        current=ids[ids.length-1]||current;
      }

      setActive(current);
    };

    const scheduleUpdate=()=>{
      if(frame)return;
      frame=window.requestAnimationFrame(()=>{frame=0;updateActive();});
    };

    updateActive();
    window.addEventListener("scroll",scheduleUpdate,{passive:true});
    window.addEventListener("resize",scheduleUpdate);

    return ()=>{
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll",scheduleUpdate);
      window.removeEventListener("resize",scheduleUpdate);
    };
  },[ids]);

  useEffect(()=>{
    const container=linksRef.current;
    if(!container||!active)return;
    if(window.matchMedia("(max-width: 760px)").matches && !open)return;

    const link=container.querySelector<HTMLAnchorElement>('a[data-toc-id="'+active+'"]');
    if(!link)return;

    const target=link.offsetTop-(container.clientHeight/2)+(link.offsetHeight/2);
    container.scrollTo({
      top:Math.max(0,target),
      behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"
    });
  },[active,open]);

  if(!headings.length)return null;

  return (
    <nav className={"article-toc"+(open?" is-open":"")} aria-label="Table of contents">
      <div className="toc-head">
        <span>On this page</span>
        <span>{headings.length}</span>
      </div>
      <button
        type="button"
        className="toc-mobile-toggle"
        aria-expanded={open}
        aria-controls={tocId}
        onClick={()=>setOpen(v=>!v)}
      >
        <span>On this page</span>
        <strong>{headings.length} sections</strong>
        <span className="toc-chevron" aria-hidden="true">⌄</span>
      </button>
      <div className="toc-links" id={tocId} ref={linksRef}>
        {headings.map(item=>(
          <a
            key={item.id}
            data-toc-id={item.id}
            className={(item.level===3?"toc-link toc-link-sub":"toc-link")+(active===item.id?" is-active":"")}
            href={"#"+item.id}
            onClick={()=>{setActive(item.id);setOpen(false);}}
          >
            <span>{item.text}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
