import { NextResponse } from 'next/server';
import { getAmazonProducts } from '@/lib/amazon';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET() {
  const data = await getAmazonProducts();
  return NextResponse.json(data, { headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=300' } });
}
