import type { MetadataRoute } from "next";

const blocked=["/admin","/admin/","/api/admin","/api/admin/","/api/auth"];

export default function robots():MetadataRoute.Robots{
  return {
    rules:[
      {userAgent:"*",allow:"/",disallow:blocked},
      {userAgent:"GPTBot",allow:"/",disallow:blocked},
      {userAgent:"OAI-SearchBot",allow:"/",disallow:blocked},
      {userAgent:"ChatGPT-User",allow:"/",disallow:blocked},
      {userAgent:"ClaudeBot",allow:"/",disallow:blocked},
      {userAgent:"anthropic-ai",allow:"/",disallow:blocked},
      {userAgent:"PerplexityBot",allow:"/",disallow:blocked},
      {userAgent:"Google-Extended",allow:"/",disallow:blocked},
      {userAgent:"Googlebot",allow:"/",disallow:blocked}
    ],
    sitemap:"https://miidasu.co/sitemap.xml"
  };
}
