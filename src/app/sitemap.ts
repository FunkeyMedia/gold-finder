import type { MetadataRoute } from 'next';
import {seoPages} from '@/lib/seo-pages';
export default function sitemap(): MetadataRoute.Sitemap {
 const updated=new Date('2026-09-26');
 const legalUpdated=new Date('2026-09-15');
 return [...['', '/guides'].map(path => ({url: `https://www.gold-finder.com${path}`, lastModified: updated})),...['/impressum', '/datenschutz'].map(path => ({url: `https://www.gold-finder.com${path}`, lastModified: legalUpdated})),...seoPages.map(page=>({url:`https://www.gold-finder.com/${page.slug.join('/')}`,lastModified:updated}))];
}
