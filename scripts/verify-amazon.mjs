const base = process.env.VERIFY_BASE_URL || 'http://localhost:3000';
const response = await fetch(`${base}/api/products`, { signal: AbortSignal.timeout(60000) });
if (!response.ok) throw new Error(`API returned ${response.status}`);
const data = await response.json();
if (!data.live) throw new Error(data.message || 'Amazon response is not live');
const allowedImages = new Set(['m.media-amazon.com','images-na.ssl-images-amazon.com','images-eu.ssl-images-amazon.com']);
const failures = [];
const parentAsins = new Set();
for (const product of data.products) {
  if (!/^[A-Z0-9]{10}$/.test(product.asin)) failures.push(`${product.asin}: invalid ASIN`);
  if (!allowedImages.has(new URL(product.image).hostname)) failures.push(`${product.asin}: invalid image host`);
  if (product.price && (product.price.currency !== 'EUR' || product.price.source !== 'amazon-creators-api')) failures.push(`${product.asin}: unverified price`);
  if (product.available !== true) failures.push(`${product.asin}: unavailable`);
  if (parentAsins.has(product.parentAsin)) failures.push(`${product.asin}: duplicate parent ASIN`);
  parentAsins.add(product.parentAsin);
  if (product.detailPageUrl !== `https://www.amazon.de/dp/${product.asin}?tag=Onlinestarkei-21`) failures.push(`${product.asin}: invalid product link`);
}
if (data.count !== data.products.length) failures.push('count does not match products');
if (failures.length) throw new Error(failures.join('\n'));
console.log(JSON.stringify({ live: true, count: data.count, checks: 10, status: 'passed' }));
