"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TocHeading } from "@/lib/format";

export function ArticleToc({headings}:{headings:TocHeading[]}) {
  const ids=useMemo(()=>headings.map(h=>h.id),[headings]);
  const [active,setActive]=useState(ids[0]||"");
  const linksRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    if(!ids.length)return;

    const updateActive=()=>{
      let current=ids[0]||"";
      const threshold=Math.max(120,window.innerHeight*.22);

      for(const id of ids){
        const el=document.getElementById(id);
        if(!el)continue;
        if(el.getBoundingClientRect().top<=threshold)current=id;
        else break;
      }

      if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-6){
        current=ids[ids.length-1]||current;
      }

      setActive(current);
    };

    updateActive();
    window.addEventListener("scroll",updateActive,{passive:true});
    window.addEventListener("resize",updateActive);

    return ()=>{
      window.removeEventListener("scroll",updateActive);
      window.removeEventListener("resize",updateActive);
    };
  },[ids]);

  useEffect(()=>{
    const container=linksRef.current;
    if(!container||!active)return;

    const link=container.querySelector<HTMLAnchorElement>('a[data-toc-id="'+active+'"]');
    if(!link)return;

    const target=link.offsetTop-(container.clientHeight/2)+(link.offsetHeight/2);
    container.scrollTo({
      top:Math.max(0,target),
      behavior:"smooth"
    });
  },[active]);

  if(!headings.length)return null;

  return (
    <nav className="article-toc" aria-label="Table of contents">
      <div className="toc-head">
        <span>On this page</span>
        <span>{headings.length}</span>
      </div>
      <div className="toc-links" ref={linksRef}>
        {headings.map(item=>(
          <a
            key={item.id}
            data-toc-id={item.id}
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
