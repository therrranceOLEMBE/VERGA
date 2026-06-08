import { OfferDestinationRoute } from '../models/offer.model';

export const DESTINATION_ROUTE_PAIRS: Record<
  OfferDestinationRoute,
  readonly [string, string]
> = {
  'gabon-chine': ['Gabon', 'Chine'],
  'gabon-france': ['Gabon', 'France'],
  'gabon-senegal': ['Gabon', 'Sénégal'],
  'gabon-maroc': ['Gabon', 'Maroc'],
  'gabon-etats-unis': ['Gabon', 'États-Unis'],
  'gabon-canada': ['Gabon', 'Canada'],
};

/** Vrai si l'offre correspond au corridor, dans les deux sens (ex. Gabon→France et France→Gabon). */
export function matchesDestinationRoute(
  offer: { departureCountry: string; arrivalCountry: string },
  route: OfferDestinationRoute,
): boolean {
  const [countryA, countryB] = DESTINATION_ROUTE_PAIRS[route];
  return (
    (offer.departureCountry === countryA && offer.arrivalCountry === countryB) ||
    (offer.departureCountry === countryB && offer.arrivalCountry === countryA)
  );
}
