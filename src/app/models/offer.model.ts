export type OfferPricingType = 'kilo' | 'container' | 'metreCube';

export interface Offer {
  id: string;
  title: string;
  likes: number;
  date: string;
  price: string;
  location: string;
  address: string;
  category: string;
  publisherName: string;
  publisherHandle: string;
  publisherInitials: string;
  logoBg: string;
  description: string;
  pricingType: OfferPricingType;
  promotion?: boolean;
  verified?: boolean;
}
