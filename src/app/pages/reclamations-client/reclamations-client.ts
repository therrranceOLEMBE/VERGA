import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientReclamation, ClientReclamationStatut } from '../../models/client-reclamation.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { ClientSessionService } from '../../services/client-session.service';
import { ParticulierService } from '../../services/particulier.service';
import { parseReclamationsListResponse } from '../../utils/client-reclamation.util';

@Component({
  selector: 'app-reclamations-client',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './reclamations-client.html',
  styleUrl: './reclamations-client.css',
})
export class ReclamationsClient implements OnInit {
  private readonly router = inject(Router);
  private readonly language = inject(LanguageService);
  private readonly clientSession = inject(ClientSessionService);
  private readonly particulierService = inject(ParticulierService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly filterStatut = signal<ClientReclamationStatut | ''>('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 10;

  protected readonly reclamations = signal<ClientReclamation[]>([]);
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
      return this.language.translate('clientBackoffice.reclamations.empty');
    }
    return this.language.translate('clientBackoffice.reclamations.results', {
      start: this.resultsFrom(),
      end: this.resultsTo(),
      total,
    });
  });

  protected readonly statutOptions: Array<{ value: ClientReclamationStatut | ''; labelKey: string }> = [
    { value: '', labelKey: 'clientBackoffice.reclamations.filterStatusAll' },
    { value: 'ouverte', labelKey: 'clientBackoffice.reclamations.status.ouverte' },
    { value: 'en_cours', labelKey: 'clientBackoffice.reclamations.status.en_cours' },
    { value: 'résolue', labelKey: 'clientBackoffice.reclamations.status.resolue' },
    { value: 'fermée', labelKey: 'clientBackoffice.reclamations.status.fermee' },
  ];

  ngOnInit(): void {
    this.loadReclamations();
  }

  protected resetFilters(): void {
    this.filterStatut.set('');
    this.currentPage.set(1);
    this.loadReclamations();
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
    this.loadReclamations();
  }

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadReclamations();
    }
  }

  protected previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  protected nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  protected statusKey(statut: string): string {
    if (statut === 'ouverte') {
      return 'clientBackoffice.reclamations.status.ouverte';
    }
    if (statut === 'en_cours') {
      return 'clientBackoffice.reclamations.status.en_cours';
    }
    if (statut === 'résolue') {
      return 'clientBackoffice.reclamations.status.resolue';
    }
    if (statut === 'fermée') {
      return 'clientBackoffice.reclamations.status.fermee';
    }
    return 'clientBackoffice.reclamations.status.unknown';
  }

  protected statusClass(statut: string): string {
    if (statut === 'résolue') {
      return 'bg-verga-success-muted text-verga-success';
    }
    if (statut === 'fermée') {
      return 'bg-verga-surface text-verga-muted';
    }
    if (statut === 'en_cours') {
      return 'bg-amber-50 text-amber-700';
    }
    return 'bg-verga-primary-muted text-verga-primary';
  }

  protected canViewCommande(item: ClientReclamation): boolean {
    return item.commandeCode.length > 0 && item.commandeCode !== '—';
  }

  protected viewCommande(item: ClientReclamation): void {
    if (!this.canViewCommande(item)) {
      return;
    }
    void this.router.navigate(['/espace-client/commandes'], {
      queryParams: { search: item.commandeCode },
    });
  }

  private loadReclamations(): void {
    const token = this.clientSession.getToken();
    if (!token) {
      this.loading.set(false);
      this.errorMessage.set('clientBackoffice.reclamations.loadError');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const statut = this.filterStatut();
    this.particulierService
      .getReclamations(token, {
        statut: statut || undefined,
        page: this.currentPage(),
        per_page: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          const page = parseReclamationsListResponse(response);
          this.reclamations.set(page.items);
          this.currentPage.set(page.currentPage);
          this.totalPages.set(page.lastPage);
          this.totalItems.set(page.total);
          this.resultsFrom.set(page.from);
          this.resultsTo.set(page.to);
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          console.error('[ReclamationsClient] loadReclamations — erreur:', error);
          this.errorMessage.set('clientBackoffice.reclamations.loadError');
          this.reclamations.set([]);
          this.loading.set(false);
        },
      });
  }
}
