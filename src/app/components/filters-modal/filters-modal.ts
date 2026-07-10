import { Component, inject, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DEFAULT_OFFER_FILTERS,
  OfferFilters,
  OfferFiltersService,
} from '../../services/offer-filters.service';
import { ClientOfferCatalogService } from '../../services/client-offre-catalog.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ClientOffreLegacyType } from '../../models/client-offre.model';
import { OfferDestinationRoute } from '../../models/offer.model';
import { TypeOffre } from '../../models/type-offre.model';
import { OFFER_DESTINATION_FILTERS } from '../../utils/client-offre-filters.util';

@Component({
  selector: 'app-filters-modal',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './filters-modal.html',
  styleUrl: './filters-modal.css',
})
export class FiltersModal implements OnInit {
  private readonly filtersService = inject(OfferFiltersService);
  private readonly catalogService = inject(ClientOfferCatalogService);

  readonly closed = output<void>();
  readonly applied = output<void>();

  protected readonly search = signal('');
  protected readonly destination = signal('');
  protected readonly destinationRoute = signal<OfferDestinationRoute | ''>('');
  protected readonly type = signal<ClientOffreLegacyType | ''>('');
  protected readonly typeOffreId = signal('');
  protected readonly dateDebut = signal('');
  protected readonly dateFin = signal('');
  protected readonly loadingTypeOffres = signal(false);
  protected readonly typeOffreOptions = signal<TypeOffre[]>([]);

  protected readonly destinationFilters = OFFER_DESTINATION_FILTERS;

  protected readonly legacyTypeOptions: Array<{ value: ClientOffreLegacyType | ''; labelKey: string }> = [
    { value: '', labelKey: 'filters.type.all' },
    { value: 'particulier', labelKey: 'filters.type.particulier' },
    { value: 'metre_cube', labelKey: 'filters.type.metreCube' },
    { value: 'conteneur', labelKey: 'filters.type.conteneur' },
  ];

  ngOnInit(): void {
    const current = this.filtersService.filters();
    this.search.set(current.search);
    this.destination.set(current.destination);
    this.destinationRoute.set(current.destinationRoute);
    this.type.set(current.type);
    this.typeOffreId.set(current.type_offre_id);
    this.dateDebut.set(current.date_debut);
    this.dateFin.set(current.date_fin);
    this.loadTypeOffres();
  }

  protected selectDestinationRoute(value: '' | OfferDestinationRoute): void {
    this.destinationRoute.set(value);
  }

  protected close(): void {
    this.closed.emit();
  }

  protected reset(): void {
    this.clearLocalForm();
    const changed = this.filtersService.reset();
    if (changed) {
      this.applied.emit();
    }
    this.close();
  }

  protected apply(): void {
    const filters: OfferFilters = {
      search: this.search().trim(),
      destination: this.destination().trim(),
      destinationRoute: this.destinationRoute(),
      type: this.type(),
      type_offre_id: this.typeOffreId().trim(),
      date_debut: this.dateDebut(),
      date_fin: this.dateFin(),
    };
    const changed = this.filtersService.apply(filters);
    if (changed) {
      this.applied.emit();
    }
    this.close();
  }

  private clearLocalForm(): void {
    this.search.set(DEFAULT_OFFER_FILTERS.search);
    this.destination.set(DEFAULT_OFFER_FILTERS.destination);
    this.destinationRoute.set(DEFAULT_OFFER_FILTERS.destinationRoute);
    this.type.set(DEFAULT_OFFER_FILTERS.type);
    this.typeOffreId.set(DEFAULT_OFFER_FILTERS.type_offre_id);
    this.dateDebut.set(DEFAULT_OFFER_FILTERS.date_debut);
    this.dateFin.set(DEFAULT_OFFER_FILTERS.date_fin);
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  private loadTypeOffres(): void {
    this.loadingTypeOffres.set(true);
    this.catalogService.loadTypeOffres().subscribe({
      next: (items) => {
        this.typeOffreOptions.set(items);
        this.loadingTypeOffres.set(false);
      },
      error: () => {
        this.typeOffreOptions.set([]);
        this.loadingTypeOffres.set(false);
      },
    });
  }
}
