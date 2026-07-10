import { Injectable, signal } from '@angular/core';
import { ClientOffreLegacyType } from '../models/client-offre.model';
import { OfferDestinationRoute } from '../models/offer.model';

export interface OfferFilters {
  search: string;
  destination: string;
  destinationRoute: OfferDestinationRoute | '';
  type: ClientOffreLegacyType | '';
  type_offre_id: string;
  date_debut: string;
  date_fin: string;
}

export const DEFAULT_OFFER_FILTERS: OfferFilters = {
  search: '',
  destination: '',
  destinationRoute: '',
  type: '',
  type_offre_id: '',
  date_debut: '',
  date_fin: '',
};

function normalizeOfferFilters(filters: OfferFilters): OfferFilters {
  return {
    search: filters.search.trim(),
    destination: filters.destination.trim(),
    destinationRoute: filters.destinationRoute,
    type: filters.type,
    type_offre_id: filters.type_offre_id.trim(),
    date_debut: filters.date_debut,
    date_fin: filters.date_fin,
  };
}

function areOfferFiltersEqual(a: OfferFilters, b: OfferFilters): boolean {
  return (
    JSON.stringify(normalizeOfferFilters(a)) === JSON.stringify(normalizeOfferFilters(b))
  );
}

@Injectable({ providedIn: 'root' })
export class OfferFiltersService {
  readonly filters = signal<OfferFilters>({ ...DEFAULT_OFFER_FILTERS });

  apply(filters: OfferFilters): boolean {
    return this.setIfChanged(normalizeOfferFilters(filters));
  }

  patch(partial: Partial<OfferFilters>): boolean {
    return this.setIfChanged(
      normalizeOfferFilters({ ...this.filters(), ...partial }),
    );
  }

  reset(): boolean {
    return this.setIfChanged({ ...DEFAULT_OFFER_FILTERS });
  }

  private setIfChanged(next: OfferFilters): boolean {
    if (areOfferFiltersEqual(this.filters(), next)) {
      return false;
    }
    this.filters.set(next);
    return true;
  }
}
