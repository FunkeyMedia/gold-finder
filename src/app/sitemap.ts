import type { MetadataRoute } from 'next';
import {seoPages} from '@/lib/seo-pages';
export default function sitemap(): MetadataRoute.Sitemap {
 const updated=new Date('2026-09-14');
 return [...['', '/impressum', '/datenschutz'].map(path => ({url: `https://www.gold-finder.com${path}`, lastModified: updated})),...seoPages.map(page=>({url:`https://www.gold-finder.com/${page.slug.join('/')}`,lastModified:updated,changeFrequency:'monthly' as const,priority:page.slug[0]==='guides'||page.slug[0]==='coins'?0.8:0.9}))];
}
