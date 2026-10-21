import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./responsive.css";

const siteUrl="https://miidasu.co";

export const viewport:Viewport={
  themeColor:"#2d43de",
  width:"device-width",
  initialScale:1
};

export const metadata:Metadata={
  metadataBase:new URL(siteUrl),
  title:{default:"Miidasu",template:"%s | Miidasu"},
  description:"Thoughts on work, life, and the interesting things in between. Explore the Miidasu journal.",
  icons:{
    icon:[
      {url:"/favicon-96.png",type:"image/png",sizes:"96x96"},
      {url:"/icon-192.png",type:"image/png",sizes:"192x192"},
      {url:"/favicon.ico",sizes:"16x16 32x32 48x48",type:"image/x-icon"}
    ],
    shortcut:"/favicon.ico",
    apple:{url:"/apple-touch-icon.png",sizes:"180x180",type:"image/png"}
  },
  openGraph:{siteName:"Miidasu",type:"website",images:["/og-default.png"]},
  twitter:{card:"summary_large_image",images:["/og-default.png"]},
  verification:{google:"4UXGsj5-dTr_Scg-u6qVs-niWmMANxLqcZRtKbtW62I"}
};

const siteSchema={
  "@context":"https://schema.org",
  "@graph":[
    {
      "@type":"WebSite",
      "@id":"https://miidasu.co/#website",
      "url":"https://miidasu.co/",
      "name":"Miidasu",
      "description":"Thoughts on work, life, and the interesting things in between. Explore the Miidasu journal.",
      "inLanguage":"en",
      "publisher":{"@id":"https://miidasu.co/#organization"}
    },
    {
      "@type":"Organization",
      "@id":"https://miidasu.co/#organization",
      "name":"Miidasu",
      "url":"https://miidasu.co/",
      "logo":{"@type":"ImageObject","url":"https://miidasu.co/icon-192.png"}
    }
  ]
};

export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html:JSON.stringify(siteSchema)}}
        />
        <a className="skip-link" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
