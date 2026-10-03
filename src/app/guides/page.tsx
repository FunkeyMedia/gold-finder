import type {Metadata} from 'next';
import {ArrowRight} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import {regions,markets} from '@/lib/product-catalogue';
import {seoPages} from '@/lib/seo-pages';

export const metadata:Metadata={
  title:'Gold Buying Guides, Bar Weights & Coin Series | Gold Finder',
  description:'Browse every Gold Finder guide to physical gold, including bar weights, bullion coins, regional buying information and our editorial methods.',
  alternates:{canonical:'/guides'},
};

const groups=[
  {id:'regions',title:'Buying gold by country',description:'Start with the buying considerations for your market.',pages:seoPages.filter(page=>['us','uk'].includes(page.slug[0])||page.slug.join('/')==='de/gold-kaufen')},
  {id:'bars',title:'Gold bars and weights',description:'Compare bar formats and the practical trade-offs between sizes.',pages:seoPages.filter(page=>page.slug[0]==='de'&&page.slug[1]?.startsWith('goldbarren'))},
  {id:'coins',title:'Bullion coins',description:'Understand familiar coin series and their product specifications.',pages:seoPages.filter(page=>page.slug.join('/')==='de/goldmuenzen-kaufen'||page.slug[1]==='goldmuenzen'||page.slug[0]==='coins')},
  {id:'comparisons',title:'Buying comparisons',description:'Read the format and weight guides before comparing offers.',pages:seoPages.filter(page=>page.slug[0]==='guides')},
  {id:'methods',title:'Methods and sources',description:'See how product information and editorial claims are checked.',pages:seoPages.filter(page=>page.schemaType==='WebPage')},
];

export default function GuidesPage(){
  return <main className="seo-page">
    <header className="seo-header"><a className="brand" href="/"><BrandLogo/></a><a href="/#finder">Open product finder <ArrowRight size={16}/></a></header>
    <article className="guides-directory">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Gold Finder</a><span>/</span><span>Guides</span></nav>
      <p className="eyebrow">Gold knowledge</p>
      <h1>Explore our gold guides.</h1>
      <p className="seo-intro">Find the relevant guide by country, gold bar weight or bullion coin. Each guide links to its primary sources and explains what to check in a live seller offer.</p>
      <section className="directory-group"><h2>Product pages by country</h2><div className="directory-links">{regions.map(r=><a key={r} href={markets[r].hub}><strong>{markets[r].label}</strong></a>)}</div></section>
      <nav className="directory-shortcuts" aria-label="Guide topics">{groups.map(group=><a key={group.id} href={`#${group.id}`}>{group.title}</a>)}</nav>
      {groups.map(group=><section className="directory-group" id={group.id} key={group.id}>
        <h2>{group.title}</h2><p>{group.description}</p>
        <div className="directory-links">{group.pages.map(page=><a href={`/${page.slug.join('/')}`} key={page.slug.join('/')}><span>{page.eyebrow}</span><strong>{page.headline}</strong><ArrowRight size={18}/></a>)}</div>
      </section>)}
    </article>
    <footer><a className="brand" href="/"><BrandLogo/></a><p>Independent discovery for physical gold.</p><div><a href="/impressum">Legal Notice / Impressum</a><a href="/datenschutz">Privacy / Datenschutz</a></div></footer>
  </main>;
}
