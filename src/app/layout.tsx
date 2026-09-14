import type { Metadata } from 'next';
import './globals.css';
import './affiliate.css';

export const metadata: Metadata = {
  title: 'Gold Finder — Compare physical gold with clarity',
  description: 'Explore investment gold bars and bullion coins by weight, purity, mint and delivery region.',
  metadataBase: new URL('https://www.gold-finder.com'),
  alternates: { canonical: '/' },
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
