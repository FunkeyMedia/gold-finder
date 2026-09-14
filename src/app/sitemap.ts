import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  return ['','finder','guide','about','faq','disclosure','privacy'].map(p=>({url:`https://www.gold-finder.com/${p}`,lastModified:new Date()}));
}
