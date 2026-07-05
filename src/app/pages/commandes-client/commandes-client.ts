import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientCommande, ClientCommandeStatut } from '../../models/client-commande.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { ClientSessionService } from '../../services/client-session.service';
import { ParticulierService } from '../../services/particulier.service';
import { parseCommandesListResponse } from '../../utils/client-commande.util';

@Component({
  selector: 'app-commandes-client',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './commandes-client.html',
  styleUrl: './commandes-client.css',
})
export class CommandesClient implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly language = inject(LanguageService);
  private readonly clientSession = inject(ClientSessionService);
  private readonly particulierService = inject(ParticulierService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly filterSearch = signal('');
  protected readonly filterStatut = signal<ClientCommandeStatut | ''>('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 10;

  protected readonly commandes = signal<ClientCommande[]>([]);
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
      return this.language.translate('clientBackoffice.commandes.empty');
    }
    return this.language.translate('clientBackoffice.commandes.results', {
      start: this.resultsFrom(),
      end: this.resultsTo(),
      total,
    });
  });

  protected readonly statutOptions: Array<{ value: ClientCommandeStatut | ''; labelKey: string }> = [
    { value: '', labelKey: 'clientBackoffice.commandes.filterStatusAll' },
    { value: 'en_attente', labelKey: 'clientBackoffice.commandes.status.en_attente' },
    { value: 'confirmée', labelKey: 'clientBackoffice.commandes.status.confirmee' },
    { value: 'annulée', labelKey: 'clientBackoffice.commandes.status.annulee' },
  ];

  ngOnInit(): void {
    const search = this.route.snapshot.queryParamMap.get('search');
    if (search) {
      this.filterSearch.set(search);
    }
    this.loadCommandes();
  }

  protected resetFilters(): void {
    this.filterSearch.set('');
    this.filterStatut.set('');
    this.currentPage.set(1);
    this.loadCommandes();
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
    this.loadCommandes();
  }

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadCommandes();
    }
  }

  protected previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  protected nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  protected statusKey(statut: string): string {
    if (statut === 'confirmée') {
      return 'clientBackoffice.commandes.status.confirmee';
    }
    if (statut === 'annulée') {
      return 'clientBackoffice.commandes.status.annulee';
    }
    if (statut === 'en_attente') {
      return 'clientBackoffice.commandes.status.en_attente';
    }
    return 'clientBackoffice.commandes.status.unknown';
  }

  protected statusClass(statut: string): string {
    if (statut === 'confirmée') {
      return 'bg-verga-success-muted text-verga-success';
    }
    if (statut === 'annulée') {
      return 'bg-verga-surface text-verga-muted';
    }
    return 'bg-verga-primary-muted text-verga-primary';
  }

  protected canViewColis(commande: ClientCommande): boolean {
    return commande.code !== '—' && commande.code.length > 0;
  }

  protected viewColis(commande: ClientCommande): void {
    if (!this.canViewColis(commande)) {
      return;
    }
    void this.router.navigate(['/espace-client/colis'], {
      queryParams: { search: commande.code },
    });
  }

  private loadCommandes(): void {
    const token = this.clientSession.getToken();
    if (!token) {
      this.loading.set(false);
      this.errorMessage.set('clientBackoffice.commandes.loadError');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const statut = this.filterStatut();
    this.particulierService
      .getCommandes(token, {
        search: this.filterSearch().trim() || undefined,
        statut: statut || undefined,
        page: this.currentPage(),
        per_page: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          const page = parseCommandesListResponse(response);
          this.commandes.set(page.items);
          this.currentPage.set(page.currentPage);
          this.totalPages.set(page.lastPage);
          this.totalItems.set(page.total);
          this.resultsFrom.set(page.from);
          this.resultsTo.set(page.to);
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          console.error('[CommandesClient] loadCommandes — erreur:', error);
          this.errorMessage.set('clientBackoffice.commandes.loadError');
          this.commandes.set([]);
          this.loading.set(false);
        },
      });
  }
}
