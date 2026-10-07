import type { Article } from "./types";

export async function listPublishedArticles():Promise<Article[]>{return [];}
export async function getArticleBySlug(_slug:string):Promise<Article|null>{return null;}
export async function getHomepageFeature():Promise<Article|null>{return null;}
