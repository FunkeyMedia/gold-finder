import type {MetadataRoute} from 'next';
export default function robots():MetadataRoute.Robots{return{rules:{userAgent:'*',allow:'/',disallow:'/api/'},sitemap:'https://www.gold-finder.com/sitemap.xml',host:'https://www.gold-finder.com'}}
