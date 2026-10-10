import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminConfigReady, validSession } from "@/lib/admin-auth";
import { listAdminArticles, publishingEnabled } from "@/lib/admin-data";
import { AdminWorkspace } from "@/components/admin-workspace";
import "./admin.css";

export const dynamic="force-dynamic";
export const runtime="nodejs";
export const metadata:Metadata={
  title:"Editorial Studio | Miidasu",
  robots:{index:false,follow:false,noarchive:true}
};

export default async function AdminPage({searchParams}:{searchParams:Promise<{error?:string}>}){
  const cookieStore=await cookies();
  const authed=validSession(cookieStore.get(ADMIN_COOKIE)?.value);
  const params=await searchParams;
  if(!authed){
    return <div className="admin-app admin-login-page">
      <div className="admin-login">
        <a href="/" className="admin-logo">miidasu<span>.</span></a>
        <p className="admin-eyebrow">PRIVATE EDITORIAL ACCESS</p>
        <h1>Editorial Studio</h1>
        <p className="admin-login-intro">Sign in to manage the Miidasu journal.</p>
        {!adminConfigReady()&&<p className="admin-warning">Admin login configuration needs attention. The public website is unaffected.</p>}
        {params.error&&<p className="admin-error" role="alert">Incorrect login credentials. Please try again.</p>}
        <form action="/admin/api/login" method="post">
          <label className="admin-field">Login ID <input name="username" autoComplete="username" defaultValue="admin" required/></label>
          <label className="admin-field">Password <input type="password" name="password" autoComplete="current-password" required/></label>
          <button type="submit" className="admin-sign-in" disabled={!adminConfigReady()}>Sign in securely →</button>
        </form>
        <a className="admin-back" href="/">← Back to Miidasu</a>
      </div>
    </div>;
  }
  let articles=await listAdminArticles().catch(()=>[]);
  articles=articles||[];
  return <AdminWorkspace initial={articles} canPublish={publishingEnabled()}/>;
}
