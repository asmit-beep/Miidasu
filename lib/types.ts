export type Article={id:number;title:string;slug:string;excerpt:string;content:string;status:"draft"|"published";meta_title:string;meta_description:string;category:string;author:string;cover_image_url:string;featured_on_homepage:boolean;read_time_minutes:number|null;published_at:string|null;updated_at:string;created_at:string};

export const AUTHORS=[
  {key:"ata",name:"Ata Shaikh",bio:"Ata Shaikh writes for Miidasu, exploring useful ideas with a clear, practical point of view."},
  {key:"snehil",name:"Snehil Srivastava",bio:"Snehil Srivastava writes about the everyday choices that help attention find its place. The focus is practical: small adjustments that make room for clearer work and a little more presence."},
  {key:"yash",name:"Yash",bio:"Yash looks at how perspectives change when an idea is given a small, deliberate beginning. The writing follows possibilities as they take shape, one useful step at a time."}
] as const;
