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

// Use the browser's decoder, not just HTTP status or the file extension.
// This also catches a 200 response containing an empty or corrupt image.
async function validateCoverImage(src:string):Promise<void>{
  if(!src.trim())return;
  await new Promise<void>((resolve,reject)=>{
    const image=new Image();
    let settled=false;
    const finish=(error?:Error)=>{
      if(settled)return;
      settled=true;
      window.clearTimeout(timer);
      image.onload=null;image.onerror=null;
      if(error)reject(error);else resolve();
    };
    const timer=window.setTimeout(()=>finish(new Error("The featured image took too long to load. Try again or upload it from your computer.")),12000);
    image.onerror=()=>finish(new Error("The featured image is empty, broken, or not a valid image. Upload a working image before saving."));
    image.onload=()=>{
      if(!image.naturalWidth||!image.naturalHeight){
        finish(new Error("The featured image has no visible content. Choose another image."));
        return;
      }
      image.decode().then(()=>finish(),()=>finish(new Error("The featured image could not be decoded. Upload a JPG, PNG, or WebP image.")));
    };
    image.src=src;
  });
}

export function AdminWorkspace({initial,canPublish}:{initial:AdminItem[];canPublish:boolean}){
  const [items,setItems]=useState(initial);
  const [selected,setSelected]=useState<number|"new">("new");
  const [article,setArticle]=useState<Partial<AdminItem>>(emptyArticle());
  const [query,setQuery]=useState("");
  const [saving,setSaving]=useState(false);
  const [notice,setNotice]=useState("");
  const [importUrl,setImportUrl]=useState("");
  const [importing,setImporting]=useState(false);
  const [uploadingImage,setUploadingImage]=useState(false);
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
    if(saving||uploadingImage){setNotice("Wait for the image upload or current save to finish.");return;}
    if(!canPublish){setNotice("Publishing is not connected. Your changes remain in this browser only. Contact the site administrator to reconnect Supabase.");return;}
    setSaving(true);setNotice("");
    try{
      await validateCoverImage(String(article.cover_image_url||"").trim());
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
  async function uploadCover(file:File|null){
    if(!file||saving||uploadingImage)return;
    setUploadingImage(true);setNotice("");
    try{
      const localUrl=URL.createObjectURL(file);
      try{await validateCoverImage(localUrl);}finally{URL.revokeObjectURL(localUrl);}
      const form=new FormData();
      form.set("file",file);
      const res=await fetch("/admin/api/upload",{
        method:"POST",body:form,credentials:"same-origin"
      });
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||"Image upload failed");
      await validateCoverImage(String(data.url));
      update("cover_image_url",data.url as AdminItem["cover_image_url"]);
      setNotice("Featured image uploaded. Save the article to keep this image.");
    }catch(e){setNotice(e instanceof Error?e.message:"Unable to upload image");}
    finally{setUploadingImage(false);}
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
                <button disabled={saving||uploadingImage||!canPublish} type="submit">{saving?"Saving…":article.status==="published"?"Save changes":"Save draft"}</button>
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
            <div className="admin-cover-section">
              <div className="admin-cover-head">
                <div>
                  <strong>Featured image</strong>
                  <span>Upload JPG, PNG or WebP · max 5 MB</span>
                </div>
                <label className={"admin-upload-button"+(uploadingImage?" is-loading":"")}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploadingImage||saving}
                    onChange={e=>{const file=e.target.files?.[0]||null;void uploadCover(file);e.currentTarget.value="";}}
                  />
                  {uploadingImage?"Uploading…":"Upload from computer"}
                </label>
              </div>
              {article.cover_image_url
                ? <div className="admin-cover-preview">
                    <img src={article.cover_image_url} alt="Featured image preview"/>
                    <button type="button" onClick={()=>update("cover_image_url","")}>Remove</button>
                  </div>
                : <div className="admin-cover-empty">No featured image selected yet.</div>}
              <label className="admin-field admin-cover-url">Image URL <span>(optional fallback)</span>
                <input type="url" value={article.cover_image_url||""} onChange={e=>update("cover_image_url",e.target.value)} placeholder="https://…"/>
              </label>
            </div>
            <div className="admin-form-grid">
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
              <button type="submit" disabled={saving||uploadingImage||!canPublish}>{saving?"Saving…":"Save article"}</button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
