import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientColis, ClientColisDetail, ClientColisStatut } from '../../models/client-colis.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { ClientSessionService } from '../../services/client-session.service';
import { ParticulierService } from '../../services/particulier.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';
import { parseColisDetailResponse, parseColisListResponse } from '../../utils/client-colis.util';

@Component({
  selector: 'app-colis-client',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './colis-client.html',
  styleUrl: './colis-client.css',
})
export class ColisClient implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly language = inject(LanguageService);
  private readonly clientSession = inject(ClientSessionService);
  private readonly particulierService = inject(ParticulierService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly filterSearch = signal('');
  protected readonly filterStatut = signal<ClientColisStatut | ''>('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 10;

  protected readonly colis = signal<ClientColis[]>([]);
  protected readonly totalPages = signal(1);
  protected readonly totalItems = signal(0);
  protected readonly resultsFrom = signal(0);
  protected readonly resultsTo = signal(0);

  protected readonly detailOpen = signal(false);
  protected readonly detailLoading = signal(false);
  protected readonly detailError = signal('');
  protected readonly selectedColis = signal<ClientColisDetail | null>(null);

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );

  protected readonly resultsLabel = computed(() => {
    this.language.lang();
    const total = this.totalItems();
    if (total === 0) {
      return this.language.translate('clientBackoffice.colis.empty');
    }
    return this.language.translate('clientBackoffice.colis.results', {
      start: this.resultsFrom(),
      end: this.resultsTo(),
      total,
    });
  });

  protected readonly statutOptions: Array<{ value: ClientColisStatut | ''; labelKey: string }> = [
    { value: '', labelKey: 'clientBackoffice.colis.filterStatusAll' },
    { value: 'chez_client', labelKey: 'clientBackoffice.colis.status.chez_client' },
    { value: 'déposé', labelKey: 'clientBackoffice.colis.status.depose' },
    { value: 'en_transit', labelKey: 'clientBackoffice.colis.status.en_transit' },
    { value: 'arrivé', labelKey: 'clientBackoffice.colis.status.arrive' },
    { value: 'récupéré', labelKey: 'clientBackoffice.colis.status.recupere' },
  ];

  ngOnInit(): void {
    const search = this.route.snapshot.queryParamMap.get('search');
    if (search) {
      this.filterSearch.set(search);
    }
    this.loadColis();
  }

  protected resetFilters(): void {
    this.filterSearch.set('');
    this.filterStatut.set('');
    this.currentPage.set(1);
    this.loadColis();
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
    this.loadColis();
  }

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadColis();
    }
  }

  protected previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  protected nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  protected statusKey(statut: string): string {
    if (statut === 'chez_client') {
      return 'clientBackoffice.colis.status.chez_client';
    }
    if (statut === 'déposé') {
      return 'clientBackoffice.colis.status.depose';
    }
    if (statut === 'en_transit') {
      return 'clientBackoffice.colis.status.en_transit';
    }
    if (statut === 'arrivé') {
      return 'clientBackoffice.colis.status.arrive';
    }
    if (statut === 'récupéré') {
      return 'clientBackoffice.colis.status.recupere';
    }
    return 'clientBackoffice.colis.status.unknown';
  }

  protected statusClass(statut: string): string {
    if (statut === 'récupéré') {
      return 'cespace-badge cespace-badge--success';
    }
    if (statut === 'arrivé') {
      return 'cespace-badge cespace-badge--primary';
    }
    if (statut === 'en_transit') {
      return 'cespace-badge cespace-badge--warn';
    }
    if (statut === 'chez_client') {
      return 'cespace-badge cespace-badge--primary';
    }
    return 'cespace-badge cespace-badge--muted';
  }

  protected canViewCommande(item: ClientColis): boolean {
    return item.commande !== '—' && item.commande.length > 0;
  }

  protected viewCommande(item: ClientColis): void {
    if (!this.canViewCommande(item)) {
      return;
    }
    void this.router.navigate(['/espace-client/commandes'], {
      queryParams: { search: item.commande },
    });
  }

  protected openDetail(item: ClientColis): void {
    this.detailOpen.set(true);
    this.selectedColis.set({ ...item, historique: [] });
    this.detailLoading.set(true);
    this.detailError.set('');

    const token = this.clientSession.getToken();
    if (!token) {
      this.detailLoading.set(false);
      this.detailError.set('clientBackoffice.colis.loadError');
      return;
    }

    this.particulierService.getColisDetail(token, item.id).subscribe({
      next: (response) => {
        this.selectedColis.set(parseColisDetailResponse(response));
        this.detailLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('[ColisClient] openDetail — erreur:', error);
        if (error.status === 404) {
          this.selectedColis.set({ ...item, historique: [] });
          this.detailLoading.set(false);
          return;
        }
        this.detailError.set(this.resolveDetailError(error));
        this.detailLoading.set(false);
      },
    });
  }

  protected closeDetail(): void {
    this.detailOpen.set(false);
    this.selectedColis.set(null);
    this.detailLoading.set(false);
    this.detailError.set('');
  }

  protected onModalBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDetail();
    }
  }

  private loadColis(): void {
    const token = this.clientSession.getToken();
    if (!token) {
      this.loading.set(false);
      this.errorMessage.set('clientBackoffice.colis.loadError');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const statut = this.filterStatut();
    this.particulierService
      .getColis(token, {
        search: this.filterSearch().trim() || undefined,
        statut: statut || undefined,
        page: this.currentPage(),
        per_page: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          const page = parseColisListResponse(response);
          this.colis.set(page.items);
          this.currentPage.set(page.currentPage);
          this.totalPages.set(page.lastPage);
          this.totalItems.set(page.total);
          this.resultsFrom.set(page.from);
          this.resultsTo.set(page.to);
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          console.error('[ColisClient] loadColis — erreur:', error);
          this.errorMessage.set('clientBackoffice.colis.loadError');
          this.colis.set([]);
          this.loading.set(false);
        },
      });
  }

  private resolveDetailError(error: HttpErrorResponse): string {
    const apiMessage = extractApiErrorMessage(error);
    return apiMessage ?? 'clientBackoffice.colis.detailLoadError';
  }
}
