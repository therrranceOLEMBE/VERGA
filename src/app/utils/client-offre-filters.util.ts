import { ClientOffresQueryParams, ClientOffreLegacyType } from '../models/client-offre.model';
import { OfferDestinationRoute } from '../models/offer.model';
import { OfferFilters } from '../services/offer-filters.service';
import { DESTINATION_ROUTE_PAIRS } from './offer-destination.util';

export function buildClientOffresQueryFromFilters(  filters: OfferFilters,
  page: number,
  perPage: number,
): ClientOffresQueryParams {
  const params: ClientOffresQueryParams = {
    page,
    per_page: perPage,
  };

  const searchParts: string[] = [];
  if (filters.search.trim()) {
    searchParts.push(filters.search.trim());
  }

  if (filters.destinationRoute && DESTINATION_ROUTE_PAIRS[filters.destinationRoute]) {
    const [countryA, countryB] = DESTINATION_ROUTE_PAIRS[filters.destinationRoute];
    searchParts.push(countryA, countryB);
  }

  if (searchParts.length > 0) {
    params.search = searchParts.join(' ');
  }

  if (filters.destination.trim()) {
    params.destination = filters.destination.trim();
  }

  if (filters.type) {
    params.type = filters.type as ClientOffreLegacyType;
  }

  if (filters.type_offre_id.trim()) {
    params.type_offre_id = filters.type_offre_id.trim();
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
  if (filters.destination.trim()) count += 1;
  if (filters.destinationRoute) count += 1;
  if (filters.type) count += 1;
  if (filters.type_offre_id.trim()) count += 1;
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
