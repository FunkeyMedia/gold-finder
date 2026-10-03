import 'server-only';
import {isBullionListing} from './product-quality';
import { getCache, waitUntil } from '@vercel/functions';
import type { AmazonProduct, Currency, Marketplace, ProductResponse } from './types';
type Config={name:string;domain:string;tag:string;currency:Currency;locale:string;searches:string[]};
export const MARKETPLACES:Record<Marketplace,Config>={
 de:{name:'Germany',domain:'www.amazon.de',tag:'Onlinestarkei-21',currency:'EUR',locale:'de_DE',searches:['Anlagegold Feingold','Goldbarren 999,9','Goldbarren 1g 2g 5g','Goldbarren 10g 20g','Goldbarren 1 oz 50g','Goldbarren 100g 250g','Goldmünze Feingold','Krügerrand Maple Leaf Britannia Gold']},
 us:{name:'United States',domain:'www.amazon.com',tag:'goldfindercom-20',currency:'USD',locale:'en_US',searches:['investment gold bullion','999.9 gold bars','1 gram 5 gram gold bar','10 gram 20 gram gold bar','1 oz gold bar','gold bullion coins','Krugerrand Maple Leaf Britannia gold coin']},
 uk:{name:'United Kingdom',domain:'www.amazon.co.uk',tag:'goldfindercom-21',currency:'GBP',locale:'en_GB',searches:['investment gold bullion','999.9 gold bars','1 gram 5 gram gold bar','10 gram 20 gram gold bar','1 oz gold bar','gold bullion coins','Krugerrand Maple Leaf Britannia gold coin']}
};
const TOKEN_URL='https://api.amazon.co.uk/auth/o2/token',SEARCH_URL='https://creatorsapi.amazon/catalog/v1/searchItems',FRESH_MS=30*60*1000,LAST_GOOD_TTL_SECONDS=24*60*60;
const ALLOWED_IMAGES=new Set(['m.media-amazon.com','images-na.ssl-images-amazon.com','images-eu.ssl-images-amazon.com']);
const AVAILABLE=new Set(['IN_STOCK','INSTOCK','INSTOCKSCARCE','LEADTIME']);
const EXCLUDED=/vergoldet|goldfarben|gold farben|plattiert|gold plated|replica|replik|nachprägung|medaille|münzkapsel|capsule|sammlerbox|leer(?:e|er)? box|empty case|display case|case for|foil|blattgold|jewelry|jewellery|schmuck|pendant|anhänger|necklace|kette|ring|earring|ohrring|bracelet|armband/i;
const GOLD_PRODUCT=/gold bar|gold bullion|gold coin|goldbarren|feingold|goldmünze|krügerrand|krugerrand|maple leaf|britannia|philharmoniker|kangaroo|känguru|gold nugget/i;
const caches=new Map<Marketplace,ProductResponse>();
const refreshes=new Map<Marketplace,Promise<ProductResponse>>();
let tokenCache:{until:number;value:string}|undefined;
const pick=(value:unknown,path:string):any=>path.split('.').reduce<any>((current,key)=>current?.[key],value);
function validImage(value?:string){try{return Boolean(value&&ALLOWED_IMAGES.has(new URL(value).hostname));}catch{return false;}}
function withTimeout(url:string,init:RequestInit,timeout=8000){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);return fetch(url,{...init,signal:controller.signal,cache:'no-store'}).finally(()=>clearTimeout(timer));}
async function accessToken(){if(tokenCache&&tokenCache.until>Date.now())return tokenCache.value;const clientId=process.env.AMAZON_CREATORS_CLIENT_ID,clientSecret=process.env.AMAZON_CREATORS_CLIENT_SECRET;if(!clientId||!clientSecret)throw new Error('credentials_missing');const response=await withTimeout(TOKEN_URL,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({grant_type:'client_credentials',client_id:clientId,client_secret:clientSecret,scope:'creatorsapi::default'})});if(!response.ok)throw new Error(`token_${response.status}`);const body=await response.json();if(!body.access_token)throw new Error('token_missing');tokenCache={value:body.access_token,until:Date.now()+Math.max(60,Number(body.expires_in||3600)-120)*1000};return tokenCache.value;}
function normalize(item:any,c:Config):AmazonProduct|null{const asin=String(item?.asin||'').toUpperCase(),parentAsin=String(item?.parentASIN||asin).toUpperCase(),title=String(pick(item,'itemInfo.title.displayValue')||'').trim();const features=(pick(item,'itemInfo.features.displayValues')||[]).filter((v:unknown):v is string=>typeof v==='string'),searchable=`${title} ${features.join(' ')}`,image=[pick(item,'images.primary.hiRes.url'),pick(item,'images.primary.large.url'),pick(item,'images.primary.medium.url')].find(validImage),listing=item?.offersV2?.listings?.find((entry:any)=>AVAILABLE.has(String(entry?.availability?.type||'').replaceAll('_','').toUpperCase()));if(!/^[A-Z0-9]{10}$/.test(asin)||!title||!isBullionListing(title,features,asin)||!image||!listing||!GOLD_PRODUCT.test(searchable)||EXCLUDED.test(searchable))return null;const money=listing?.price?.money,brand=String(pick(item,'itemInfo.byLineInfo.brand.displayValue')||pick(item,'itemInfo.byLineInfo.manufacturer.displayValue')||'Not specified'),model=String(pick(item,'itemInfo.manufactureInfo.model.displayValue')||pick(item,'itemInfo.productInfo.size.displayValue')||title);const product:AmazonProduct={asin,parentAsin,brand,model,title,image,available:true,availability:String(listing.availability.message||'Available'),features,detailPageUrl:`https://${c.domain}/dp/${asin}?tag=${c.tag}`,fetchedAt:new Date().toISOString()};if(typeof money?.amount==='number'&&money.currency===c.currency)product.price={amount:money.amount,currency:c.currency,display:String(money.displayAmount||new Intl.NumberFormat(c.locale.replace('_','-'),{style:'currency',currency:c.currency}).format(money.amount)),source:'amazon-creators-api'};return product;}
async function search(access:string,keywords:string,itemPage:number,c:Config){const response=await withTimeout(SEARCH_URL,{method:'POST',headers:{authorization:`Bearer ${access}`,'content-type':'application/json','x-marketplace':c.domain},body:JSON.stringify({keywords,itemCount:10,itemPage,searchIndex:'All',availability:'Available',currencyOfPreference:c.currency,languagesOfPreference:[c.locale],marketplace:c.domain,partnerTag:c.tag.toLowerCase(),resources:['images.primary.large','itemInfo.title','itemInfo.features','itemInfo.byLineInfo','itemInfo.manufactureInfo','itemInfo.productInfo','offersV2.listings.price','offersV2.listings.availability','parentASIN']})});if(!response.ok)throw new Error(`search_${response.status}_${(await response.text()).slice(0,160)}`);const body=await response.json();return(body?.searchResult?.items||[]).map((item:any)=>normalize(item,c)).filter(Boolean) as AmazonProduct[];}
function deduplicate(products:AmazonProduct[]){const unique=new Map<string,AmazonProduct>();for(const product of products){const key=product.parentAsin||`${product.brand}|${product.model}`.toLowerCase(),current=unique.get(key);if(!current||(!current.price&&product.price))unique.set(key,product);}return[...unique.values()].sort((a,b)=>(a.price?.amount??Infinity)-(b.price?.amount??Infinity));}
function isFresh(data:ProductResponse){return Boolean(data.fetchedAt&&Date.now()-new Date(data.fetchedAt).getTime()<FRESH_MS);}
function newest(...entries:(ProductResponse|undefined)[]){return entries.filter((entry):entry is ProductResponse=>Boolean(entry?.products?.length)).sort((a,b)=>new Date(b.fetchedAt||0).getTime()-new Date(a.fetchedAt||0).getTime())[0];}
async function refreshAmazonProducts(marketplace:Marketplace):Promise<ProductResponse>{
 const active=refreshes.get(marketplace);if(active)return active;
 const task=(async()=>{
  const c=MARKETPLACES[marketplace],base={marketplace,marketplaceName:c.name,amazonDomain:c.domain,currency:c.currency,locale:c.locale};
  const access=await accessToken(),found:AmazonProduct[]=[];let successfulSearches=0;
  for(const keywords of c.searches)for(const page of[1,2]){
   try{found.push(...await search(access,keywords,page,c));successfulSearches++;}
   catch(error){console.error(`Amazon ${marketplace} search failed (${keywords}, page ${page}):`,error instanceof Error?error.message:'unknown');}
   await new Promise(resolve=>setTimeout(resolve,1050));
  }
  const products=deduplicate(found).slice(0,250),totalSearches=c.searches.length*2;
  if(successfulSearches<Math.ceil(totalSearches*.75)||!products.length)throw new Error(`catalogue_refresh_incomplete_${successfulSearches}_of_${totalSearches}`);
  const data:ProductResponse={...base,products,count:products.length,live:true,cached:false,fetchedAt:new Date().toISOString()};
  caches.set(marketplace,data);
  const runtimeCache=getCache({namespace:'gold-finder-amazon'});
  try{await runtimeCache.set(`products:${marketplace}:v2`,data,{ttl:LAST_GOOD_TTL_SECONDS,tags:[`amazon-products-${marketplace}`],name:`Amazon ${marketplace} last good products`});}
  catch(error){console.error('Runtime cache write unavailable:',error instanceof Error?error.message:'unknown');}
  return data;
 })().finally(()=>refreshes.delete(marketplace));
 refreshes.set(marketplace,task);return task;
}
export async function getAmazonProducts(marketplace:Marketplace):Promise<ProductResponse>{
 const c=MARKETPLACES[marketplace],base={marketplace,marketplaceName:c.name,amazonDomain:c.domain,currency:c.currency,locale:c.locale};
 const memory=caches.get(marketplace);if(memory&&isFresh(memory))return memory;
 const runtimeCache=getCache({namespace:'gold-finder-amazon'});let shared:ProductResponse|undefined;
 try{
  const current=await runtimeCache.get(`products:${marketplace}:v2`) as ProductResponse|undefined;
  const legacy=current?undefined:await runtimeCache.get(`products:${marketplace}:v1`) as ProductResponse|undefined;
  shared=newest(current,legacy);if(shared)caches.set(marketplace,shared);
 }catch(error){console.error('Runtime cache read unavailable:',error instanceof Error?error.message:'unknown');}
 const lastGood=newest(memory,shared);
 if(lastGood&&isFresh(lastGood))return{...lastGood,live:true,cached:false,message:undefined};
 if(lastGood){
  waitUntil(refreshAmazonProducts(marketplace).catch(error=>console.error(`Amazon ${marketplace} background refresh failed:`,error instanceof Error?error.message:'unknown')));
  return{...lastGood,live:false,cached:true,message:'Amazon is being refreshed in the background. The last successful product data remains available.'};
 }
 try{
  return await refreshAmazonProducts(marketplace);
 }catch(error){
  console.error(`Amazon ${marketplace} unavailable:`,error instanceof Error?error.message:'unknown');
  return{...base,products:[],count:0,live:false,cached:false,fetchedAt:null,message:error instanceof Error&&error.message==='credentials_missing'?'Live Amazon products are not configured yet.':marketplace==='de'?'Amazon is temporarily unavailable and no successful catalogue has been cached yet. Please try again shortly.':'Amazon has not yet enabled this marketplace for the connected Creators API account.'};
 }
}
export {ALLOWED_IMAGES};
