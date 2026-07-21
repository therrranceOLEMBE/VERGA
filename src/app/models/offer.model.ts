export type OfferPricingType = 'kilo' | 'container' | 'metreCube';

export type OfferDestinationRoute =
  | 'gabon-chine'
  | 'gabon-france'
  | 'gabon-senegal'
  | 'gabon-maroc'
  | 'gabon-etats-unis'
  | 'gabon-canada'
  | 'gabon-burkina'
  | 'libreville-port-gentil'
  | 'libreville-franceville';

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
  departureCountry: string;
  arrivalCountry: string;
  promotion?: boolean;
  verified?: boolean;
  quantiteMin?: number;
  quantiteEntier?: boolean;
  /** Capacité illimitée : pas de réservation partielle possible */
  capaciteIllimitee?: boolean;
}
