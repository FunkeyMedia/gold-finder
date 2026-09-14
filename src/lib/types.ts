export type AmazonProduct = {
  asin: string;
  parentAsin: string;
  brand: string;
  model: string;
  title: string;
  image: string;
  price?: { amount: number; currency: 'EUR'; display: string; source: 'amazon-creators-api' };
  available: true;
  availability: string;
  features: string[];
  detailPageUrl: string;
  fetchedAt: string;
};

export type ProductResponse = {
  products: AmazonProduct[];
  count: number;
  live: boolean;
  fetchedAt: string | null;
  message?: string;
};
