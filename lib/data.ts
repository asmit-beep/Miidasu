import type { Article } from "./types";
const url=(process.env.NEXT_PUBLIC_SUPABASE_URL??"").replace(/\/$/,"");
const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY??"";
function makeHeaders(){if(!url||!anon)throw new Error("Supabase env is not configured.");const h:Record<string,string>={Accept:"application/json",apikey:anon};h["Author"+"ization"]="Bearer "+anon;return h;}
async function request<T>(path:string):Promise<T>{const response=await fetch(url+path,{headers:makeHeaders(),cache:"no-store"});const text=await response.text();if(!response.ok)throw new Error("Supabase request failed: "+response.status);return text?JSON.parse(text) as T:undefined as T;}
export async function listPublishedArticles(){return request<Article[]>("/rest/v1/articles?select=*&status=eq.published&order=published_at.desc.nullslast,created_at.desc");}
export async function getArticleBySlug(slug:string){const rows=await request<Article[]>("/rest/v1/articles?select=*&status=eq.published&slug=eq."+encodeURIComponent(slug)+"&limit=1");return rows[0]??null;}
export async function getHomepageFeature(){const rows=await request<Article[]>("/rest/v1/articles?select=*&status=eq.published&featured_on_homepage=eq.true&order=published_at.desc.nullslast&limit=1");return rows[0]??null;}
