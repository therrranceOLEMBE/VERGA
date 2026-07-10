import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientCommande, ClientCommandeStatut } from '../../models/client-commande.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { ClientSessionService } from '../../services/client-session.service';
import { ParticulierService } from '../../services/particulier.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';
import {
  isCommandeReservee,
  parseCommandesListResponse,
  resolvePaymentRedirectUrl,
  unwrapCommandeCreateResponse,
} from '../../utils/client-commande.util';

@Component({
  selector: 'app-commandes-client',
  imports: [FormsModule, TranslatePipe, RouterLink],
  templateUrl: './commandes-client.html',
  styleUrl: './commandes-client.css',
})
export class CommandesClient implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly language = inject(LanguageService);
  private readonly clientSession = inject(ClientSessionService);
  private readonly particulierService = inject(ParticulierService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly successIsReclamation = signal(false);
  protected readonly filterSearch = signal('');
  protected readonly filterStatut = signal<ClientCommandeStatut | ''>('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 10;

  protected readonly commandes = signal<ClientCommande[]>([]);
  protected readonly totalPages = signal(1);
  protected readonly totalItems = signal(0);
  protected readonly resultsFrom = signal(0);
  protected readonly resultsTo = signal(0);

  protected readonly createOpen = signal(false);
  protected readonly createLoading = signal(false);
  protected readonly createError = signal('');
  protected createCommandeId = '';
  protected createAgenceId = '';
  protected createCommandeCode = '';
  protected createAgenceName = '';
  protected createObjet = '';
  protected createDescription = '';

  protected readonly payOpen = signal(false);
  protected readonly payLoading = signal(false);
  protected readonly payError = signal('');
  protected payCommandeId = '';
  protected payCommandeCode = '';
  protected payQuantiteRestante = 0;
  protected payQuantiteRestanteLabel = '';
  protected payQuantitePayeeLabel = '';

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
    { value: 'réservée', labelKey: 'clientBackoffice.commandes.status.reservee' },
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
    const normalized = statut.trim().toLowerCase();
    if (normalized === 'confirmée' || normalized === 'confirmee') {
      return 'clientBackoffice.commandes.status.confirmee';
    }
    if (normalized === 'annulée' || normalized === 'annulee') {
      return 'clientBackoffice.commandes.status.annulee';
    }
    if (normalized === 'réservée' || normalized === 'reservee') {
      return 'clientBackoffice.commandes.status.reservee';
    }
    if (normalized === 'en_attente') {
      return 'clientBackoffice.commandes.status.en_attente';
    }
    return 'clientBackoffice.commandes.status.unknown';
  }

  protected statusClass(statut: string): string {
    const normalized = statut.trim().toLowerCase();
    if (normalized === 'confirmée' || normalized === 'confirmee') {
      return 'cespace-badge cespace-badge--success';
    }
    if (normalized === 'annulée' || normalized === 'annulee') {
      return 'cespace-badge cespace-badge--muted';
    }
    if (normalized === 'réservée' || normalized === 'reservee') {
      return 'cespace-badge cespace-badge--warn';
    }
    return 'cespace-badge cespace-badge--primary';
  }

  protected canCreateReclamation(commande: ClientCommande): boolean {
    return Boolean(commande.id?.trim()) && Boolean(commande.agenceId?.trim());
  }

  protected canPaySolde(commande: ClientCommande): boolean {
    return Boolean(commande.id?.trim()) && isCommandeReservee(commande.statut) && commande.quantiteRestante > 0;
  }

  protected openCreateReclamation(commande: ClientCommande): void {
    if (!this.canCreateReclamation(commande)) {
      this.errorMessage.set('clientBackoffice.commandes.createReclamationMissingData');
      return;
    }

    this.successMessage.set('');
    this.errorMessage.set('');
    this.createError.set('');
    this.createCommandeId = commande.id;
    this.createAgenceId = commande.agenceId;
    this.createCommandeCode = commande.code;
    this.createAgenceName = commande.agence || '—';
    this.createObjet = '';
    this.createDescription = '';
    this.createOpen.set(true);
  }

  protected closeCreateReclamation(): void {
    if (this.createLoading()) {
      return;
    }
    this.createOpen.set(false);
    this.createError.set('');
    this.resetCreateForm();
  }

  protected onCreateBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.createLoading()) {
      this.closeCreateReclamation();
    }
  }

  protected submitCreateReclamation(event: Event): void {
    event.preventDefault();
    this.createError.set('');

    const token = this.clientSession.getToken();
    if (!token) {
      this.createError.set('clientBackoffice.commandes.createReclamationAuth');
      return;
    }

    const objet = this.createObjet.trim();
    const description = this.createDescription.trim();
    if (!objet) {
      this.createError.set('clientBackoffice.commandes.createReclamationObjetRequired');
      return;
    }
    if (!description) {
      this.createError.set('clientBackoffice.commandes.createReclamationDescriptionRequired');
      return;
    }
    if (!this.createCommandeId.trim() || !this.createAgenceId.trim()) {
      this.createError.set('clientBackoffice.commandes.createReclamationMissingData');
      return;
    }

    this.createLoading.set(true);
    this.particulierService
      .createReclamation(token, {
        commande_id: this.createCommandeId.trim(),
        agence_id: this.createAgenceId.trim(),
        objet,
        description,
      })
      .subscribe({
        next: () => {
          this.createLoading.set(false);
          this.createOpen.set(false);
          this.resetCreateForm();
          this.successIsReclamation.set(true);
          this.successMessage.set('clientBackoffice.commandes.createReclamationSuccess');
        },
        error: (error: HttpErrorResponse) => {
          this.createError.set(this.resolveCreateError(error));
          this.createLoading.set(false);
        },
      });
  }

  protected openPaySolde(commande: ClientCommande): void {
    if (!this.canPaySolde(commande)) {
      this.errorMessage.set('clientBackoffice.commandes.paySoldeUnavailable');
      return;
    }

    this.successMessage.set('');
    this.errorMessage.set('');
    this.payError.set('');
    this.payCommandeId = commande.id;
    this.payCommandeCode = commande.code;
    this.payQuantiteRestante = commande.quantiteRestante;
    this.payQuantiteRestanteLabel = commande.quantiteRestanteLabel;
    this.payQuantitePayeeLabel = commande.quantitePayeeLabel;
    this.payOpen.set(true);
  }

  protected closePaySolde(): void {
    if (this.payLoading()) {
      return;
    }
    this.payOpen.set(false);
    this.payError.set('');
    this.resetPayForm();
  }

  protected onPayBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.payLoading()) {
      this.closePaySolde();
    }
  }

  protected submitPaySolde(event: Event): void {
    event.preventDefault();
    this.payError.set('');

    const token = this.clientSession.getToken();
    if (!token) {
      this.payError.set('clientBackoffice.commandes.paySoldeAuth');
      return;
    }

    if (!this.payCommandeId.trim() || this.payQuantiteRestante <= 0) {
      this.payError.set('clientBackoffice.commandes.paySoldeUnavailable');
      return;
    }

    this.payLoading.set(true);
    this.particulierService
      .payCommandeSolde(token, this.payCommandeId.trim(), this.payQuantiteRestante)
      .subscribe({
        next: (raw) => {
          const response = unwrapCommandeCreateResponse(raw);
          const redirectUrl = resolvePaymentRedirectUrl(response);
          if (redirectUrl) {
            window.location.assign(redirectUrl);
            return;
          }
          this.payLoading.set(false);
          this.payError.set('clientBackoffice.commandes.paySoldeMissingRedirect');
        },
        error: (error: HttpErrorResponse) => {
          this.payError.set(this.resolvePayError(error));
          this.payLoading.set(false);
        },
      });
  }

  private resetCreateForm(): void {
    this.createCommandeId = '';
    this.createAgenceId = '';
    this.createCommandeCode = '';
    this.createAgenceName = '';
    this.createObjet = '';
    this.createDescription = '';
  }

  private resetPayForm(): void {
    this.payCommandeId = '';
    this.payCommandeCode = '';
    this.payQuantiteRestante = 0;
    this.payQuantiteRestanteLabel = '';
    this.payQuantitePayeeLabel = '';
  }

  private resolveCreateError(error: HttpErrorResponse): string {
    if (error.status === 422) {
      return (
        extractApiErrorMessage(error) ||
        this.language.translate('clientBackoffice.commandes.createReclamationUnauthorized')
      );
    }
    return (
      extractApiErrorMessage(error) ||
      this.language.translate('clientBackoffice.commandes.createReclamationError')
    );
  }

  private resolvePayError(error: HttpErrorResponse): string {
    if (error.status === 404) {
      return (
        extractApiErrorMessage(error) ||
        this.language.translate('clientBackoffice.commandes.paySoldeNotFound')
      );
    }
    if (error.status === 422) {
      return (
        extractApiErrorMessage(error) ||
        this.language.translate('clientBackoffice.commandes.paySoldeInvalid')
      );
    }
    return (
      extractApiErrorMessage(error) ||
      this.language.translate('clientBackoffice.commandes.paySoldeError')
    );
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
