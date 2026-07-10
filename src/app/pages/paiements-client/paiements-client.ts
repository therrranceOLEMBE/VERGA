import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ClientPaiement, ClientPaiementStatut } from '../../models/client-paiement.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { ClientSessionService } from '../../services/client-session.service';
import { ParticulierService } from '../../services/particulier.service';
import { parseClientPaiementsListResponse } from '../../utils/client-paiement.util';

@Component({
  selector: 'app-paiements-client',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './paiements-client.html',
  styleUrl: './paiements-client.css',
})
export class PaiementsClient implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly language = inject(LanguageService);
  private readonly clientSession = inject(ClientSessionService);
  private readonly particulierService = inject(ParticulierService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly filterSearch = signal('');
  protected readonly filterStatut = signal<ClientPaiementStatut | ''>('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 10;

  protected readonly paiements = signal<ClientPaiement[]>([]);
  protected readonly totalPages = signal(1);
  protected readonly totalItems = signal(0);
  protected readonly resultsFrom = signal(0);
  protected readonly resultsTo = signal(0);

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );

  protected readonly resultsLabel = computed(() => {
    this.language.lang();
    const total = this.totalItems();
    if (total === 0) {
      return this.language.translate('clientBackoffice.paiements.empty');
    }
    return this.language.translate('clientBackoffice.paiements.results', {
      start: this.resultsFrom(),
      end: this.resultsTo(),
      total,
    });
  });

  protected readonly statutOptions: Array<{ value: ClientPaiementStatut | ''; labelKey: string }> = [
    { value: '', labelKey: 'clientBackoffice.paiements.filterStatusAll' },
    { value: 'en_attente', labelKey: 'clientBackoffice.paiements.status.en_attente' },
    { value: 'validé', labelKey: 'clientBackoffice.paiements.status.valide' },
    { value: 'remboursé', labelKey: 'clientBackoffice.paiements.status.rembourse' },
    { value: 'échec', labelKey: 'clientBackoffice.paiements.status.echec' },
  ];

  ngOnInit(): void {
    const search = this.route.snapshot.queryParamMap.get('search');
    if (search) {
      this.filterSearch.set(search);
    }
    this.loadPaiements();
  }

  protected resetFilters(): void {
    this.filterSearch.set('');
    this.filterStatut.set('');
    this.currentPage.set(1);
    this.loadPaiements();
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
    this.loadPaiements();
  }

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadPaiements();
    }
  }

  protected previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  protected nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  protected statusKey(statut: string): string {
    if (statut === 'validé') {
      return 'clientBackoffice.paiements.status.valide';
    }
    if (statut === 'remboursé') {
      return 'clientBackoffice.paiements.status.rembourse';
    }
    if (statut === 'échec') {
      return 'clientBackoffice.paiements.status.echec';
    }
    if (statut === 'en_attente') {
      return 'clientBackoffice.paiements.status.en_attente';
    }
    return 'clientBackoffice.paiements.status.unknown';
  }

  protected statusClass(statut: string): string {
    if (statut === 'validé') {
      return 'cespace-badge cespace-badge--success';
    }
    if (statut === 'remboursé') {
      return 'cespace-badge cespace-badge--muted';
    }
    if (statut === 'échec') {
      return 'cespace-badge cespace-badge--warn';
    }
    return 'cespace-badge cespace-badge--primary';
  }

  private loadPaiements(): void {
    const token = this.clientSession.getToken();
    if (!token) {
      this.loading.set(false);
      this.errorMessage.set('clientBackoffice.paiements.loadError');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const statut = this.filterStatut();
    this.particulierService
      .getPaiements(token, {
        search: this.filterSearch().trim() || undefined,
        statut: statut || undefined,
        page: this.currentPage(),
        per_page: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          const page = parseClientPaiementsListResponse(response);
          this.paiements.set(page.items);
          this.currentPage.set(page.currentPage);
          this.totalPages.set(page.lastPage);
          this.totalItems.set(page.total);
          this.resultsFrom.set(page.from);
          this.resultsTo.set(page.to);
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          console.error('[PaiementsClient] loadPaiements — erreur:', error);
          this.errorMessage.set('clientBackoffice.paiements.loadError');
          this.paiements.set([]);
          this.loading.set(false);
        },
      });
  }
}
