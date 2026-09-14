# Gold Finder

Production domain: https://www.gold-finder.com

An English-language discovery and comparison experience for physical investment gold. The current release uses verified public product and dealer pages and intentionally displays no live prices until an authorised product feed is connected.

## Included

- Search, format and delivery-region filters with URL state
- Product comparison for up to four items
- Responsive premium interface
- Buying guide, research references, FAQ and affiliate disclosure
- Server-side Amazon.de Creators API product feed using PartnerNet ID `Onlinestarkei-21`
- Live ASINs, parent ASINs, product images, availability, features and current Euro prices
- Parent-ASIN model deduplication, 30-minute caching, request timeouts and a price-free outage state
- SEO metadata and sitemap

## External integrations still required

- Authorised dealer affiliate programmes and product feeds
- Live spot-price and currency data
- Verified shipping-cost calculation by destination
- Operator identity and jurisdiction-specific legal text

Run locally with `pnpm install` and `pnpm dev`.
