import { marked } from "marked";

export type TocHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function formatPublishDate(iso:string|null|undefined){
  if(!iso)return null;
  const d=new Date(iso);
  if(Number.isNaN(d.getTime()))return null;
  return new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Calcutta",day:"numeric",month:"short",year:"numeric"})
    .format(d)
    .replace(/\bSept\b/,"Sep");
}

export function readLabel(minutes:number|null|undefined){
  return minutes ? minutes+" min read" : "Essay";
}

export function authorSlug(author:string){
  const a=author.trim().toLowerCase();
  if(a.includes("ata")||a.includes("nikita"))return "ata";
  if(a.includes("snehil"))return "snehil";
  if(a.includes("yash"))return "yash";
  return "";
}

export function articleSummary(article:any,max=210){
  const source=(article.excerpt||article.content||"")
    .replace(/\r?\n+/g," ")
    .replace(/[#>*_`]/g," ")
    .replace(/\s+/g," ")
    .trim();
  if(!source)return "";
  if(source.length<=max)return source;
  const cut=source.slice(0,max);
  const last=cut.lastIndexOf(" ");
  return cut.slice(0,last>max*.7?last:max).trim()+"…";
}

function cleanHeadingText(input:string){
  return input
    .replace(/!\[[^\]]*\]\([^)]+\)/g,"")
    .replace(/\[([^\]]+)\]\([^)]+\)/g,"$1")
    .replace(/[\*_~`]/g,"")
    .replace(/<[^>]+>/g,"")
    .replace(/&amp;/g,"&")
    .replace(/&lt;/g,"<")
    .replace(/&gt;/g,">")
    .replace(/&quot;/g,'"')
    .trim();
}

function headingId(text:string){
  const base=cleanHeadingText(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g,"")
    .trim()
    .replace(/\s+/g,"-")
    .replace(/-+/g,"-");
  return base || "section";
}

export function extractHeadings(markdown:string):TocHeading[]{
  const headings:TocHeading[]=[];
  const seen=new Map<string,number>();

  for(const raw of markdown.replace(/\r/g,"").split("\n")){
    const match=raw.match(/^(##|###)\s+(.+?)\s*#*$/);
    if(!match)continue;
    const text=cleanHeadingText(match[2]);
    if(!text)continue;
    const base=headingId(text);
    const count=seen.get(base)||0;
    seen.set(base,count+1);
    const id=count ? base+"-"+(count+1) : base;
    headings.push({id,text,level:match[1].length as 2|3});
  }

  return headings;
}

export function renderMarkdown(markdown:string){
  const source=(markdown||"").replace(/^#\s+.+?\n+/,"");
  const rendered=String(marked.parse(source,{gfm:true,breaks:false}));
  const seen=new Map<string,number>();

  return rendered.replace(/<h([23])>([\s\S]*?)<\/h\1>/g,(_full,level,inner)=>{
    const text=cleanHeadingText(inner);
    const base=headingId(text);
    const count=seen.get(base)||0;
    seen.set(base,count+1);
    const id=count ? base+"-"+(count+1) : base;
    return '<h'+level+' id="'+id+'">'+inner+'</h'+level+'>';
  });
}

export function markdownToHtml(markdown:string){
  return renderMarkdown(markdown);
}
