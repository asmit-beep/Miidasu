import type { MetadataRoute } from "next";
export default function robots():MetadataRoute.Robots{return{rules:[{userAgent:"*",allow:"/"},{userAgent:"GPTBot",allow:"/"},{userAgent:"Google-Extended",allow:"/"},{userAgent:"PerplexityBot",allow:"/"},{userAgent:"ClaudeBot",allow:"/"}],sitemap:"https://miidasu.co/sitemap.xml"}}
