import { NextResponse } from "next/server";
export function GET(req:Request){return NextResponse.redirect(new URL("/opengraph-image",req.url),307)}
