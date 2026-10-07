import type { Metadata } from "next";
import { PageFrame } from "@/components/site-shell";
export const metadata:Metadata={title:"Cookies",description:"How Miidasu uses cookies.",alternates:{canonical:"/cookies/"}};
export default function Page(){return <PageFrame><header className="journal-header"><p className="kicker">LEGAL</p><h1>Cookies</h1><p>What cookies we use and why.</p></header><section className="text-page"><p>Miidasu uses cookies that are necessary for security and basic site operation.</p><p>We may use privacy-friendly analytics cookies to understand traffic. You can control or delete cookies in your browser settings.</p><p>For more detail, see our <a href="/privacy/">Privacy Policy</a>.</p></section></PageFrame>}
