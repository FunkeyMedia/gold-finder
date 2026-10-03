import type {AmazonProduct} from './types';
import {products,type Product} from './product-catalogue';
export function matchesProduct(item:Pick<AmazonProduct,'title'|'features'>,product:Product){
 const text=item.title.toLowerCase().replaceAll(',','.');
 if(product.kind==='coin'){
  const aliases:Record<string,RegExp>={krugerrand:/kr[uü]gerrand/, 'maple-leaf':/maple leaf/,'vienna-philharmonic':/philharmoni[ck]|philharmonique/,britannia:/britannia/,'american-eagle':/(?:american|gold) eagle/};
  return aliases[product.id]?.test(text)&&!/\b(?:bar|barren|lingot)\b/.test(text);
 }
 if(!/\b(?:bar|bars|goldbarren|barren|lingot|lingotin)\b/.test(text))return false;
 // Read the complete numeric token: 10 g must not match 110 g or 0.10 g.
 const weights=[...text.matchAll(/(?<![\d.])(\d+(?:\.\d+)?)\s*(kg|kilograms?|kilogramm|oz|troy ounces?|ounces?|unzen?|grams?|grammes?|gramm|g)\b/g)];
 if(/\d\s*[/x×]\s*\d/.test(text))return false;
 const grams=weights.map(([,n,u])=>Number(n)*(u==='kg'||u.startsWith('kilo')?1000:/oz|ounce|unze/.test(u)?31.1035:1));
 return grams.length>0&&grams.every(g=>Math.abs(g-product.grams)<0.01);
}
export function catalogueProductFor(item:Pick<AmazonProduct,'title'|'features'>){return products.find(p=>matchesProduct(item,p));}
