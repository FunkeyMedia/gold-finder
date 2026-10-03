import type {MetadataRoute} from 'next';
import {manufacturerPages,manufacturerAlternates} from '@/lib/manufacturer-products';
import {seoPages} from '@/lib/seo-pages';
import {origin,productPages,productAlternates,regions,markets,hubAlternates,reviewed} from '@/lib/product-catalogue';
export default function sitemap():MetadataRoute.Sitemap{
 const productPaths=new Set(productPages.map(p=>p.path));
 return [
  ...['','/guides'].map(path=>({url:`${origin}${path}`,lastModified:reviewed})),
  ...['/impressum','/datenschutz'].map(path=>({url:`${origin}${path}`,lastModified:reviewed})),
  ...seoPages.filter(p=>!productPaths.has(`/${p.slug.join('/')}`)).map(p=>({url:`${origin}/${p.slug.join('/')}`,lastModified:['us/buy-gold','uk/buy-gold','de/gold-kaufen'].includes(p.slug.join('/'))?reviewed:'2026-09-26'})),
  ...regions.map(r=>({url:`${origin}${markets[r].hub}`,lastModified:reviewed,alternates:{languages:hubAlternates()}})),
  ...manufacturerPages.map(({product,path})=>({url:`${origin}${path}`,lastModified:product.checked,alternates:{languages:manufacturerAlternates(product)}})),
  ...productPages.map(({product,region,path})=>({url:`${origin}${path}`,lastModified:reviewed,alternates:{languages:productAlternates(product)}})),
 ];
}
