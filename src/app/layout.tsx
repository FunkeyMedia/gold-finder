import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gold Finder — Compare physical gold with clarity',
  description: 'Explore investment gold bars and bullion coins by weight, purity, mint and delivery region.',
  metadataBase: new URL('https://gold-finder.vercel.app'),
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
