import { NextResponse } from "next/server";
import { readSession, validOrigin } from "@/lib/admin-auth";
import { listAdminArticles, publishingEnabled, saveAdminArticle } from "@/lib/admin-data";
export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(req:Request){
  if(!readSession(req))return NextResponse.json({error:"Unauthorized"},{status:401});
  try{
    const articles=await listAdminArticles();
    return NextResponse.json({articles,publishingEnabled:publishingEnabled()},{headers:{"Cache-Control":"no-store"}});
  }catch(e){
    return NextResponse.json({error:"Unable to load articles"},{status:503});
  }
}

export async function POST(req:Request){
  if(!readSession(req))return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!validOrigin(req))return NextResponse.json({error:"Invalid origin"},{status:403});
  if(!publishingEnabled()){
    return NextResponse.json({error:"Publishing is temporarily unavailable until the existing Supabase administrative connection is restored. No content was changed."},{status:503});
  }
  try{
    const data=await req.json();
    const article=await saveAdminArticle(data);
    return NextResponse.json({article},{headers:{"Cache-Control":"no-store"}});
  }catch(e){
    return NextResponse.json({error:e instanceof Error?e.message:"Save failed"},{status:422});
  }
}
