import 'server-only';
import type { AmazonProduct, ProductResponse } from './types';

const DISPLAY_PARTNER_TAG = 'Onlinestarkei-21';
const API_PARTNER_TAG = DISPLAY_PARTNER_TAG.toLowerCase();
const TOKEN_URL = 'https://api.amazon.co.uk/auth/o2/token';
const SEARCH_URL = 'https://creatorsapi.amazon/catalog/v1/searchItems';
const MARKETPLACE = 'www.amazon.de';
const CACHE_MS = 30 * 60 * 1000;
const SEARCHES = [
  'Anlagegold Feingold',
  'Goldbarren 999,9',
  'Goldbarren 1g 2g 5g',
  'Goldbarren 10g 20g',
  'Goldbarren 1 oz 50g',
  'Goldbarren 100g 250g',
  'Goldmünze Feingold',
  'Krügerrand Maple Leaf Britannia Gold'
];
const ALLOWED_IMAGES = new Set(['m.media-amazon.com','images-na.ssl-images-amazon.com','images-eu.ssl-images-amazon.com']);
const AVAILABLE = new Set(['IN_STOCK','INSTOCK','INSTOCKSCARCE','LEADTIME']);
const EXCLUDED = /vergoldet|goldfarben|gold farben|plattiert|gold plated|replica|replik|nachprägung|medaille|münzkapsel|kapsel|sammlerbox|geschenkbox|folie|blattgold|schmuck|anhänger|kette|ring|ohrring|armband/i;
const GOLD_PRODUCT = /goldbarren|feingold|goldmünze|krügerrand|krugerrand|maple leaf|britannia|philharmoniker|kangaroo|känguru|gold nugget/i;
let cache: { until: number; data: ProductResponse } | undefined;
let tokenCache: { until: number; value: string } | undefined;

function pick(value: unknown, path: string): any {
  return path.split('.').reduce<any>((current, key) => current?.[key], value);
}
function validImage(value?: string) {
  try { return Boolean(value && ALLOWED_IMAGES.has(new URL(value).hostname)); } catch { return false; }
}
function affiliateUrl(asin: string) {
  return `https://www.amazon.de/dp/${asin}?tag=${DISPLAY_PARTNER_TAG}`;
}
function withTimeout(url: string, init: RequestInit, timeout = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...init, signal: controller.signal, cache: 'no-store' }).finally(() => clearTimeout(timer));
}
async function accessToken() {
  if (tokenCache && tokenCache.until > Date.now()) return tokenCache.value;
  const clientId = process.env.AMAZON_CREATORS_CLIENT_ID;
  const clientSecret = process.env.AMAZON_CREATORS_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('credentials_missing');
  const response = await withTimeout(TOKEN_URL, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret, scope: 'creatorsapi::default' })
  });
  if (!response.ok) throw new Error(`token_${response.status}`);
  const body = await response.json();
  if (!body.access_token) throw new Error('token_missing');
  tokenCache = { value: body.access_token, until: Date.now() + Math.max(60, Number(body.expires_in || 3600) - 120) * 1000 };
  return tokenCache.value;
}
function normalize(item: any): AmazonProduct | null {
  const asin = String(item?.asin || '').toUpperCase();
  const parentAsin = String(item?.parentASIN || asin).toUpperCase();
  const title = String(pick(item, 'itemInfo.title.displayValue') || '').trim();
  const features = (pick(item, 'itemInfo.features.displayValues') || []).filter((v: unknown): v is string => typeof v === 'string');
  const searchable = `${title} ${features.join(' ')}`;
  const image = [pick(item,'images.primary.hiRes.url'),pick(item,'images.primary.large.url'),pick(item,'images.primary.medium.url')].find(validImage);
  const listing = item?.offersV2?.listings?.find((entry: any) => AVAILABLE.has(String(entry?.availability?.type || '').replaceAll('_','').toUpperCase()));
  if (!/^[A-Z0-9]{10}$/.test(asin) || !title || !image || !listing || !GOLD_PRODUCT.test(searchable) || EXCLUDED.test(searchable)) return null;
  const money = listing?.price?.money;
  const brand = String(pick(item,'itemInfo.byLineInfo.brand.displayValue') || pick(item,'itemInfo.byLineInfo.manufacturer.displayValue') || 'Not specified');
  const model = String(pick(item,'itemInfo.manufactureInfo.model.displayValue') || pick(item,'itemInfo.productInfo.size.displayValue') || title);
  const product: AmazonProduct = { asin, parentAsin, brand, model, title, image, available: true, availability: String(listing.availability.message || 'Available'), features, detailPageUrl: affiliateUrl(asin), fetchedAt: new Date().toISOString() };
  if (typeof money?.amount === 'number' && money.currency === 'EUR') product.price = { amount: money.amount, currency: 'EUR', display: String(money.displayAmount || new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(money.amount)), source: 'amazon-creators-api' };
  return product;
}
async function search(access: string, keywords: string, itemPage: number) {
  const response = await withTimeout(SEARCH_URL, {
    method: 'POST',
    headers: { authorization: `Bearer ${access}`, 'content-type': 'application/json', 'x-marketplace': MARKETPLACE },
    body: JSON.stringify({ keywords, itemCount: 10, itemPage, searchIndex: 'All', availability: 'Available', currencyOfPreference: 'EUR', languagesOfPreference: ['de_DE'], marketplace: MARKETPLACE, partnerTag: API_PARTNER_TAG, resources: ['images.primary.large','itemInfo.title','itemInfo.features','itemInfo.byLineInfo','itemInfo.manufactureInfo','itemInfo.productInfo','offersV2.listings.price','offersV2.listings.availability','parentASIN'] })
  });
  if (!response.ok) throw new Error(`search_${response.status}`);
  const body = await response.json();
  return (body?.searchResult?.items || []).map(normalize).filter(Boolean) as AmazonProduct[];
}
function deduplicate(products: AmazonProduct[]) {
  const unique = new Map<string, AmazonProduct>();
  for (const product of products) {
    const key = product.parentAsin || `${product.brand}|${product.model}`.toLowerCase();
    const current = unique.get(key);
    if (!current || (!current.price && product.price)) unique.set(key, product);
  }
  return [...unique.values()].sort((a,b) => (a.price?.amount ?? Infinity) - (b.price?.amount ?? Infinity));
}
export async function getAmazonProducts(): Promise<ProductResponse> {
  if (cache && cache.until > Date.now()) return cache.data;
  try {
    const access = await accessToken();
    const found: AmazonProduct[] = [];
    for (const keywords of SEARCHES) {
      for (const page of [1,2]) {
        found.push(...await search(access, keywords, page));
        await new Promise(resolve => setTimeout(resolve, 1050));
      }
    }
    const products = deduplicate(found);
    const data: ProductResponse = { products, count: products.length, live: true, fetchedAt: new Date().toISOString() };
    cache = { until: Date.now() + CACHE_MS, data };
    return data;
  } catch (error) {
    console.error('Amazon Creators API unavailable:', error instanceof Error ? error.message : 'unknown');
    return { products: [], count: 0, live: false, fetchedAt: null, message: error instanceof Error && error.message === 'credentials_missing' ? 'Live Amazon products are not configured yet.' : 'Amazon live products are temporarily unavailable. No cached prices are being shown.' };
  }
}
export { DISPLAY_PARTNER_TAG, ALLOWED_IMAGES };
