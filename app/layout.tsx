import type { Metadata, Viewport } from "next";
import "./globals.css";
const siteUrl="https://miidasu.co";
export const viewport:Viewport={themeColor:"#2d43de",width:"device-width",initialScale:1};
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:"Miidasu",template:"%s | Miidasu"},description:"Thoughts on work, life, and the interesting things in between. Explore the Miidasu journal.",openGraph:{siteName:"Miidasu",type:"website",images:["/og-default.png"]},twitter:{card:"summary_large_image",images:["/og-default.png"]},verification:{google:"4UXGsj5-dTr_Scg-u6qVs-niWmMANxLqcZRtKbtW62I"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a>{children}</body></html>}
