import { NextResponse } from "next/server";
import { ADMIN_COOKIE, cookieSettings, validOrigin } from "@/lib/admin-auth";
export const runtime="nodejs";
export async function POST(req:Request){
  if(!validOrigin(req))return new Response("Invalid origin",{status:403});
  const res=NextResponse.redirect(new URL("/admin/",req.url),{status:303});
  res.cookies.set(ADMIN_COOKIE,"",{...cookieSettings(),maxAge:0});
  return res;
}
