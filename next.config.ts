import type { NextConfig } from "next";

const nextConfig:NextConfig={
  trailingSlash:true,
  images:{
    remotePatterns:[{protocol:"https",hostname:"tjtofnevzjcalolmgjfn.supabase.co"}]
  },
  async redirects(){
    return [
      {source:"/authors/nikita",destination:"/authors/ata",permanent:true},
      {source:"/authors/nikita/",destination:"/authors/ata/",permanent:true}
];
  }
};

export default nextConfig;
