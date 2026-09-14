import BrandLogo from './BrandLogo';
import type { ReactNode } from 'react';
export default function LegalPage({title,children}:{title:string;children:ReactNode}) {
 return <main className="legal-page"><header><a className="brand" href="/"><BrandLogo/></a><a href="/">Back to Gold Finder ↗</a></header><article className="legal-copy"><p className="eyebrow">Gold Finder · Legal information</p><h1>{title}</h1><p className="legal-date">Last updated: 14 September 2026</p>{children}</article><footer><a className="brand" href="/"><BrandLogo/></a><div><a href="/impressum">Legal Notice / Impressum</a><a href="/datenschutz">Privacy / Datenschutz</a></div><small>© 2026 Gold Finder</small></footer></main>;
}
