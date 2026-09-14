import { NextResponse } from 'next/server';
import { getAmazonProducts, MARKETPLACES } from '@/lib/amazon';
import type { Marketplace } from '@/lib/types';
export const runtime='nodejs';export const maxDuration=60;
export async function GET(request:Request){const requested=new URL(request.url).searchParams.get('market')||'de';if(!(requested in MARKETPLACES))return NextResponse.json({error:'Unsupported marketplace'},{status:400});const data=await getAmazonProducts(requested as Marketplace);return NextResponse.json(data,{headers:{'Cache-Control':'public, s-maxage=1800, stale-while-revalidate=300'}});}
