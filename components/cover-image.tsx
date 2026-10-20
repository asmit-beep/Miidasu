// These widths match the allowlist in next.config.ts.
const imageWidths=[96,128,160,192,256,320,360,480,640,768,960,1200,1600,1920];

const sizesByPlacement = {
  hero: "(max-width: 940px) 94vw, 55vw",
  journal: "(max-width: 940px) 94vw, 62vw",
  article: "(max-width: 940px) 94vw, 52vw",
  stack: "(max-width: 400px) 92px, (max-width: 760px) 28vw, (max-width: 940px) 155px, (max-width: 1180px) 110px, 132px",
  grid: "(max-width: 760px) 92vw, 30vw",
  related: "(max-width: 760px) 92vw, 23vw",
  stream: "(max-width: 400px) 72px, (max-width: 760px) 92px, 170px",
  feed: "(max-width: 760px) 100px, (max-width: 940px) 160px, 210px",
};

export function CoverImage({src,alt,placement,priority=false}:{
  src:string;
  alt:string;
  placement:keyof typeof sizesByPlacement;
  priority?:boolean;
}) {
  let url:URL;
  try{url=new URL(src,"https://miidasu.co");}
  catch{url=new URL("/og-default.png","https://miidasu.co");}
  const local=url.origin==="https://miidasu.co"||url.origin==="https://www.miidasu.co";
  const stored=url.origin==="https://tjtofnevzjcalolmgjfn.supabase.co"&&url.pathname.startsWith("/storage/v1/object/public/covers/");
  const source=local?url.pathname+url.search:src;
  const optimized=(width:number)=>"/_next/image?url="+encodeURIComponent(source)+"&w="+width+"&q=75";
  // Plain server-rendered markup uses Next's image service without its client component.
  // Existing third-party images remain usable without allowing arbitrary optimizer hosts.
  return <img
    src={local||stored?optimized(1200):source}
    srcSet={local||stored?imageWidths.map(w=>optimized(w)+" "+w+"w").join(", "):undefined}
    sizes={sizesByPlacement[placement]}
    alt={alt}
    width={1200}
    height={630}
    loading={priority?"eager":"lazy"}
    fetchPriority={priority?"high":undefined}
    decoding="async"
  />;
}
