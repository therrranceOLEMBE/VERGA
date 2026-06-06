import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';

export interface OfferHistoryItem {
  id: string;
  code: string;
  title: string;
  transportType: 'aerien' | 'maritime' | 'terrestre';
  departureCountry: string;
  destinationCountry: string;
  pricePerKg: string;
  availableKg: number;
  soldKg: number;
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
  protected readonly filterTransport = signal('');
  protected readonly filterStatus = signal('');
  protected readonly filterYear = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 5;
  protected readonly activeModal = signal<OfferModal | null>(null);
  protected readonly selectedOffer = signal<OfferHistoryItem | null>(null);

  protected editTitle = '';
  protected editTransportType: OfferHistoryItem['transportType'] | '' = '';
  protected editDepartureCountry = '';
  protected editDestinationCountry = '';
  protected editPricePerKg = '';
  protected editAvailableKg = 0;
  protected editSoldKg = 0;
  protected editDepartureDate = '';
  protected editArrivalDate = '';
  protected editPublishedDate = '';
  protected editStatus: OfferHistoryItem['status'] | '' = '';

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
    { id: '1', code: 'OFF-2026-00042', title: 'Abidjan → Paris — fret aérien', transportType: 'aerien', departureCountry: "Côte d'Ivoire", destinationCountry: 'France', pricePerKg: '6 500 F CFA', availableKg: 120, soldKg: 85, departureDate: '2026-07-12', arrivalDate: '2026-07-18', publishedDate: '2026-06-01', status: 'active' },
    { id: '2', code: 'OFF-2026-00038', title: 'Dakar → Abidjan — maritime', transportType: 'maritime', departureCountry: 'Sénégal', destinationCountry: "Côte d'Ivoire", pricePerKg: '3 200 F CFA', availableKg: 500, soldKg: 500, departureDate: '2026-05-20', arrivalDate: '2026-05-28', publishedDate: '2026-04-15', status: 'completed' },
    { id: '3', code: 'OFF-2026-00031', title: 'Lomé → Accra — terrestre', transportType: 'terrestre', departureCountry: 'Togo', destinationCountry: 'Ghana', pricePerKg: '1 800 F CFA', availableKg: 80, soldKg: 42, departureDate: '2026-06-28', arrivalDate: '2026-06-29', publishedDate: '2026-06-10', status: 'active' },
    { id: '4', code: 'OFF-2025-00112', title: 'Abidjan → Bruxelles — aérien', transportType: 'aerien', departureCountry: "Côte d'Ivoire", destinationCountry: 'Belgique', pricePerKg: '7 000 F CFA', availableKg: 60, soldKg: 60, departureDate: '2025-12-05', arrivalDate: '2025-12-07', publishedDate: '2025-11-01', status: 'completed' },
    { id: '5', code: 'OFF-2025-00098', title: 'Casablanca → Abidjan — maritime', transportType: 'maritime', departureCountry: 'Maroc', destinationCountry: "Côte d'Ivoire", pricePerKg: '2 900 F CFA', availableKg: 300, soldKg: 0, departureDate: '2025-10-15', arrivalDate: '2025-10-28', publishedDate: '2025-09-01', status: 'expired' },
    { id: '6', code: 'OFF-2026-00025', title: 'Bamako → Abidjan — terrestre', transportType: 'terrestre', departureCountry: 'Mali', destinationCountry: "Côte d'Ivoire", pricePerKg: '2 100 F CFA', availableKg: 150, soldKg: 98, departureDate: '2026-08-02', arrivalDate: '2026-08-04', publishedDate: '2026-05-28', status: 'active' },
    { id: '7', code: 'OFF-2025-00087', title: 'Lagos → Lyon — aérien', transportType: 'aerien', departureCountry: 'Nigeria', destinationCountry: 'France', pricePerKg: '8 200 F CFA', availableKg: 90, soldKg: 90, departureDate: '2025-08-22', arrivalDate: '2025-08-24', publishedDate: '2025-07-10', status: 'completed' },
    { id: '8', code: 'OFF-2026-00018', title: 'Abidjan → Montréal — aérien', transportType: 'aerien', departureCountry: "Côte d'Ivoire", destinationCountry: 'Canada', pricePerKg: '9 500 F CFA', availableKg: 200, soldKg: 45, departureDate: '2026-09-10', arrivalDate: '2026-09-12', publishedDate: '2026-06-04', status: 'active' },
    { id: '9', code: 'OFF-2025-00065', title: 'Douala → Libreville — maritime', transportType: 'maritime', departureCountry: 'Cameroun', destinationCountry: 'Gabon', pricePerKg: '2 500 F CFA', availableKg: 180, soldKg: 0, departureDate: '2025-06-30', arrivalDate: '2025-07-05', publishedDate: '2025-05-12', status: 'expired' },
    { id: '10', code: 'OFF-2026-00012', title: 'Ouagadougou → Abidjan — terrestre', transportType: 'terrestre', departureCountry: 'Burkina Faso', destinationCountry: "Côte d'Ivoire", pricePerKg: '1 950 F CFA', availableKg: 100, soldKg: 100, departureDate: '2026-04-18', arrivalDate: '2026-04-20', publishedDate: '2026-03-05', status: 'completed' },
  ]);

  protected readonly filteredOffers = computed(() => {
    const title = this.filterTitle().trim().toLowerCase();
    const transport = this.filterTransport();
    const status = this.filterStatus();
    const year = this.filterYear();

    return this.offers().filter((offer) => {
      if (title && !offer.title.toLowerCase().includes(title)) return false;
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
    this.editTransportType = offer.transportType;
    this.editDepartureCountry = offer.departureCountry;
    this.editDestinationCountry = offer.destinationCountry;
    this.editPricePerKg = offer.pricePerKg;
    this.editAvailableKg = offer.availableKg;
    this.editSoldKg = offer.soldKg;
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
    if (!selected || !this.editTransportType || !this.editStatus) return;

    this.offers.update((list) =>
      list.map((offer) =>
        offer.id === selected.id
          ? {
              ...offer,
              title: this.editTitle.trim(),
              transportType: this.editTransportType as OfferHistoryItem['transportType'],
              departureCountry: this.editDepartureCountry.trim(),
              destinationCountry: this.editDestinationCountry.trim(),
              pricePerKg: this.editPricePerKg.trim(),
              availableKg: this.editAvailableKg,
              soldKg: this.editSoldKg,
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

  protected statusKey(status: OfferHistoryItem['status']): string {
    return `backoffice.offerHistory.status.${status}`;
  }
}
