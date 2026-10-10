import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminConfigReady, cookieSettings, makeSession, validOrigin, validPassword } from "@/lib/admin-auth";

export const runtime="nodejs";

export async function POST(req:Request){
  if(!validOrigin(req))return new Response("Invalid origin",{status:403});
  if(!adminConfigReady())return new Response("Admin authentication is not configured",{status:503});
  const form=await req.formData().catch(()=>null);
  const password=String(form?.get("password")||"");
  const username=String(form?.get("username")||"admin").trim().toLowerCase();
  if(username!=="admin"||password.length>512||!validPassword(password)){
    return NextResponse.redirect(new URL("/admin/?error=invalid",req.url),{status:303});
  }
  const res=NextResponse.redirect(new URL("/admin/",req.url),{status:303});
  res.cookies.set(ADMIN_COOKIE,makeSession(),cookieSettings());
  return res;
}
