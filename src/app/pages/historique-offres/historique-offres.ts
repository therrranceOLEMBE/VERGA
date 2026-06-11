import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';

export type OfferHistoryPricingType = 'kilo' | 'container' | 'metreCube';

export interface OfferHistoryItem {
  id: string;
  code: string;
  title: string;
  offerType: OfferHistoryPricingType;
  transportType: 'aerien' | 'maritime' | 'terrestre';
  departureCountry: string;
  destinationCountry: string;
  price: string;
  availableQuantity: number;
  soldQuantity: number;
  departureDate: string;
  arrivalDate: string;
  publishedDate: string;
  status: 'active' | 'expired' | 'completed';
}

type OfferModal = 'detail' | 'edit' | 'delete';

@Component({
  selector: 'app-historique-offres',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './historique-offres.html',
  styleUrl: './historique-offres.css',
})
export class HistoriqueOffres {
  private readonly language = inject(LanguageService);

  protected readonly filterTitle = signal('');
  protected readonly filterOfferType = signal('');
  protected readonly filterTransport = signal('');
  protected readonly filterStatus = signal('');
  protected readonly filterYear = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 5;
  protected readonly activeModal = signal<OfferModal | null>(null);
  protected readonly selectedOffer = signal<OfferHistoryItem | null>(null);

  protected editTitle = '';
  protected editOfferType: OfferHistoryPricingType | '' = '';
  protected editTransportType: OfferHistoryItem['transportType'] | '' = '';
  protected editDepartureCountry = '';
  protected editDestinationCountry = '';
  protected editPrice = '';
  protected editAvailableQuantity = 0;
  protected editSoldQuantity = 0;
  protected editDepartureDate = '';
  protected editArrivalDate = '';
  protected editPublishedDate = '';
  protected editStatus: OfferHistoryItem['status'] | '' = '';

  protected readonly offerTypeOptions = [
    { value: '', labelKey: 'backoffice.offerHistory.allOfferTypes' },
    { value: 'kilo', labelKey: 'backoffice.createOffer.offerTypeKilo' },
    { value: 'container', labelKey: 'backoffice.createOffer.offerTypeContainer' },
    { value: 'metreCube', labelKey: 'backoffice.createOffer.offerTypeCubicMeter' },
  ];

  protected readonly transportOptions = [
    { value: '', labelKey: 'backoffice.offerHistory.allTransports' },
    { value: 'aerien', labelKey: 'backoffice.createOffer.transportAerial' },
    { value: 'maritime', labelKey: 'backoffice.createOffer.transportMaritime' },
    { value: 'terrestre', labelKey: 'backoffice.createOffer.transportTerrestrial' },
  ];

  protected readonly statusOptions = [
    { value: '', labelKey: 'backoffice.offerHistory.allStatuses' },
    { value: 'active', labelKey: 'backoffice.offerHistory.status.active' },
    { value: 'expired', labelKey: 'backoffice.offerHistory.status.expired' },
    { value: 'completed', labelKey: 'backoffice.offerHistory.status.completed' },
  ];

  protected readonly editOfferTypeOptions = [
    { value: 'kilo', labelKey: 'backoffice.createOffer.offerTypeKilo' },
    { value: 'container', labelKey: 'backoffice.createOffer.offerTypeContainer' },
    { value: 'metreCube', labelKey: 'backoffice.createOffer.offerTypeCubicMeter' },
  ];

  protected readonly editTransportOptions = [
    { value: 'aerien', labelKey: 'backoffice.createOffer.transportAerial' },
    { value: 'maritime', labelKey: 'backoffice.createOffer.transportMaritime' },
    { value: 'terrestre', labelKey: 'backoffice.createOffer.transportTerrestrial' },
  ];

  protected readonly editStatusOptions = [
    { value: 'active', labelKey: 'backoffice.offerHistory.status.active' },
    { value: 'expired', labelKey: 'backoffice.offerHistory.status.expired' },
    { value: 'completed', labelKey: 'backoffice.offerHistory.status.completed' },
  ];

  protected readonly yearOptions = ['', '2026', '2025', '2024'];

  private readonly offers = signal<OfferHistoryItem[]>([
    { id: '1', code: 'OFF-2026-00042', title: 'Libreville → Paris — fret aérien', offerType: 'kilo', transportType: 'aerien', departureCountry: 'Gabon', destinationCountry: 'France', price: '6 500 F CFA / kg', availableQuantity: 120, soldQuantity: 85, departureDate: '2026-07-12', arrivalDate: '2026-07-18', publishedDate: '2026-06-01', status: 'active' },
    { id: '2', code: 'OFF-2026-00038', title: 'Dakar → Libreville — maritime', offerType: 'kilo', transportType: 'maritime', departureCountry: 'Sénégal', destinationCountry: 'Gabon', price: '3 200 F CFA / kg', availableQuantity: 500, soldQuantity: 500, departureDate: '2026-05-20', arrivalDate: '2026-05-28', publishedDate: '2026-04-15', status: 'completed' },
    { id: '3', code: 'OFF-2026-00035', title: 'Libreville → Shanghai — conteneur 40 pieds', offerType: 'container', transportType: 'maritime', departureCountry: 'Gabon', destinationCountry: 'Chine', price: '1 250 000 F CFA', availableQuantity: 6, soldQuantity: 2, departureDate: '2026-07-05', arrivalDate: '2026-08-02', publishedDate: '2026-05-30', status: 'active' },
    { id: '4', code: 'OFF-2026-00033', title: 'Libreville → Lyon — déménagement m³', offerType: 'metreCube', transportType: 'maritime', departureCountry: 'Gabon', destinationCountry: 'France', price: '25 000 F CFA / m³', availableQuantity: 48, soldQuantity: 12, departureDate: '2026-06-25', arrivalDate: '2026-07-20', publishedDate: '2026-05-18', status: 'active' },
    { id: '5', code: 'OFF-2026-00031', title: 'Lomé → Accra — terrestre', offerType: 'kilo', transportType: 'terrestre', departureCountry: 'Togo', destinationCountry: 'Ghana', price: '1 800 F CFA / kg', availableQuantity: 80, soldQuantity: 42, departureDate: '2026-06-28', arrivalDate: '2026-06-29', publishedDate: '2026-06-10', status: 'active' },
    { id: '6', code: 'OFF-2025-00112', title: 'Libreville → Bruxelles — aérien', offerType: 'kilo', transportType: 'aerien', departureCountry: 'Gabon', destinationCountry: 'Belgique', price: '7 000 F CFA / kg', availableQuantity: 60, soldQuantity: 60, departureDate: '2025-12-05', arrivalDate: '2025-12-07', publishedDate: '2025-11-01', status: 'completed' },
    { id: '7', code: 'OFF-2025-00108', title: 'Casablanca → Libreville — conteneur 20 pieds', offerType: 'container', transportType: 'maritime', departureCountry: 'Maroc', destinationCountry: 'Gabon', price: '980 000 F CFA', availableQuantity: 4, soldQuantity: 4, departureDate: '2025-11-20', arrivalDate: '2025-12-08', publishedDate: '2025-10-12', status: 'completed' },
    { id: '8', code: 'OFF-2025-00098', title: 'Casablanca → Libreville — maritime', offerType: 'kilo', transportType: 'maritime', departureCountry: 'Maroc', destinationCountry: 'Gabon', price: '2 900 F CFA / kg', availableQuantity: 300, soldQuantity: 0, departureDate: '2025-10-15', arrivalDate: '2025-10-28', publishedDate: '2025-09-01', status: 'expired' },
    { id: '9', code: 'OFF-2026-00028', title: 'Libreville → Montréal — volume m³', offerType: 'metreCube', transportType: 'maritime', departureCountry: 'Gabon', destinationCountry: 'Canada', price: '20 000 F CFA / m³', availableQuantity: 32, soldQuantity: 8, departureDate: '2026-08-15', arrivalDate: '2026-09-25', publishedDate: '2026-06-02', status: 'active' },
    { id: '10', code: 'OFF-2026-00025', title: 'Bamako → Libreville — terrestre', offerType: 'kilo', transportType: 'terrestre', departureCountry: 'Mali', destinationCountry: 'Gabon', price: '2 100 F CFA / kg', availableQuantity: 150, soldQuantity: 98, departureDate: '2026-08-02', arrivalDate: '2026-08-04', publishedDate: '2026-05-28', status: 'active' },
    { id: '11', code: 'OFF-2026-00022', title: 'Libreville → New York — conteneur', offerType: 'container', transportType: 'maritime', departureCountry: 'Gabon', destinationCountry: 'États-Unis', price: '2 100 000 F CFA', availableQuantity: 3, soldQuantity: 1, departureDate: '2026-09-01', arrivalDate: '2026-10-10', publishedDate: '2026-06-08', status: 'active' },
    { id: '12', code: 'OFF-2025-00087', title: 'Lagos → Lyon — aérien', offerType: 'kilo', transportType: 'aerien', departureCountry: 'Nigeria', destinationCountry: 'France', price: '8 200 F CFA / kg', availableQuantity: 90, soldQuantity: 90, departureDate: '2025-08-22', arrivalDate: '2025-08-24', publishedDate: '2025-07-10', status: 'completed' },
    { id: '13', code: 'OFF-2026-00018', title: 'Libreville → Montréal — aérien', offerType: 'kilo', transportType: 'aerien', departureCountry: 'Gabon', destinationCountry: 'Canada', price: '9 500 F CFA / kg', availableQuantity: 200, soldQuantity: 45, departureDate: '2026-09-10', arrivalDate: '2026-09-12', publishedDate: '2026-06-04', status: 'active' },
    { id: '14', code: 'OFF-2025-00072', title: 'Paris → Libreville — mobilier m³', offerType: 'metreCube', transportType: 'maritime', departureCountry: 'France', destinationCountry: 'Gabon', price: '22 000 F CFA / m³', availableQuantity: 24, soldQuantity: 24, departureDate: '2025-09-05', arrivalDate: '2025-10-01', publishedDate: '2025-08-01', status: 'completed' },
    { id: '15', code: 'OFF-2025-00065', title: 'Douala → Libreville — maritime', offerType: 'kilo', transportType: 'maritime', departureCountry: 'Cameroun', destinationCountry: 'Gabon', price: '2 500 F CFA / kg', availableQuantity: 180, soldQuantity: 0, departureDate: '2025-06-30', arrivalDate: '2025-07-05', publishedDate: '2025-05-12', status: 'expired' },
    { id: '16', code: 'OFF-2026-00012', title: 'Ouagadougou → Libreville — terrestre', offerType: 'kilo', transportType: 'terrestre', departureCountry: 'Burkina Faso', destinationCountry: 'Gabon', price: '1 950 F CFA / kg', availableQuantity: 100, soldQuantity: 100, departureDate: '2026-04-18', arrivalDate: '2026-04-20', publishedDate: '2026-03-05', status: 'completed' },
  ]);

  protected readonly filteredOffers = computed(() => {
    const title = this.filterTitle().trim().toLowerCase();
    const offerType = this.filterOfferType();
    const transport = this.filterTransport();
    const status = this.filterStatus();
    const year = this.filterYear();

    return this.offers().filter((offer) => {
      if (title && !offer.title.toLowerCase().includes(title)) return false;
      if (offerType && offer.offerType !== offerType) return false;
      if (transport && offer.transportType !== transport) return false;
      if (status && offer.status !== status) return false;
      if (year && !offer.publishedDate.startsWith(year)) return false;
      return true;
    });
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredOffers().length / this.pageSize)),
  );

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1),
  );

  protected readonly displayedOffers = computed(() => {
    const list = this.filteredOffers();
    const totalPages = Math.max(1, Math.ceil(list.length / this.pageSize));
    const page = Math.min(this.currentPage(), totalPages);
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  protected readonly resultsLabel = computed(() => {
    this.language.lang();
    const list = this.filteredOffers();
    const total = list.length;
    if (total === 0) {
      return this.language.translate('backoffice.offerHistory.empty');
    }
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize + 1;
    const end = Math.min(page * this.pageSize, total);
    return this.language.translate('backoffice.offerHistory.results', { start, end, total });
  });

  protected resetFilters(): void {
    this.filterTitle.set('');
    this.filterOfferType.set('');
    this.filterTransport.set('');
    this.filterStatus.set('');
    this.filterYear.set('');
    this.currentPage.set(1);
  }

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  protected previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  protected nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
  }

  protected openDetail(offer: OfferHistoryItem): void {
    this.selectedOffer.set(offer);
    this.activeModal.set('detail');
  }

  protected openEdit(offer: OfferHistoryItem): void {
    this.selectedOffer.set(offer);
    this.editTitle = offer.title;
    this.editOfferType = offer.offerType;
    this.editTransportType = offer.transportType;
    this.editDepartureCountry = offer.departureCountry;
    this.editDestinationCountry = offer.destinationCountry;
    this.editPrice = offer.price;
    this.editAvailableQuantity = offer.availableQuantity;
    this.editSoldQuantity = offer.soldQuantity;
    this.editDepartureDate = offer.departureDate;
    this.editArrivalDate = offer.arrivalDate;
    this.editPublishedDate = offer.publishedDate;
    this.editStatus = offer.status;
    this.activeModal.set('edit');
  }

  protected openDelete(offer: OfferHistoryItem): void {
    this.selectedOffer.set(offer);
    this.activeModal.set('delete');
  }

  protected closeModal(): void {
    this.activeModal.set(null);
    this.selectedOffer.set(null);
  }

  protected onModalBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  protected saveEdit(event: Event): void {
    event.preventDefault();
    const selected = this.selectedOffer();
    if (!selected || !this.editOfferType || !this.editTransportType || !this.editStatus) return;

    this.offers.update((list) =>
      list.map((offer) =>
        offer.id === selected.id
          ? {
              ...offer,
              title: this.editTitle.trim(),
              offerType: this.editOfferType as OfferHistoryPricingType,
              transportType: this.editTransportType as OfferHistoryItem['transportType'],
              departureCountry: this.editDepartureCountry.trim(),
              destinationCountry: this.editDestinationCountry.trim(),
              price: this.editPrice.trim(),
              availableQuantity: this.editAvailableQuantity,
              soldQuantity: this.editSoldQuantity,
              departureDate: this.editDepartureDate,
              arrivalDate: this.editArrivalDate,
              publishedDate: this.editPublishedDate,
              status: this.editStatus as OfferHistoryItem['status'],
            }
          : offer,
      ),
    );
    this.closeModal();
  }

  protected confirmDelete(): void {
    const selected = this.selectedOffer();
    if (!selected) return;

    this.offers.update((list) => list.filter((offer) => offer.id !== selected.id));
    this.closeModal();
    this.currentPage.set(Math.min(this.currentPage(), this.totalPages()));
  }

  protected transportKey(type: OfferHistoryItem['transportType']): string {
    const keys: Record<OfferHistoryItem['transportType'], string> = {
      aerien: 'backoffice.createOffer.transportAerial',
      maritime: 'backoffice.createOffer.transportMaritime',
      terrestre: 'backoffice.createOffer.transportTerrestrial',
    };
    return keys[type];
  }

  protected offerTypeKey(type: OfferHistoryPricingType): string {
    const keys: Record<OfferHistoryPricingType, string> = {
      kilo: 'backoffice.createOffer.offerTypeKilo',
      container: 'backoffice.createOffer.offerTypeContainer',
      metreCube: 'backoffice.createOffer.offerTypeCubicMeter',
    };
    return keys[type];
  }

  protected quantityLabel(offer: OfferHistoryItem, quantity: number): string {
    switch (offer.offerType) {
      case 'kilo':
        return `${quantity} kg`;
      case 'metreCube':
        return `${quantity} m³`;
      case 'container':
        return this.language.translate('backoffice.offerHistory.containerCount', { count: quantity });
    }
  }

  protected statusKey(status: OfferHistoryItem['status']): string {
    return `backoffice.offerHistory.status.${status}`;
  }
}
