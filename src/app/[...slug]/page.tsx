import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {ArrowRight,CheckCircle2,ExternalLink} from 'lucide-react';
import {findSeoPage,seoPages,type SeoPage} from '@/lib/seo-pages';
import BrandLogo from '@/components/BrandLogo';

type Props={params:Promise<{slug:string[]}>};
const origin='https://www.gold-finder.com';
const pathFor=(page:SeoPage)=>`/${page.slug.join('/')}`;

export function generateStaticParams(){return seoPages.map(page=>({slug:page.slug}))}

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const page=findSeoPage((await params).slug);
  if(!page)return{};
  const path=pathFor(page);
  const isMarketHub=page.slug.length===2&&['us','uk','de'].includes(page.slug[0]);
  return {
    title:page.title,
    description:page.description,
    alternates:{
      canonical:path,
      ...(isMarketHub?{languages:{'en-US':'/us/buy-gold','en-GB':'/uk/buy-gold','de-DE':'/de/gold-kaufen','x-default':'/'}}:{}),
    },
    openGraph:{title:page.title,description:page.description,url:path,type:'article',siteName:'Gold Finder',locale:page.language==='de'?'de_DE':'en_US'},
    twitter:{card:'summary_large_image',title:page.title,description:page.description},
  };
}

function getParentPage(page:SeoPage){
  if(page.slug[0]==='de'&&page.slug[1]==='goldbarren')return findSeoPage(['de','goldbarren-kaufen']);
  if(page.slug[0]==='de'&&page.slug[1]==='goldmuenzen')return findSeoPage(['de','goldmuenzen-kaufen']);
  return undefined;
}

function getRelatedPages(page:SeoPage){
  const slug=page.slug.join('/');
  const selected:SeoPage[]=[];
  const add=(candidate:SeoPage|undefined)=>{
    if(candidate&&candidate!==page&&!selected.includes(candidate))selected.push(candidate);
  };
  const addPath=(path:string)=>add(seoPages.find(candidate=>candidate.slug.join('/')===path));
  const addGroup=(prefix:string)=>seoPages.filter(candidate=>candidate.slug.join('/').startsWith(prefix)).forEach(add);

  if(slug==='de/goldbarren-kaufen'){
    addGroup('de/goldbarren/');
    addPath('guides/gold-bar-sizes');
  }else if(page.slug[0]==='de'&&page.slug[1]==='goldbarren'){
    addPath('de/goldbarren-kaufen');
    addGroup('de/goldbarren/');
    addPath('guides/gold-bar-sizes');
  }else if(slug==='de/goldmuenzen-kaufen'){
    addGroup('de/goldmuenzen/');
    addPath('coins/krugerrand-vs-maple-leaf-vs-britannia');
  }else if(page.slug[0]==='de'&&page.slug[1]==='goldmuenzen'){
    addPath('de/goldmuenzen-kaufen');
    addGroup('de/goldmuenzen/');
    addPath('coins/krugerrand-vs-maple-leaf-vs-britannia');
  }else if(page.schemaType==='WebPage'){
    seoPages.filter(candidate=>candidate.schemaType==='WebPage').forEach(add);
  }else if(['us','uk'].includes(page.slug[0])||slug==='de/gold-kaufen'){
    ['us/buy-gold','uk/buy-gold','de/gold-kaufen','guides/gold-bars-vs-coins'].forEach(addPath);
  }else{
    seoPages.filter(candidate=>candidate.slug[0]===page.slug[0]).forEach(add);
    ['de/goldbarren-kaufen','de/goldmuenzen-kaufen'].forEach(addPath);
  }
  return selected.slice(0,6);
}

export default async function SeoLanding({params}:Props){
  const page=findSeoPage((await params).slug);
  if(!page)notFound();
  const de=page.language==='de';
  const path=`${origin}${pathFor(page)}`;
  const finder=buildFinderHref(page);
  const parent=getParentPage(page);
  const related=getRelatedPages(page);
  const crumbs=[
    {name:'Gold Finder',url:origin},
    {name:de?'Ratgeber':'Guides',url:`${origin}/guides`},
    ...(parent?[{name:parent.headline,url:`${origin}${pathFor(parent)}`}]:[]),
    {name:page.headline,url:path},
  ];
  const graph={'@context':'https://schema.org','@graph':[
    {'@type':page.schemaType||'Article',headline:page.headline,description:page.description,dateModified:'2026-09-26',inLanguage:de?'de-DE':'en',mainEntityOfPage:path,author:{'@type':'Organization',name:'Gold Finder'},publisher:{'@type':'Organization',name:'Gold Finder',url:origin}},
    {'@type':'BreadcrumbList',itemListElement:crumbs.map((crumb,index)=>({'@type':'ListItem',position:index+1,name:crumb.name,item:crumb.url}))},
    {'@type':'FAQPage',mainEntity:page.faqs.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))},
  ]};

  return <main className="seo-page" lang={de?'de':'en'}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph)}}/>
    <header className="seo-header"><a className="brand" href="/"><BrandLogo/></a><a href={finder}>{de?'Produkte finden':'Open product finder'} <ArrowRight size={16}/></a></header>
    <article>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Gold Finder</a><span>/</span><a href="/guides">{de?'Ratgeber':'Guides'}</a>
        {parent&&<><span>/</span><a href={pathFor(parent)}>{parent.headline}</a></>}
        <span>/</span><span>{page.headline}</span>
      </nav>
      <p className="eyebrow">{page.eyebrow}</p>
      <h1>{page.headline}</h1>
      <p className="seo-intro">{page.intro}</p>
      <div className="direct-answer"><strong>{de?'Kurzantwort':'Quick answer'}</strong><p>{page.answer}</p></div>
      <a className="seo-cta" href={finder}>{page.cta}<ArrowRight size={17}/></a>
      <p className="updated">{de?'Geprüft':'Reviewed'} {page.updated}</p>
      <section className="key-facts"><h2>{de?'Das Wichtigste zuerst':'What to know first'}</h2><div>{page.facts.map(f=><p key={f}><CheckCircle2/>{f}</p>)}</div></section>
      {page.sections.map(section=><section className="seo-section" key={section.heading}><h2>{section.heading}</h2><p>{section.body}</p></section>)}
      <section className="seo-faq"><p className="eyebrow">{de?'Konkrete Antworten':'Questions answered'}</p><h2>{de?'Häufige Fragen':'Frequently asked questions'}</h2>{page.faqs.map(f=><details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</section>
      <section className="seo-sources"><h2>{de?'Primärquellen':'Primary sources'}</h2><p>{de?'Diese offiziellen Quellen dienen zur Prüfung von Spezifikationen und veränderlichen Regeln.':'Use these official references to check specifications and rules that may change.'}</p>{page.sources.map(source=><a href={source.url} target="_blank" rel="noopener" key={source.url}>{source.name}<ExternalLink size={15}/></a>)}</section>
      <aside className="related"><h2>{de?'Weiterführende Seiten':'Continue exploring'}</h2><div>{related.map(p=><a key={p.slug.join('/')} href={pathFor(p)}><span>{p.eyebrow}</span><strong>{p.headline}</strong><ArrowRight/></a>)}</div><a className="all-guides" href="/guides">{de?'Alle Ratgeber ansehen':'Browse all guides'} <ArrowRight size={17}/></a></aside>
    </article>
    <footer><a className="brand" href="/"><BrandLogo/></a><p>{de?'Unabhängige Produktsuche für physisches Gold.':'Independent discovery for physical gold.'}</p><div><a href="/guides">{de?'Alle Ratgeber':'All guides'}</a><a href="/how-gold-finder-works">{de?'Methodik':'Methodology'}</a><a href="/editorial-policy">{de?'Redaktion':'Editorial policy'}</a><a href="/impressum">{de?'Impressum':'Legal Notice'}</a><a href="/datenschutz">{de?'Datenschutz':'Privacy'}</a></div><small>© {new Date().getFullYear()} Gold Finder. {de?'Information, keine Anlageberatung.':'Information only; no investment advice.'}</small></footer>
  </main>;
}

function buildFinderHref(page:{slug:string[];query:string}){
  const params=new URLSearchParams();
  if(page.query)params.set('q',page.query);
  if(page.slug.includes('goldbarren-kaufen')||page.slug.includes('goldbarren'))params.set('type','Bars');
  if(page.slug.includes('goldmuenzen-kaufen')||page.slug.includes('goldmuenzen'))params.set('type','Coins');
  const weight=page.slug.at(-1);
  if(weight==='1-g')params.set('weight','Up to 1 g');
  if(weight==='5-g')params.set('weight','2–5 g');
  if(['10-g','20-g'].includes(weight||''))params.set('weight','10–20 g');
  if(weight==='1-oz')params.set('weight','1 oz +');
  return `/?${params.toString()}#finder`;
}
