import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE="miidasu_admin_session";
const SESSION_SECONDS=60*60*12;

function constantEqual(a:string,b:string){
  const aBytes=Buffer.from(a,"utf8"), bBytes=Buffer.from(b,"utf8");
  return aBytes.length===bBytes.length && timingSafeEqual(aBytes,bBytes);
}
function sign(payload:string){
  const secret=process.env.ADMIN_SESSION_SECRET;
  if(!secret||secret.length<24)return null;
  return createHmac("sha256",secret).update(payload).digest("base64url");
}
export function adminConfigReady(){
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length>=24);
}
export function validPassword(password:string){
  const configured=process.env.ADMIN_PASSWORD;
  return Boolean(configured&&constantEqual(password,configured));
}
export function makeSession(){
  const payload=Buffer.from(JSON.stringify({
    time:Date.now(),nonce:randomBytes(16).toString("hex")
  })).toString("base64url");
  const signature=sign(payload);
  if(!signature)throw new Error("Admin session configuration is missing");
  return payload+"."+signature;
}
export function validSession(value:string|undefined){
  if(!value)return false;
  const dot=value.lastIndexOf(".");
  if(dot<=0)return false;
  const payload=value.slice(0,dot), signature=value.slice(dot+1);
  const expected=sign(payload);
  if(!expected||!constantEqual(signature,expected))return false;
  try{
    const data=JSON.parse(Buffer.from(payload,"base64url").toString("utf8"));
    return typeof data.time==="number" && Date.now()-data.time>=0 &&
      Date.now()-data.time < SESSION_SECONDS*1000 && typeof data.nonce==="string";
  }catch{return false;}
}
export function readSession(req:Request){
  const raw=req.headers.get("cookie")||"";
  const match=raw.split(";").map(s=>s.trim()).find(s=>s.startsWith(ADMIN_COOKIE+"="));
  return validSession(match?decodeURIComponent(match.slice(ADMIN_COOKIE.length+1)):undefined);
}
export function validOrigin(req:Request){
  const origin=req.headers.get("origin");
  if(!origin)return false;
  try{return new URL(origin).host===new URL(req.url).host;}catch{return false;}
}
export function cookieSettings(){
  return {httpOnly:true,secure:true,sameSite:"strict" as const,path:"/admin",maxAge:SESSION_SECONDS};
}
