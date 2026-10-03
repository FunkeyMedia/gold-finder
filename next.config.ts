import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...[1,2,5,10,20,50,100,250,500].map(weight=>({source:`/de/goldbarren-${weight}-gramm`,destination:`/de/goldbarren/${weight}-g`,permanent:true})),
      {source:'/de/goldbarren-1-unze',destination:'/de/goldbarren/1-oz',permanent:true},
      {source:'/de/goldbarren-1-kilo',destination:'/de/goldbarren/1-kg',permanent:true},
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'images-na.ssl-images-amazon.com' },
      { protocol: 'https', hostname: 'images-eu.ssl-images-amazon.com' }
    ]
  }
};

export default nextConfig;
