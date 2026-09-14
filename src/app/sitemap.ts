import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  return ['','finder','guide','about','faq','disclosure','privacy'].map(p=>({url:`https://gold-finder.vercel.app/${p}`,lastModified:new Date()}));
}
