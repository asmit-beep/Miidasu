import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { readSession, validOrigin } from "@/lib/admin-auth";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const MAX_BYTES=5*1024*1024;
const TYPES:Record<string,string>={
  "image/jpeg":"jpg",
  "image/png":"png",
  "image/webp":"webp"
};

function safeBaseName(name:string){
  return name
    .replace(/\.[^.]+$/,"")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-|-$/g,"")
    .slice(0,60) || "cover";
}

export async function POST(req:Request){
  if(!readSession(req))return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!validOrigin(req))return NextResponse.json({error:"Invalid origin"},{status:403});

  const url=(process.env.NEXT_PUBLIC_SUPABASE_URL||"").replace(/\/$/,"");
  const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"";
  const adminSecret=process.env.ADMIN_API_SECRET||"";
  if(!url||!anon||!adminSecret){
    return NextResponse.json({error:"Image upload is not configured."},{status:503});
  }

  let form:FormData;
  try{form=await req.formData();}
  catch{return NextResponse.json({error:"Invalid upload."},{status:400});}

  const value=form.get("file");
  if(!(value instanceof File))return NextResponse.json({error:"Choose an image to upload."},{status:400});
  if(!TYPES[value.type])return NextResponse.json({error:"Use a JPG, PNG, or WebP image."},{status:415});
  if(value.size<=0)return NextResponse.json({error:"The selected image is empty."},{status:400});
  if(value.size>MAX_BYTES)return NextResponse.json({error:"Featured images must be 5 MB or smaller."},{status:413});

  const now=new Date();
  const path=[
    String(now.getUTCFullYear()),
    String(now.getUTCMonth()+1).padStart(2,"0"),
    randomUUID()+"-"+safeBaseName(value.name)+"."+TYPES[value.type]
  ].join("/");
  const encodedPath=path.split("/").map(encodeURIComponent).join("/");
  const bytes=new Uint8Array(await value.arrayBuffer());

  const response=await fetch(url+"/storage/v1/object/covers/"+encodedPath,{
    method:"POST",
    headers:{
      apikey:anon,
      ...(anon.startsWith("eyJ")?{Authorization:"Bearer "+anon}:{}),
      "x-admin-secret":adminSecret,
      "Content-Type":value.type,
      "Cache-Control":"public, max-age=31536000, immutable",
      "x-upsert":"false"
    },
    body:bytes,
    cache:"no-store"
  });

  const body=await response.text();
  if(!response.ok){
    return NextResponse.json({
      error:"Image upload failed: "+(body.slice(0,180)||response.statusText)
    },{status:502});
  }

  const publicUrl=url+"/storage/v1/object/public/covers/"+encodedPath;
  return NextResponse.json({url:publicUrl,path},{headers:{"Cache-Control":"no-store"}});
}
