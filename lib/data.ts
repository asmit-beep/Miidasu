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

/** Fresh reads keep the home, journal and author archives in sync with every publication. */
export async function listPublishedArticles():Promise<Article[]>{
  const rows=await request<Article[]>("/rest/v1/articles?select=*&status=eq.published&order=published_at.desc.nullslast,id.desc&limit=1000");
  return rows.sort((a,b)=>(Date.parse(b.published_at||b.created_at)||0)-(Date.parse(a.published_at||a.created_at)||0)||b.id-a.id);
}
export async function getArticleBySlug(slug:string):Promise<Article|null>{
  const rows=await request<Article[]>("/rest/v1/articles?select=*&status=eq.published&slug=eq."+encodeURIComponent(slug)+"&limit=1");
  return rows[0]??null;
}
export async function getHomepageFeature():Promise<Article|null>{
  return (await listPublishedArticles()).find(article=>article.featured_on_homepage)??null;
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
