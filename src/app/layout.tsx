import Script from "next/script";
import type { Metadata } from 'next';
import './globals.css';
import './affiliate.css';
import './legal.css';
import './seo.css';

export const metadata: Metadata = {
  title: 'Gold Finder — Compare physical gold with clarity',
  description: 'Explore investment gold bars and bullion coins by weight, purity, mint and delivery region.',
  metadataBase: new URL('https://www.gold-finder.com'),
  alternates: { canonical: '/' },
  robots: {index:true,follow:true},
  openGraph: {title:'Gold Finder — Compare physical gold with clarity',description:'Explore investment gold bars and bullion coins by weight, purity, mint and delivery region.',url:'/',siteName:'Gold Finder',type:'website'},
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}<aside className="affiliate-tracking-note" style={{textAlign:"center",padding:12,fontSize:12}}><a href="/amazon-klickstatistik.html">Amazon-Klickstatistik / Click measurement</a></aside><Script id="affiliate-amazon-tracking" src="/affiliate-amazon-tracking.js" strategy="afterInteractive" /></body></html>;
}
