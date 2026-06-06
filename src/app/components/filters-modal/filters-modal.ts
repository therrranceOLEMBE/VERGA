import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DEFAULT_OFFER_FILTERS,
  OfferFilters,
  OfferFiltersService,
} from '../../services/offer-filters.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-filters-modal',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './filters-modal.html',
})
export class FiltersModal {
  private readonly filtersService = inject(OfferFiltersService);

  readonly closed = output<void>();
  readonly applied = output<void>();

  protected readonly category = signal(this.filtersService.filters().category);
  protected readonly date = signal(this.filtersService.filters().date);
  protected readonly location = signal(this.filtersService.filters().location);
  protected readonly sortBy = signal(this.filtersService.filters().sortBy);
  protected readonly verifiedOnly = signal(this.filtersService.filters().verifiedOnly);

  protected readonly categories = [
    { value: '', labelKey: 'filters.cat.all' },
    { value: 'maritime', labelKey: 'filters.cat.maritime' },
    { value: 'aerien', labelKey: 'filters.cat.air' },
    { value: 'routier', labelKey: 'filters.cat.road' },
    { value: 'entreposage', labelKey: 'filters.cat.storage' },
  ];

  protected readonly sortOptions = [
    { value: 'recommended', labelKey: 'filters.sort.recommended' },
    { value: 'price-asc', labelKey: 'filters.sort.priceAsc' },
    { value: 'price-desc', labelKey: 'filters.sort.priceDesc' },
    { value: 'date-asc', labelKey: 'filters.sort.dateAsc' },
  ];

  protected close(): void {
    this.closed.emit();
  }

  protected reset(): void {
    this.category.set(DEFAULT_OFFER_FILTERS.category);
    this.date.set(DEFAULT_OFFER_FILTERS.date);
    this.location.set(DEFAULT_OFFER_FILTERS.location);
    this.sortBy.set(DEFAULT_OFFER_FILTERS.sortBy);
    this.verifiedOnly.set(DEFAULT_OFFER_FILTERS.verifiedOnly);
    this.filtersService.reset();
  }

  protected apply(): void {
    const filters: OfferFilters = {
      category: this.category(),
      date: this.date(),
      location: this.location().trim(),
      sortBy: this.sortBy(),
      verifiedOnly: this.verifiedOnly(),
    };
    this.filtersService.apply(filters);
    this.applied.emit();
    this.close();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
