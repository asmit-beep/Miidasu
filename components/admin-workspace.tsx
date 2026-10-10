"use client";

import { useState } from "react";
import type { Article } from "@/lib/types";

type AdminItem=Article;
function emptyArticle():Partial<AdminItem>{
  return {
    title:"",slug:"",excerpt:"",content:"",category:"Perspectives",
    author:"Yash",status:"draft",cover_image_url:"",meta_title:"",
    meta_description:"",read_time_minutes:5,featured_on_homepage:false
  };
}
function slugify(s:string){return s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,180);}
export function AdminWorkspace({initial,canPublish}:{initial:AdminItem[];canPublish:boolean}){
  const [items,setItems]=useState(initial);
  const [selected,setSelected]=useState<number|"new">("new");
  const [article,setArticle]=useState<Partial<AdminItem>>(emptyArticle());
  const [query,setQuery]=useState("");
  const [saving,setSaving]=useState(false);
  const [notice,setNotice]=useState("");
  const [importUrl,setImportUrl]=useState("");
  const [importing,setImporting]=useState(false);
  const [tab,setTab]=useState<"edit"|"preview">("edit");
  const [dirty,setDirty]=useState(false);

  function open(a:AdminItem){
    if(dirty&&!window.confirm("Discard unsaved changes?"))return;
    setSelected(a.id);setArticle({...a});setNotice("");setDirty(false);setTab("edit");
  }
  function newArticle(){
    if(dirty&&!window.confirm("Discard unsaved changes?"))return;
    setSelected("new");setArticle(emptyArticle());setNotice("");setDirty(false);setTab("edit");
  }
  function update<K extends keyof AdminItem>(key:K,value:AdminItem[K]){
    setArticle(a=>({...a,[key]:value}));setDirty(true);
  }
  async function save(e:React.FormEvent){
    e.preventDefault();
    if(!canPublish){setNotice("Publishing is not connected. Your changes remain in this browser only. Contact the site administrator to reconnect Supabase.");return;}
    setSaving(true);setNotice("");
    try{
      const res=await fetch("/admin/api/articles",{
        method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",
        body:JSON.stringify(article)
      });
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||"Could not save");
      const saved=data.article as AdminItem;
      setItems(xs=>[saved,...xs.filter(x=>x.id!==saved.id)]);
      setArticle(saved);setSelected(saved.id);setDirty(false);
      setNotice("Article saved successfully.");
    }catch(error){setNotice(error instanceof Error?error.message:"Could not save article");}
    finally{setSaving(false);}
  }
  async function importDoc(){
    if(!importUrl.trim())return;
    setImporting(true);setNotice("");
    try{
      const res=await fetch("/admin/api/import",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({url:importUrl}),credentials:"same-origin"
      });
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||"Import failed");
      update("content",data.content as AdminItem["content"]);
      setTab("edit");setNotice("Google Doc imported into the editor. Review formatting before saving.");
    }catch(e){setNotice(e instanceof Error?e.message:"Unable to import Google Doc");}
    finally{setImporting(false);}
  }
  const filtered=items.filter(a=>(a.title+" "+a.slug+" "+a.author).toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="admin-app">
      <header className="admin-app-header">
        <div><a href="/" className="admin-logo">miidasu<span>.</span></a><span className="admin-product">Editorial Studio</span></div>
        <div className="admin-right"><a href="/" target="_blank" rel="noopener noreferrer">View website ↗</a><form method="post" action="/admin/api/logout"><button type="submit">Sign out</button></form></div>
      </header>
      <div className="admin-status" role="status">
        <span className={canPublish?"admin-dot-ok":"admin-dot-warn"}></span>
        {canPublish?"Authenticated publishing connected":"Editorial access restored · Publishing connection requires Supabase admin access"}
      </div>
      <div className="admin-workspace">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-head"><h2>Articles <small>{items.length}</small></h2><button type="button" onClick={newArticle}>+ New</button></div>
          <label className="admin-search-label">Search articles<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search titles, slugs, authors" /></label>
          <div className="admin-articles">
            {filtered.map(a=><button type="button" key={a.id} onClick={()=>open(a)} className={"admin-article-select"+(selected===a.id?" is-selected":"")}>
              <strong>{a.title}</strong><span>{a.status} · {a.author}</span>
            </button>)}
            {!filtered.length&&<p className="admin-sidebar-empty">No matching articles.</p>}
          </div>
        </aside>
        <main className="admin-editor">
          <form onSubmit={save} className="admin-editor-form">
            <div className="admin-editor-top">
              <div><p className="admin-eyebrow">CONTENT MANAGEMENT</p><h1>{selected==="new"?"New article":"Edit article"}</h1></div>
              <div className="admin-editor-actions">
                <a href={article.slug?"/blog/"+article.slug+"/":"/blog/"} target="_blank" rel="noopener noreferrer">Live view ↗</a>
                <button disabled={saving||!canPublish} type="submit">{saving?"Saving…":article.status==="published"?"Save changes":"Save draft"}</button>
              </div>
            </div>
            {!canPublish&&<p className="admin-warning">The earlier publishing backend was removed with an expired Vercel deployment. This editor is protected and can read the article library, but saves are disabled until the privileged Supabase connection is restored. Existing published content is safe.</p>}
            {notice&&<p className="admin-notice" role="status">{notice}</p>}
            <label className="admin-field">Article title
              <input value={article.title||""} onChange={e=>{
                const title=e.target.value; setArticle(a=>({...a,title,slug:selected==="new"?slugify(title):a.slug}));setDirty(true);
              }} placeholder="Enter article headline" required/>
            </label>
            <div className="admin-form-grid">
              <label className="admin-field">URL slug
                <input value={article.slug||""} onChange={e=>update("slug",slugify(e.target.value))} placeholder="article-url-slug" required/>
              </label>
              <label className="admin-field">Category
                <input value={article.category||""} onChange={e=>update("category",e.target.value)} placeholder="Perspectives"/>
              </label>
              <label className="admin-field">Author
                <select value={article.author||"Yash"} onChange={e=>update("author",e.target.value)}>
                  <option value="Yash">Yash</option><option value="Ata Shaikh">Ata Shaikh</option><option value="Snehil Srivastava">Snehil Srivastava</option>
                </select>
              </label>
              <label className="admin-field">Publication status
                <select value={article.status||"draft"} onChange={e=>update("status",e.target.value as AdminItem["status"])}>
                  <option value="draft">Draft</option><option value="published">Published</option>
                </select>
              </label>
            </div>
            <label className="admin-field">Answer-first excerpt
              <textarea rows={3} value={article.excerpt||""} onChange={e=>update("excerpt",e.target.value)} placeholder="A clear opening summary of the article"/>
            </label>
            <div className="admin-section-heading"><h2>Article content</h2><div><button type="button" className={tab==="edit"?"active":""} onClick={()=>setTab("edit")}>Markdown</button><button type="button" className={tab==="preview"?"active":""} onClick={()=>setTab("preview")}>Text preview</button></div></div>
            <div className="admin-import-row">
              <input aria-label="Google Docs link" placeholder="Paste a public Google Docs URL to import its text" value={importUrl} onChange={e=>setImportUrl(e.target.value)} />
              <button type="button" onClick={importDoc} disabled={importing}>{importing?"Importing…":"Import Doc"}</button>
            </div>
            {tab==="edit"?<textarea className="admin-markdown" value={article.content||""} onChange={e=>update("content",e.target.value)} rows={19} spellCheck={false} placeholder="# Your article\n\nWrite in Markdown…" />:<pre className="admin-text-preview">{article.content||"No article content yet."}</pre>}
            <div className="admin-form-grid">
              <label className="admin-field">Cover image URL
                <input type="url" value={article.cover_image_url||""} onChange={e=>update("cover_image_url",e.target.value)}/>
              </label>
              <label className="admin-field">Estimated read time (minutes)
                <input type="number" min={1} max={998} value={article.read_time_minutes||""} onChange={e=>update("read_time_minutes",(Number(e.target.value)||null) as AdminItem["read_time_minutes"])}/>
              </label>
            </div>
            <label className="admin-check"><input type="checkbox" checked={Boolean(article.featured_on_homepage)} onChange={e=>update("featured_on_homepage",e.target.checked)}/> Feature on homepage</label>
            <div className="admin-section-heading"><h2>Search appearance</h2></div>
            <label className="admin-field">Meta title
              <input value={article.meta_title||""} onChange={e=>update("meta_title",e.target.value)} placeholder="Defaults to article title"/>
            </label>
            <label className="admin-field">Meta description
              <textarea value={article.meta_description||""} onChange={e=>update("meta_description",e.target.value)} rows={3}/>
            </label>
            <div className="admin-editor-actions admin-bottom-actions">
              <button type="submit" disabled={saving||!canPublish}>{saving?"Saving…":"Save article"}</button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
