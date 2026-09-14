import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
 return ['', '/impressum', '/datenschutz'].map(path => ({url: `https://www.gold-finder.com${path}`, lastModified: new Date()}));
}
