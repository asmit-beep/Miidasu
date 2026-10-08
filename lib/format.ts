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

export function articleSummary(article:any,_max=210){
  const excerpt=String(article.excerpt||"").trim();
  const fallback=String(article.content||"")
    .replace(/^#\s+.+?\n+/,"")
    .split(/\n\s*\n/)
    .map((part:string)=>part.trim())
    .find((part:string)=>part && !/^(#{1,6}|[-*]\s|\d+\.\s|\|)/.test(part)) || "";

  return (excerpt||fallback)
    .replace(/\r?\n+/g," ")
    .replace(/[#>*_`]/g," ")
    .replace(/\s+/g," ")
    .trim();
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
    const rawText=cleanHeadingText(match[2]);
    if(!rawText)continue;
    const text=rawText.replace(/^\d+(?:\.\d+)*[\.)]?\s+/,"").trim();
    const base=headingId(rawText);
    const count=seen.get(base)||0;
    seen.set(base,count+1);
    const id=count ? base+"-"+(count+1) : base;
    headings.push({id,text,level:match[1].length as 2|3});
  }

  return headings;
}

export function renderMarkdown(markdown:string){
  const source=(markdown||"").replace(/^#\s+.+?\n+/,"");
  let rendered=String(marked.parse(source,{gfm:true,breaks:false}));
  const seen=new Map<string,number>();

  rendered=rendered.replace(/<h([23])>([\s\S]*?)<\/h\1>/g,(_full,level,inner)=>{
    const text=cleanHeadingText(inner);
    const base=headingId(text);
    const count=seen.get(base)||0;
    seen.set(base,count+1);
    const id=count ? base+"-"+(count+1) : base;
    return '<h'+level+' id="'+id+'">'+inner+'</h'+level+'>';
  });

  rendered=rendered.replace(/<table>([\s\S]*?)<\/table>/g,(_full,inner)=>{
    const headMatch=inner.match(/<thead>[\s\S]*?<tr>([\s\S]*?)<\/tr>[\s\S]*?<\/thead>/);
    const firstRow=headMatch?.[1] || inner.match(/<tr>([\s\S]*?)<\/tr>/)?.[1] || "";
    const columns=(firstRow.match(/<(?:th|td)\b/g)||[]).length;
    const tableClass=columns>=5 ? "table-wide" : "table-compact";
    // Add mobile-only visual labels while preserving the actual table and its content.
    const labels:string[]=[];
    firstRow.replace(/<th\b[^>]*>([\s\S]*?)<\/th>/gi,(_tag,heading:string)=>{
      labels.push(cleanHeadingText(heading).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;"));
      return "";
    });
    const labeled=inner.replace(/<tbody>([\s\S]*?)<\/tbody>/gi,(_tbody,rows:string)=>{
      const decorated=rows.replace(/<tr>([\s\S]*?)<\/tr>/gi,(_row,cells:string)=>{
        let index=0;
        const tagged=cells.replace(/<td\b([^>]*)>/gi,(_tag,attrs:string)=>{
          const label=labels[index]||"Column "+(index+1);
          index++;
          return '<td'+attrs+' data-label="'+label+'">';
        });
        return '<tr>'+tagged+'</tr>';
      });
      return '<tbody>'+decorated+'</tbody>';
    });
    return '<table class="'+tableClass+'">'+labeled+'</table>';
  });

  return rendered;
}

export function markdownToHtml(markdown:string){
  return renderMarkdown(markdown);
}
