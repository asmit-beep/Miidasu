import { NextResponse } from "next/server";
import { readSession, validOrigin } from "@/lib/admin-auth";
export const runtime="nodejs";

export async function POST(req:Request){
  if(!readSession(req))return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!validOrigin(req))return NextResponse.json({error:"Invalid origin"},{status:403});
  let submitted="";
  try{const body=await req.json();submitted=String(body.url||"");}
  catch{return NextResponse.json({error:"Invalid request"},{status:400});}
  const match=submitted.match(/^https:\/\/docs\.google\.com\/document\/d\/([A-Za-z0-9_-]{12,160})(?:\/|\?|$)/);
  if(!match)return NextResponse.json({error:"Use a Google Docs document link"},{status:400});
  const url="https://docs.google.com/document/d/"+encodeURIComponent(match[1])+"/export?format=txt";
  try{
    const response=await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(14000)});
    if(!response.ok||!response.headers.get("content-type")?.includes("text/plain")){
      return NextResponse.json({error:"This document could not be imported. It may require private Google account access. You can paste the text manually."},{status:422});
    }
    const content=await response.text();
    if(content.length>2500000)return NextResponse.json({error:"Document is too large"},{status:413});
    return NextResponse.json({content},{headers:{"Cache-Control":"no-store"}});
  }catch{
    return NextResponse.json({error:"Google Doc import is unavailable. Paste the content manually."},{status:502});
  }
}
