import { NextResponse } from "next/server";
import { readSession, validOrigin } from "@/lib/admin-auth";
export const runtime="nodejs";
export const dynamic="force-dynamic";

function googleDocId(value:string){
  try{
    const url=new URL(value.trim());
    if(url.hostname==="docs.google.com"){
      const match=url.pathname.match(/^\/document\/(?:u\/\d+\/)?d\/([A-Za-z0-9_-]{12,160})(?:\/|$)/);
      if(match)return match[1];
    }
    if(url.hostname==="drive.google.com"){
      const id=url.searchParams.get("id");
      if(id&&/^[A-Za-z0-9_-]{12,160}$/.test(id))return id;
      const match=url.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]{12,160})(?:\/|$)/);
      if(match)return match[1];
    }
  }catch{}
  return null;
}

function looksLikeGoogleLogin(text:string,responseUrl:string){
  const sample=text.slice(0,1200).toLowerCase();
  return responseUrl.includes("accounts.google.com") ||
    sample.includes("servicelogin") ||
    sample.includes("sign in to continue") ||
    sample.includes("request access");
}

export async function POST(req:Request){
  if(!readSession(req))return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!validOrigin(req))return NextResponse.json({error:"Invalid origin"},{status:403});

  let submitted="";
  try{const body=await req.json();submitted=String(body.url||"").trim();}
  catch{return NextResponse.json({error:"Invalid request"},{status:400});}

  const id=googleDocId(submitted);
  if(!id)return NextResponse.json({error:"Paste a Google Docs share link (docs.google.com/document/…)."},{"status":400});

  const url="https://docs.google.com/document/d/"+encodeURIComponent(id)+"/export?format=txt";
  try{
    const response=await fetch(url,{
      cache:"no-store",
      redirect:"follow",
      signal:AbortSignal.timeout(18000),
      headers:{
        Accept:"text/plain,application/octet-stream;q=0.9,*/*;q=0.5",
        "User-Agent":"Miidasu-Editorial-Importer/1.0"
      }
    });
    const content=(await response.text()).replace(/\r\n?/g,"\n").trim();

    if(!response.ok||looksLikeGoogleLogin(content,response.url)){
      return NextResponse.json({
        error:"Google could not export this document. Set the Doc to “Anyone with the link – Viewer”, then try again."
      },{status:422});
    }
    if(!content)return NextResponse.json({error:"The Google Doc is empty or could not be read."},{status:422});
    if(content.length>2500000)return NextResponse.json({error:"Document is too large"},{status:413});

    return NextResponse.json({content},{headers:{"Cache-Control":"no-store"}});
  }catch{
    return NextResponse.json({error:"Google Doc import is temporarily unavailable. Try again in a moment."},{status:502});
  }
}
