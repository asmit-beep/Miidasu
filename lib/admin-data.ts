import type { Article } from "./types";

function credentials(){
  const url=(process.env.NEXT_PUBLIC_SUPABASE_URL||"").replace(/\/$/,"");
  const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"";
  const adminSecret=process.env.ADMIN_API_SECRET||"";
  return {url,key:anon,adminSecret};
}
export function publishingEnabled(){
  const {url,key,adminSecret}=credentials();
  return Boolean(url&&key&&adminSecret);
}
async function request(path:string,init:RequestInit={},requiresWrite=false){
  const {url,key,adminSecret}=credentials();
  if(!url||!key)throw new Error("Database connection is missing.");
  if(requiresWrite&&!adminSecret)throw new Error("Publishing connection is unavailable. Connect the admin write secret before saving.");
  const response=await fetch(url+path,{
    ...init,
    headers:{
      "apikey":key,
      ...(key.startsWith("eyJ")?{"Authorization":"Bearer "+key}:{}),
      ...(adminSecret?{"x-admin-secret":adminSecret}:{}),
      "Content-Type":"application/json",
      Accept:"application/json",
      ...(init.headers||{})
    },
    cache:"no-store"
  });
  const body=await response.text();
  if(!response.ok)throw new Error("Database returned "+response.status+": "+body.slice(0,220));
  try{return body?JSON.parse(body):null;}catch{return null;}
}
export async function listAdminArticles():Promise<Article[]>{
  return request("/rest/v1/articles?select=*&order=created_at.desc&limit=200");
}
const editable=["title","slug","excerpt","content","status","meta_title","meta_description","category","author","cover_image_url","featured_on_homepage","read_time_minutes"] as const;

export async function saveAdminArticle(value:unknown):Promise<Article>{
  if(!value||typeof value!=="object")throw new Error("Invalid article data");
  const input=value as Record<string,unknown>;
  const title=String(input.title||"").trim();
  const slug=String(input.slug||"").trim().toLowerCase();
  if(!title||title.length>300)throw new Error("Please enter a title");
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slug.length>180)throw new Error("Use a lowercase URL slug");
  if(!["draft","published"].includes(String(input.status)))throw new Error("Invalid publication status");
  const payload:Record<string,unknown>={};
  for(const key of editable){
    if(input[key]!==undefined)payload[key]=input[key];
  }
  for(const field of ["excerpt","content","meta_title","meta_description","category","author","cover_image_url"]){
    payload[field]=String(payload[field]??"");
  }
  const cover=String(payload.cover_image_url||"").trim();
  if(cover){
    let parsed:URL;
    try{parsed=new URL(cover);}
    catch{throw new Error("Featured image must be a valid image URL or uploaded file.");}
    if(parsed.hostname==="chatgpt.com" && parsed.pathname.startsWith("/s/")){
      throw new Error("A ChatGPT share link is not an image. Upload the image from your computer instead.");
    }
  }
  payload.cover_image_url=cover;
  payload.title=title;payload.slug=slug;
  payload.featured_on_homepage=Boolean(payload.featured_on_homepage);
  const minutes=Number(payload.read_time_minutes);
  payload.read_time_minutes=Number.isFinite(minutes)&&minutes>0&&minutes<999?Math.round(minutes):null;
  payload.updated_at=new Date().toISOString();
  const id=Number(input.id);
  if(payload.featured_on_homepage===true && payload.status==="published"){
    const exclude=Number.isInteger(id)&&id>0?"&id=neq."+id:"";
    await request("/rest/v1/articles?featured_on_homepage=eq.true"+exclude,
      {method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({featured_on_homepage:false})},true);
  }
  if(!Number.isInteger(id)||id<=0){
    if(payload.status==="published")payload.published_at=new Date().toISOString();
    const rows=await request("/rest/v1/articles?select=*",
      {method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify(payload)},true);
    return rows?.[0];
  }
  if(payload.status==="published"&&!input.published_at)payload.published_at=new Date().toISOString();
  const rows=await request("/rest/v1/articles?id=eq."+id+"&select=*",
    {method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify(payload)},true);
  if(!rows?.[0])throw new Error("Article could not be saved");
  return rows[0];
}
