import type { NextConfig } from "next";

const legacyAdmin="https://miidasu-1oa4vso73-nakama8.vercel.app";

const nextConfig:NextConfig={
  images:{
    remotePatterns:[{protocol:"https",hostname:"tjtofnevzjcalolmgjfn.supabase.co"}]
  },
  async redirects(){
    return [
      {source:"/authors/nikita",destination:"/authors/ata",permanent:true},
      {source:"/authors/nikita/",destination:"/authors/ata/",permanent:true},
      {source:"/admin",destination:legacyAdmin+"/admin/",permanent:false},
      {source:"/admin/:path*",destination:legacyAdmin+"/admin/:path*",permanent:false}
    ];
  }
};

export default nextConfig;
