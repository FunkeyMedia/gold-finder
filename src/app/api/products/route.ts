import {isBullionListing} from '@/lib/product-quality';
import { NextResponse } from 'next/server';
import { getAmazonProducts, MARKETPLACES } from '@/lib/amazon';
import type { Marketplace } from '@/lib/types';
export const runtime='nodejs';export const maxDuration=60;
export async function GET(request:Request){const url=new URL(request.url);const override=url.searchParams.get('market');const country=(request.headers.get('x-vercel-ip-country')||'DE').toUpperCase();const detected:Marketplace=country==='US'?'us':country==='GB'?'uk':'de';const requested=override||detected;if(!(Object.hasOwn(MARKETPLACES,requested)))return NextResponse.json({error:'Unsupported marketplace'},{status:400});const data=await getAmazonProducts(requested as Marketplace);data.products=data.products.filter(p=>isBullionListing(p.title,p.features,p.asin));data.count=data.products.length;const hasProducts=data.products.length>0;return NextResponse.json(data,{status:hasProducts?200:503,headers:{'Cache-Control':hasProducts&&override?'public, s-maxage=300, stale-while-revalidate=86400':'no-store, max-age=0'}});}
