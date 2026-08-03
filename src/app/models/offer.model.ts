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
  publisherCity?: string;
  logoBg: string;
  /** URL du logo agence (si fourni par l’API) */
  logoUrl?: string;
  description: string;
  pricingType: OfferPricingType;
  departureCountry: string;
  arrivalCountry: string;
  departureDate?: string;
  depotDate?: string;
  capaciteDisponibleLabel?: string;
  capaciteTotaleLabel?: string;
  uniteLabel?: string;
  promotion?: boolean;
  verified?: boolean;
  quantiteMin?: number;
  quantiteEntier?: boolean;
  /** Capacité illimitée : pas de réservation partielle possible */
  capaciteIllimitee?: boolean;
}
