import { unstable_cache } from "next/cache";
import type { Article } from "./types";

const url=(process.env.NEXT_PUBLIC_SUPABASE_URL??"").replace(/\/$/,"");
const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY??"";
function makeHeaders(){
  if(!url||!anon)throw new Error("Supabase env is not configured.");
  const h:Record<string,string>={Accept:"application/json",apikey:anon};
  h["Author"+"ization"]="Bearer "+anon;
  return h;
}
async function request<T>(path:string):Promise<T>{
  const response=await fetch(url+path,{headers:makeHeaders(),cache:"no-store"});
  const text=await response.text();
  if(!response.ok)throw new Error("Supabase request failed: "+response.status);
  return text?JSON.parse(text) as T:undefined as T;
}

// One shared, tag-invalidated snapshot prevents a DB transfer on every public
// page request. Failed background refreshes retain the previous good snapshot.
const cachedArticles=unstable_cache(
  ()=>request<Article[]>("/rest/v1/articles?select=*&status=eq.published&order=published_at.desc.nullslast,created_at.desc"),
  ["miidasu-published-articles-v2"],
  {revalidate:300,tags:["miidasu-public-articles"]}
);

export async function listPublishedArticles():Promise<Article[]>{
  return cachedArticles();
}
export async function getArticleBySlug(slug:string):Promise<Article|null>{
  return (await cachedArticles()).find(article=>article.slug===slug)??null;
}
export async function getHomepageFeature():Promise<Article|null>{
  return (await cachedArticles()).find(article=>article.featured_on_homepage)??null;
}


/**
 * The sitemap bypasses the 5-minute public-page cache, so every successful
 * publication, edit or direct CMS import is discoverable on the next request.
 * Page through PostgREST to avoid silently losing entries after 1,000 posts.
 */
export async function listPublishedSitemapArticles(): Promise<
  Pick<Article, "slug" | "published_at" | "updated_at" | "created_at">[]
> {
  type Row = Pick<Article, "slug" | "published_at" | "updated_at" | "created_at">;
  const pageSize = 500;
  const result: Row[] = [];
  for (let offset = 0; offset < 50_000; offset += pageSize) {
    const rows = await request<Row[]>(
      "/rest/v1/articles?select=slug,published_at,updated_at,created_at" +
      "&status=eq.published&order=id.asc&limit=" + pageSize + "&offset=" + offset,
    );
    if (!Array.isArray(rows)) throw new Error("Invalid published sitemap response");
    result.push(...rows);
    if (rows.length < pageSize) return result;
  }
  throw new Error("More than 50,000 published articles: sitemap index required");
}
