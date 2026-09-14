export type Marketplace = 'de' | 'us' | 'uk';
export type Currency = 'EUR' | 'USD' | 'GBP';
export type AmazonProduct = { asin:string; parentAsin:string; brand:string; model:string; title:string; image:string; price?:{amount:number;currency:Currency;display:string;source:'amazon-creators-api'}; available:true; availability:string; features:string[]; detailPageUrl:string; fetchedAt:string };
export type ProductResponse = { marketplace:Marketplace; marketplaceName:string; amazonDomain:string; currency:Currency; locale:string; products:AmazonProduct[]; count:number; live:boolean; fetchedAt:string|null; message?:string };
