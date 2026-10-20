import type { NextConfig } from "next";

const nextConfig:NextConfig={
  trailingSlash:true,
  images:{
    remotePatterns:[{protocol:"https",hostname:"tjtofnevzjcalolmgjfn.supabase.co",pathname:"/storage/v1/object/public/covers/**"}],
    deviceSizes:[360,480,640,768,960,1200,1600,1920],
    imageSizes:[64,96,128,160,192,256,320],
    formats:["image/webp"],
    minimumCacheTTL:86400
  },
  async redirects(){
    return [
      {source:"/authors/nikita",destination:"/authors/ata",permanent:true},
      {source:"/authors/nikita/",destination:"/authors/ata/",permanent:true}
];
  }
};

export default nextConfig;
