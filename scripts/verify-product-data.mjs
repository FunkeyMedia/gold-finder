import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
function loadPure(path){const source=readFileSync(path,'utf8').replace(/^import .*;$/mg,'');const js=ts.transpile(source,{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022});const exports={};new Function('exports',js)(exports);return exports;}
const {isBullionListing}=loadPure('src/lib/product-quality.ts');
assert.equal(isBullionListing('400 Stück Papiergoldbarren'),false);
assert.equal(isBullionListing('nelier Barren Kapseln CombiBar 1g aus Acryl'),false);
assert.equal(isBullionListing('Mcvitie Goldbarren 8 X 22G'),false);
assert.equal(isBullionListing('Goldmünzenset',['Jede der 24 Münzen wurde mit reinem Feingold (999/1.000) veredelt']),false);
assert.equal(isBullionListing('Goldbarren 1g in Kapsel inkl. Etui'),true);
assert.equal(isBullionListing('Krugerrand',[],'B0GWHT8Z6J'),false);
const {matchesProduct}=loadPure('src/lib/product-matching.ts');
const bar={id:'bar-10-g',grams:10,kind:'bar'};
for(const title of ['Goldbarren 110g','Goldbarren 0,10g','Goldbarren 2 x 10g','Goldbarren 3g 5g oder 10g'])assert.equal(matchesProduct({title,features:[]},bar),false,title);
assert.equal(matchesProduct({title:'Heraeus Goldbarren 10g',features:[]},bar),true);
assert.equal(matchesProduct({title:'Goldbarren 20g',features:['auch in 10g']},bar),false);
const data=JSON.parse(readFileSync('src/data/manufacturer-products.json'));
assert.equal(new Set(data.map(p=>p.slug)).size,data.length);
const asins=data.flatMap(p=>p.asins);assert.equal(new Set(asins).size,asins.length);
for(const p of data){assert.ok(p.name.de&&p.name.en&&p.name.fr);assert.ok(p.grams===null||p.grams>0);for(const asin of p.asins)assert.match(asin,/^[A-Z0-9]{10}$/);}
console.log(`PASS: quality filters, exact size matching, ${data.length} product identities / ${asins.length} distinct reference offers.`);

if(process.argv[2]){const catalogue=JSON.parse(readFileSync(process.argv[2])).products;const accepted=catalogue.filter(p=>isBullionListing(p.title,p.features,p.asin));for(const p of accepted)assert.ok(asins.includes(p.asin),`Missing detail page for ${p.asin}`);console.log(`PASS: all ${accepted.length} eligible current listings map to a detail page.`);}
