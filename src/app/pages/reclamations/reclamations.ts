import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AgenceReclamation, AgenceReclamationDetail, AgenceReclamationStatut, AgenceReclamationTargetStatut } from '../../models/agence-reclamation.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { AgenceSessionService } from '../../services/agence-session.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';
import {
  getAllowedReclamationTransitions,
  isAgenceReclamationTargetStatut,
  parseAgenceReclamationDetailResponse,
  parseAgenceReclamationsListResponse,
} from '../../utils/agence-reclamation.util';

@Component({
  selector: 'app-reclamations',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './reclamations.html',
  styleUrl: './reclamations.css',
})
export class Reclamations implements OnInit {
  private readonly router = inject(Router);
  private readonly language = inject(LanguageService);
  private readonly agenceSession = inject(AgenceSessionService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly unauthenticated = signal(false);
  protected readonly filterSearch = signal('');
  protected readonly filterStatut = signal<AgenceReclamationStatut | ''>('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 15;

  protected readonly reclamations = signal<AgenceReclamation[]>([]);
  protected readonly totalPages = signal(1);
  protected readonly totalItems = signal(0);
  protected readonly resultsFrom = signal(0);
  protected readonly resultsTo = signal(0);

  protected readonly detailOpen = signal(false);
  protected readonly detailLoading = signal(false);
  protected readonly detailError = signal('');
  protected readonly selectedReclamation = signal<AgenceReclamationDetail | null>(null);

  protected readonly statusUpdateOpen = signal(false);
  protected readonly statusUpdateLoading = signal(false);
  protected readonly statusUpdateError = signal('');
  protected readonly statusUpdateTarget = signal<{
    id: string;
    objet: string;
    currentStatut: string;
    nextStatut: AgenceReclamationTargetStatut;
  } | null>(null);
  protected readonly updatingReclamationId = signal('');

  protected readonly createOpen = signal(false);
  protected readonly createLoading = signal(false);
  protected readonly createError = signal('');
  protected readonly createSuccess = signal('');

  protected createNom = '';
  protected createPrenom = '';
  protected createTelephone = '';
  protected createEmail = '';
  protected createObjet = '';
  protected createDescription = '';
  protected createCommandeId = '';

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );

  protected readonly resultsLabel = computed(() => {
    this.language.lang();
    const total = this.totalItems();
    if (total === 0) {
      return this.language.translate('backoffice.reclamations.empty');
    }
    return this.language.translate('backoffice.reclamations.results', {
      start: this.resultsFrom(),
      end: this.resultsTo(),
      total,
    });
  });

  protected readonly statutOptions: Array<{ value: AgenceReclamationStatut | ''; labelKey: string }> = [
    { value: '', labelKey: 'backoffice.reclamations.filterStatusAll' },
    { value: 'ouverte', labelKey: 'backoffice.reclamations.status.ouverte' },
    { value: 'en_cours', labelKey: 'backoffice.reclamations.status.en_cours' },
    { value: 'résolue', labelKey: 'backoffice.reclamations.status.resolue' },
    { value: 'fermée', labelKey: 'backoffice.reclamations.status.fermee' },
  ];

  ngOnInit(): void {
    this.loadReclamations();
  }

  protected resetFilters(): void {
    this.filterSearch.set('');
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
      return 'backoffice.reclamations.status.ouverte';
    }
    if (statut === 'en_cours') {
      return 'backoffice.reclamations.status.en_cours';
    }
    if (statut === 'résolue') {
      return 'backoffice.reclamations.status.resolue';
    }
    if (statut === 'fermée') {
      return 'backoffice.reclamations.status.fermee';
    }
    return 'backoffice.reclamations.status.unknown';
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

  protected canViewCommande(item: AgenceReclamation | AgenceReclamationDetail): boolean {
    return item.commande.length > 0 && item.commande !== '—';
  }

  protected allowedTransitions(statut: string): AgenceReclamationTargetStatut[] {
    return getAllowedReclamationTransitions(statut);
  }

  protected canUpdateStatus(item: AgenceReclamation | AgenceReclamationDetail): boolean {
    return this.allowedTransitions(item.statut).length > 0;
  }

  protected isUpdating(itemId: string): boolean {
    return this.updatingReclamationId() === itemId;
  }

  protected statusActionLabel(nextStatut: AgenceReclamationTargetStatut): string {
    return this.language.translate('backoffice.reclamations.actionAdvanceTo', {
      statut: this.language.translate(this.statusKey(nextStatut)),
    });
  }

  protected statusUpdateModalSubtitle(target: { objet: string; nextStatut: AgenceReclamationTargetStatut }): string {
    return this.language.translate('backoffice.reclamations.statusUpdateModalSubtitle', {
      objet: target.objet,
      statut: this.language.translate(this.statusKey(target.nextStatut)),
    });
  }

  protected openStatusUpdate(
    item: AgenceReclamation | AgenceReclamationDetail,
    nextStatut: AgenceReclamationTargetStatut,
  ): void {
    if (!this.allowedTransitions(item.statut).includes(nextStatut)) {
      return;
    }

    this.statusUpdateTarget.set({
      id: item.id,
      objet: item.objet,
      currentStatut: item.statut,
      nextStatut,
    });
    this.statusUpdateError.set('');
    this.statusUpdateOpen.set(true);
  }

  protected closeStatusUpdate(): void {
    this.statusUpdateOpen.set(false);
    this.statusUpdateTarget.set(null);
    this.statusUpdateError.set('');
    this.statusUpdateLoading.set(false);
  }

  protected onStatusUpdateBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.statusUpdateLoading()) {
      this.closeStatusUpdate();
    }
  }

  protected confirmStatusUpdate(): void {
    const target = this.statusUpdateTarget();
    if (!target) {
      return;
    }

    const nextStatut = target.nextStatut;
    if (!isAgenceReclamationTargetStatut(nextStatut)) {
      this.statusUpdateError.set('backoffice.reclamations.statusUpdateInvalid');
      return;
    }

    this.statusUpdateLoading.set(true);
    this.statusUpdateError.set('');
    this.updatingReclamationId.set(target.id);

    this.agenceSession.updateReclamationStatut(target.id, { statut: nextStatut }).subscribe({
      next: (response) => {
        const updated = parseAgenceReclamationDetailResponse(response);
        this.applyReclamationUpdate(updated);
        this.statusUpdateLoading.set(false);
        this.updatingReclamationId.set('');
        this.closeStatusUpdate();
      },
      error: (error: HttpErrorResponse | Error) => {
        if (error instanceof Error && error.message === 'No agence token') {
          this.statusUpdateError.set('backoffice.reclamations.authRequired');
        } else {
          this.statusUpdateError.set(this.resolveStatusUpdateError(error as HttpErrorResponse));
        }
        this.statusUpdateLoading.set(false);
        this.updatingReclamationId.set('');
      },
    });
  }

  protected openDetail(item: AgenceReclamation): void {
    this.detailOpen.set(true);
    this.selectedReclamation.set(null);
    this.detailLoading.set(true);
    this.detailError.set('');

    this.agenceSession.loadReclamationDetail(item.id).subscribe({
      next: (response) => {
        this.selectedReclamation.set(parseAgenceReclamationDetailResponse(response));
        this.detailLoading.set(false);
      },
      error: (error: HttpErrorResponse | Error) => {
        if (error instanceof Error && error.message === 'No agence token') {
          this.detailError.set('backoffice.reclamations.authRequired');
        } else {
          this.detailError.set(this.resolveDetailError(error as HttpErrorResponse));
        }
        this.detailLoading.set(false);
      },
    });
  }

  protected closeDetail(): void {
    this.detailOpen.set(false);
    this.selectedReclamation.set(null);
    this.detailLoading.set(false);
    this.detailError.set('');
  }

  protected onModalBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.statusUpdateLoading()) {
      this.closeDetail();
    }
  }

  protected viewCommande(item: AgenceReclamation | AgenceReclamationDetail): void {
    if (!this.canViewCommande(item)) {
      return;
    }
    void this.router.navigate(['/backoffice/commandes'], {
      queryParams: { search: item.commande },
    });
  }

  protected openCreate(): void {
    this.resetCreateForm();
    this.createError.set('');
    this.createSuccess.set('');
    this.createOpen.set(true);
  }

  protected closeCreate(): void {
    if (this.createLoading()) {
      return;
    }
    this.createOpen.set(false);
    this.createError.set('');
  }

  protected onCreateBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.createLoading()) {
      this.closeCreate();
    }
  }

  protected submitCreate(event: Event): void {
    event.preventDefault();
    this.createError.set('');

    if (!this.agenceSession.isAuthenticated()) {
      this.createError.set('backoffice.reclamations.authRequired');
      return;
    }

    if (!this.isCreateFormValid()) {
      this.createError.set('backoffice.reclamations.createValidationError');
      return;
    }

    const commandeId = this.createCommandeId.trim();
    const payload = {
      nom: this.createNom.trim(),
      prenom: this.createPrenom.trim(),
      telephone: this.createTelephone.trim(),
      email: this.createEmail.trim(),
      objet: this.createObjet.trim(),
      description: this.createDescription.trim(),
      ...(commandeId ? { commande_id: commandeId } : {}),
    };

    this.createLoading.set(true);

    this.agenceSession.createReclamation(payload).subscribe({
      next: () => {
        this.createLoading.set(false);
        this.createOpen.set(false);
        this.resetCreateForm();
        this.createSuccess.set('backoffice.reclamations.createSuccess');
        this.currentPage.set(1);
        this.loadReclamations();
      },
      error: (error: HttpErrorResponse | Error) => {
        if (error instanceof Error && error.message === 'No agence token') {
          this.createError.set('backoffice.reclamations.authRequired');
        } else {
          this.createError.set(this.resolveCreateError(error as HttpErrorResponse));
        }
        this.createLoading.set(false);
      },
    });
  }

  private loadReclamations(): void {
    if (!this.agenceSession.isAuthenticated()) {
      this.loading.set(false);
      this.unauthenticated.set(true);
      this.errorMessage.set('backoffice.reclamations.authRequired');
      this.reclamations.set([]);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.unauthenticated.set(false);

    const statut = this.filterStatut();
    this.agenceSession
      .loadReclamations({
        search: this.filterSearch().trim() || undefined,
        statut: statut || undefined,
        page: this.currentPage(),
        per_page: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          const page = parseAgenceReclamationsListResponse(response);
          this.reclamations.set(page.items);
          this.currentPage.set(page.currentPage);
          this.totalPages.set(page.lastPage);
          this.totalItems.set(page.total);
          this.resultsFrom.set(page.from);
          this.resultsTo.set(page.to);
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse | Error) => {
          if (error instanceof Error && error.message === 'No agence token') {
            this.unauthenticated.set(true);
            this.errorMessage.set('backoffice.reclamations.authRequired');
          } else {
            this.errorMessage.set(this.resolveLoadError(error as HttpErrorResponse));
          }
          this.reclamations.set([]);
          this.loading.set(false);
        },
      });
  }

  private applyReclamationUpdate(updated: AgenceReclamationDetail): void {
    this.reclamations.update((items) =>
      items.map((item) =>
        item.id === updated.id
          ? {
              id: updated.id,
              client: updated.client,
              objet: updated.objet,
              commande: updated.commande,
              statut: updated.statut,
              date: updated.date,
            }
          : item,
      ),
    );

    if (this.selectedReclamation()?.id === updated.id) {
      this.selectedReclamation.set(updated);
    }
  }

  private resolveLoadError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'backoffice.reclamations.authRequired';
    }
    const apiMessage = extractApiErrorMessage(error);
    return apiMessage ?? 'backoffice.reclamations.loadError';
  }

  private resolveDetailError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'backoffice.reclamations.authRequired';
    }
    if (error.status === 404) {
      return 'backoffice.reclamations.detailNotFound';
    }
    const apiMessage = extractApiErrorMessage(error);
    return apiMessage ?? 'backoffice.reclamations.detailLoadError';
  }

  private resolveStatusUpdateError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'backoffice.reclamations.authRequired';
    }
    if (error.status === 404) {
      return 'backoffice.reclamations.detailNotFound';
    }
    if (error.status === 422) {
      return 'backoffice.reclamations.statusUpdateInvalid';
    }
    const apiMessage = extractApiErrorMessage(error);
    return apiMessage ?? 'backoffice.reclamations.statusUpdateError';
  }

  private resetCreateForm(): void {
    this.createNom = '';
    this.createPrenom = '';
    this.createTelephone = '';
    this.createEmail = '';
    this.createObjet = '';
    this.createDescription = '';
    this.createCommandeId = '';
  }

  private isCreateFormValid(): boolean {
    return (
      this.createNom.trim().length > 0 &&
      this.createPrenom.trim().length > 0 &&
      this.createTelephone.trim().length > 0 &&
      this.createEmail.trim().length > 0 &&
      this.createObjet.trim().length > 0 &&
      this.createDescription.trim().length > 0
    );
  }

  private resolveCreateError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'backoffice.reclamations.authRequired';
    }
    if (error.status === 422) {
      return 'backoffice.reclamations.createValidationError';
    }
    const apiMessage = extractApiErrorMessage(error);
    return apiMessage ?? 'backoffice.reclamations.createError';
  }
}
