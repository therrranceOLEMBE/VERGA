import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AgenceOffre, AgenceOffreStatut } from '../../models/agence-offre.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { AgenceSessionService } from '../../services/agence-session.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';
import { parseOffreDetailResponse, parseOffresListResponse } from '../../utils/agence-offre.util';

@Component({
  selector: 'app-historique-offres',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './historique-offres.html',
  styleUrl: './historique-offres.css',
})
export class HistoriqueOffres implements OnInit {
  private readonly language = inject(LanguageService);
  private readonly agenceSession = inject(AgenceSessionService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly unauthenticated = signal(false);
  protected readonly filterSearch = signal('');
  protected readonly filterStatut = signal<AgenceOffreStatut | ''>('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 15;

  protected readonly offers = signal<AgenceOffre[]>([]);
  protected readonly totalPages = signal(1);
  protected readonly totalItems = signal(0);
  protected readonly resultsFrom = signal(0);
  protected readonly resultsTo = signal(0);
  protected readonly selectedOffer = signal<AgenceOffre | null>(null);
  protected readonly detailOpen = signal(false);
  protected readonly detailLoading = signal(false);
  protected readonly detailError = signal('');

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );

  protected readonly resultsLabel = computed(() => {
    this.language.lang();
    const total = this.totalItems();
    if (total === 0) {
      return this.language.translate('backoffice.offerHistory.empty');
    }
    return this.language.translate('backoffice.offerHistory.results', {
      start: this.resultsFrom(),
      end: this.resultsTo(),
      total,
    });
  });

  protected readonly statusOptions: Array<{ value: AgenceOffreStatut | ''; labelKey: string }> = [
    { value: '', labelKey: 'backoffice.offerHistory.allStatuses' },
    { value: 'active', labelKey: 'backoffice.offerHistory.status.active' },
    { value: 'inactive', labelKey: 'backoffice.offerHistory.status.inactive' },
    { value: 'archivée', labelKey: 'backoffice.offerHistory.status.archived' },
  ];

  ngOnInit(): void {
    this.loadOffres();
  }

  protected resetFilters(): void {
    this.filterSearch.set('');
    this.filterStatut.set('');
    this.currentPage.set(1);
    this.loadOffres();
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
    this.loadOffres();
  }

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadOffres();
    }
  }

  protected previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  protected nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  protected openDetail(offer: AgenceOffre): void {
    this.detailOpen.set(true);
    this.selectedOffer.set(null);
    this.detailLoading.set(true);
    this.detailError.set('');

    console.log('[HistoriqueOffres] loadOffreDetail — id:', offer.id);

    this.agenceSession.loadOffre(offer.id).subscribe({
      next: (response) => {
        console.log('[HistoriqueOffres] loadOffreDetail — réponse API brute:', response);
        const mapped = parseOffreDetailResponse(response);
        console.log('[HistoriqueOffres] loadOffreDetail — offre mappée:', mapped);
        this.selectedOffer.set(mapped);
        this.detailLoading.set(false);
      },
      error: (error: HttpErrorResponse | Error) => {
        console.error('[HistoriqueOffres] loadOffreDetail — erreur:', error);
        if (error instanceof Error && error.message === 'No agence token') {
          this.detailError.set('backoffice.offerHistory.authRequired');
        } else {
          this.detailError.set(this.resolveDetailError(error as HttpErrorResponse));
        }
        this.detailLoading.set(false);
      },
    });
  }

  protected closeDetail(): void {
    this.detailOpen.set(false);
    this.selectedOffer.set(null);
    this.detailLoading.set(false);
    this.detailError.set('');
  }

  protected onModalBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDetail();
    }
  }

  protected statusClass(statut: string): string {
    const normalized = statut.trim().toLowerCase();
    if (normalized === 'active' || normalized === 'actif') {
      return 'bg-verga-success-muted text-verga-success';
    }
    if (normalized === 'inactive' || normalized === 'inactif') {
      return 'bg-verga-surface text-verga-muted';
    }
    if (normalized === 'archivée' || normalized === 'archivee' || normalized === 'archived') {
      return 'bg-verga-primary-muted text-verga-primary';
    }
    return 'bg-verga-surface text-verga-muted';
  }

  private loadOffres(): void {
    if (!this.agenceSession.isAuthenticated()) {
      this.loading.set(false);
      this.unauthenticated.set(true);
      this.errorMessage.set('backoffice.offerHistory.authRequired');
      this.offers.set([]);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.unauthenticated.set(false);

    const statut = this.filterStatut();
    const params = {
      search: this.filterSearch().trim() || undefined,
      statut: statut || undefined,
      page: this.currentPage(),
      per_page: this.pageSize,
    };

    console.log('[HistoriqueOffres] loadOffres — params:', params);

    this.agenceSession.loadOffres(params).subscribe({
      next: (response) => {
        console.log('[HistoriqueOffres] loadOffres — réponse API brute:', response);
        const page = parseOffresListResponse(response);
        console.log('[HistoriqueOffres] loadOffres — offres mappées:', page.items);
        this.offers.set(page.items);
        this.currentPage.set(page.currentPage);
        this.totalPages.set(page.lastPage);
        this.totalItems.set(page.total);
        this.resultsFrom.set(page.from);
        this.resultsTo.set(page.to);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse | Error) => {
        console.error('[HistoriqueOffres] loadOffres — erreur:', error);
        if (error instanceof Error && error.message === 'No agence token') {
          this.unauthenticated.set(true);
          this.errorMessage.set('backoffice.offerHistory.authRequired');
        } else {
          this.errorMessage.set(this.resolveLoadError(error as HttpErrorResponse));
        }
        this.offers.set([]);
        this.loading.set(false);
      },
    });
  }

  private resolveLoadError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'backoffice.offerHistory.authRequired';
    }
    const apiMessage = extractApiErrorMessage(error);
    if (apiMessage) {
      return apiMessage;
    }
    return 'backoffice.offerHistory.loadError';
  }

  private resolveDetailError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'backoffice.offerHistory.authRequired';
    }
    if (error.status === 404) {
      return 'backoffice.offerHistory.detailNotFound';
    }
    const apiMessage = extractApiErrorMessage(error);
    if (apiMessage) {
      return apiMessage;
    }
    return 'backoffice.offerHistory.detailLoadError';
  }
}
