// Amazon partner IDs per storefront. Client-safe: no server imports.
// fr stays empty until the amazon.fr Associates ID is known; links then go out untagged.
export const AMAZON_TAGS = {
  de: 'onlinestarkei-21',
  us: 'goldfindercom-20',
  uk: 'goldfindercom-21',
  fr: '',
} as const;
export const amazonTag = (region: string): string | undefined =>
  (AMAZON_TAGS as Record<string, string>)[region] || undefined;
