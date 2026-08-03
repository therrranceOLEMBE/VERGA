import { ClientOffresQueryParams, ClientOffreLegacyType } from '../models/client-offre.model';
import { OfferDestinationRoute } from '../models/offer.model';
import { OfferFilters } from '../services/offer-filters.service';
import { DESTINATION_ROUTE_PAIRS } from './offer-destination.util';

/** Lieu caractéristique d’un corridor → paramètre API `destination` (départ ou arrivée). */
export function destinationFromRoute(route: OfferDestinationRoute | ''): string {
  if (!route || !DESTINATION_ROUTE_PAIRS[route]) {
    return '';
  }
  const [, placeB] = DESTINATION_ROUTE_PAIRS[route];
  return placeB;
}

/**
 * Construit la query GET /client/offres à partir des filtres UI.
 * Params API : search, destination, type, type_offre_id, date_debut, date_fin, page, per_page.
 */
export function buildClientOffresQueryFromFilters(
  filters: OfferFilters,
  page: number,
  perPage: number,
): ClientOffresQueryParams {
  const params: ClientOffresQueryParams = {
    page,
    per_page: perPage,
  };

  if (filters.search.trim()) {
    params.search = filters.search.trim();
  }

  const destination =
    filters.destination.trim() || destinationFromRoute(filters.destinationRoute);
  if (destination) {
    params.destination = destination;
  }

  // type_offre_id recommandé : prioritaire sur le type legacy
  if (filters.type_offre_id.trim()) {
    params.type_offre_id = filters.type_offre_id.trim();
  } else if (filters.type) {
    params.type = filters.type as ClientOffreLegacyType;
  }

  if (filters.date_debut) {
    params.date_debut = filters.date_debut;
  }

  if (filters.date_fin) {
    params.date_fin = filters.date_fin;
  }

  return params;
}

export function countActiveOfferFilters(filters: OfferFilters): number {
  let count = 0;
  if (filters.search.trim()) count += 1;
  if (filters.destination.trim() || filters.destinationRoute) count += 1;
  if (filters.type_offre_id.trim() || filters.type) count += 1;
  if (filters.date_debut) count += 1;
  if (filters.date_fin) count += 1;
  return count;
}

export const OFFER_DESTINATION_FILTERS: Array<{
  value: '' | OfferDestinationRoute;
  labelKey: string;
}> = [
  { value: '', labelKey: 'home.destination.all' },
  { value: 'gabon-chine', labelKey: 'home.destination.gabonChine' },
  { value: 'gabon-france', labelKey: 'home.destination.gabonFrance' },
  { value: 'gabon-senegal', labelKey: 'home.destination.gabonSenegal' },
  { value: 'gabon-maroc', labelKey: 'home.destination.gabonMaroc' },
  { value: 'gabon-etats-unis', labelKey: 'home.destination.gabonEtatsUnis' },
  { value: 'gabon-canada', labelKey: 'home.destination.gabonCanada' },
  { value: 'gabon-burkina', labelKey: 'home.destination.gabonBurkina' },
  { value: 'libreville-port-gentil', labelKey: 'home.destination.librevillePortGentil' },
  { value: 'libreville-franceville', labelKey: 'home.destination.librevilleFranceville' },
];
