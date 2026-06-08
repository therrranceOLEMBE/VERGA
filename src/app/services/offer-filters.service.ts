import { Injectable, signal } from '@angular/core';

export interface OfferFilters {
  category: string;
  destination: string;
  date: string;
  location: string;
  sortBy: string;
  verifiedOnly: boolean;
}

export const DEFAULT_OFFER_FILTERS: OfferFilters = {
  category: '',
  destination: '',
  date: '',
  location: '',
  sortBy: 'recommended',
  verifiedOnly: false,
};

@Injectable({ providedIn: 'root' })
export class OfferFiltersService {
  readonly filters = signal<OfferFilters>({ ...DEFAULT_OFFER_FILTERS });

  apply(filters: OfferFilters): void {
    this.filters.set({ ...filters });
  }

  reset(): void {
    this.filters.set({ ...DEFAULT_OFFER_FILTERS });
  }
}
