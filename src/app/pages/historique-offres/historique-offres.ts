import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AgenceOffre, AgenceOffreStatut } from '../../models/agence-offre.model';
import { AgenceOffreUpdateRequest } from '../../models/agence-offre-create.model';
import { TypeOffre } from '../../models/type-offre.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { AgenceService } from '../../services/agence.service';
import { AgenceSessionService } from '../../services/agence-session.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';
import { parseOffreDetailResponse, parseOffreEditForm, parseOffresListResponse } from '../../utils/agence-offre.util';

@Component({
  selector: 'app-historique-offres',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './historique-offres.html',
  styleUrl: './historique-offres.css',
})
export class HistoriqueOffres implements OnInit {
  private readonly language = inject(LanguageService);
  private readonly agenceSession = inject(AgenceSessionService);
  private readonly agenceService = inject(AgenceService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
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

  protected readonly editOpen = signal(false);
  protected readonly editLoading = signal(false);
  protected readonly editSubmitting = signal(false);
  protected readonly editError = signal('');
  protected readonly editingOfferId = signal('');

  protected editTitre = '';
  protected editTypeOffreId = '';
  protected editType = '';
  protected editPrix: number | null = null;
  protected editCapaciteIllimitee = false;
  protected editCapaciteTotale: number | null = null;
  protected editCapaciteDisponible: number | null = null;
  protected editOrigine = '';
  protected editDestination = '';
  protected editDescription = '';
  protected editStatut: AgenceOffreStatut = 'active';

  protected readonly loadingTypeOffres = signal(false);
  protected readonly typeOffreOptions = signal<TypeOffre[]>([]);

  protected readonly deleteOpen = signal(false);
  protected readonly deleteSubmitting = signal(false);
  protected readonly deleteError = signal('');
  protected readonly deletingOffer = signal<AgenceOffre | null>(null);

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

  protected readonly editStatutOptions: Array<{ value: AgenceOffreStatut; labelKey: string }> = [
    { value: 'active', labelKey: 'backoffice.offerHistory.status.active' },
    { value: 'inactive', labelKey: 'backoffice.offerHistory.status.inactive' },
    { value: 'archivée', labelKey: 'backoffice.offerHistory.status.archived' },
  ];

  ngOnInit(): void {
    this.loadOffres();
    this.loadTypeOffres();
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

  protected onEditModalBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeEdit();
    }
  }

  protected openEditFromDetail(): void {
    const offer = this.selectedOffer();
    if (offer) {
      this.openEdit(offer);
    }
  }

  protected openDeleteFromDetail(): void {
    const offer = this.selectedOffer();
    if (offer) {
      this.openDelete(offer);
    }
  }

  protected openDelete(offer: AgenceOffre): void {
    this.successMessage.set('');
    this.closeDetail();
    this.closeEdit();
    this.deleteError.set('');
    this.deleteSubmitting.set(false);
    this.deletingOffer.set(offer);
    this.deleteOpen.set(true);
  }

  protected closeDelete(): void {
    if (this.deleteSubmitting()) {
      return;
    }
    this.deleteOpen.set(false);
    this.deleteSubmitting.set(false);
    this.deleteError.set('');
    this.deletingOffer.set(null);
  }

  protected onDeleteModalBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.deleteSubmitting()) {
      this.closeDelete();
    }
  }

  protected confirmDelete(): void {
    const offer = this.deletingOffer();
    if (!offer) {
      return;
    }

    if (!this.agenceSession.isAuthenticated()) {
      this.deleteError.set('backoffice.offerHistory.authRequired');
      return;
    }

    this.deleteError.set('');
    this.deleteSubmitting.set(true);

    this.agenceSession.deleteOffre(offer.id).subscribe({
      next: () => {
        this.offers.update((list) => list.filter((item) => item.id !== offer.id));
        this.totalItems.update((total) => Math.max(0, total - 1));
        this.deleteSubmitting.set(false);
        this.closeDelete();
        this.successMessage.set('backoffice.offerHistory.deleteSuccess');
        this.loadOffres();
      },
      error: (error: HttpErrorResponse | Error) => {
        this.deleteError.set(this.resolveDeleteError(error));
        this.deleteSubmitting.set(false);
      },
    });
  }

  protected openEdit(offer: AgenceOffre): void {
    this.closeDetail();
    this.editOpen.set(true);
    this.editLoading.set(true);
    this.editSubmitting.set(false);
    this.editError.set('');
    this.editingOfferId.set(offer.id);
    this.resetEditForm();

    if (this.typeOffreOptions().length === 0) {
      this.loadTypeOffres();
    }

    this.agenceSession.loadOffre(offer.id).subscribe({
      next: (response) => {
        const form = parseOffreEditForm(response);
        this.applyEditForm(form);
        this.editLoading.set(false);
      },
      error: (error: HttpErrorResponse | Error) => {
        if (error instanceof Error && error.message === 'No agence token') {
          this.editError.set('backoffice.offerHistory.authRequired');
        } else {
          this.editError.set(this.resolveDetailError(error as HttpErrorResponse));
        }
        this.editLoading.set(false);
      },
    });
  }

  protected closeEdit(): void {
    this.editOpen.set(false);
    this.editLoading.set(false);
    this.editSubmitting.set(false);
    this.editError.set('');
    this.editingOfferId.set('');
    this.resetEditForm();
  }

  protected onEditTypeOffreChange(): void {
    const selected = this.typeOffreOptions().find((option) => option.id === this.editTypeOffreId);
    this.editType = selected?.code ?? '';
  }

  protected onEditCapaciteIllimiteeChange(value: boolean): void {
    this.editCapaciteIllimitee = value;
    if (value) {
      this.editCapaciteTotale = null;
    }
  }

  protected onEditSubmit(event: Event): void {
    event.preventDefault();
    this.editError.set('');

    if (!this.isEditFormValid()) {
      this.editError.set('backoffice.offerHistory.validationError');
      return;
    }

    const selected = this.typeOffreOptions().find((option) => option.id === this.editTypeOffreId);
    const payload: AgenceOffreUpdateRequest = {
      titre: this.editTitre.trim(),
      type_offre_id: this.editTypeOffreId,
      type: (selected?.code ?? this.editType).trim(),
      prix: Number(this.editPrix),
      capacite_illimitee: this.editCapaciteIllimitee,
      capacite_totale: this.editCapaciteIllimitee ? null : Number(this.editCapaciteTotale),
      origine: this.editOrigine.trim(),
      destination: this.editDestination.trim(),
      description: this.editDescription.trim(),
      statut: this.editStatut,
    };

    this.editSubmitting.set(true);

    this.agenceSession.updateOffre(this.editingOfferId(), payload).subscribe({
      next: () => {
        this.editSubmitting.set(false);
        this.closeEdit();
        this.loadOffres();
      },
      error: (error: HttpErrorResponse | Error) => {
        if (error instanceof Error && error.message === 'No agence token') {
          this.editError.set('backoffice.offerHistory.authRequired');
        } else {
          this.editError.set(this.resolveUpdateError(error as HttpErrorResponse));
        }
        this.editSubmitting.set(false);
      },
    });
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

  private loadTypeOffres(): void {
    if (this.loadingTypeOffres()) {
      return;
    }

    const token = this.agenceSession.getToken();
    if (!token) {
      this.typeOffreOptions.set([]);
      return;
    }

    this.loadingTypeOffres.set(true);
    this.agenceService.getTypeOffres(token).subscribe({
      next: (options) => {
        this.typeOffreOptions.set(options);
        this.syncEditTypeOffreSelection();
        this.loadingTypeOffres.set(false);
      },
      error: () => {
        this.typeOffreOptions.set([]);
        this.loadingTypeOffres.set(false);
      },
    });
  }

  private applyEditForm(form: ReturnType<typeof parseOffreEditForm>): void {
    this.editTitre = form.titre;
    this.editTypeOffreId = form.typeOffreId;
    this.editType = form.type;
    this.editPrix = form.prix;
    this.editCapaciteIllimitee = form.capaciteIllimitee;
    this.editCapaciteTotale = form.capaciteTotale;
    this.editCapaciteDisponible = form.capaciteDisponible;
    this.editOrigine = form.origine;
    this.editDestination = form.destination;
    this.editDescription = form.description;
    this.editStatut = form.statut;
    this.syncEditTypeOffreSelection();
  }

  private syncEditTypeOffreSelection(): void {
    if (this.editTypeOffreId) {
      const selected = this.typeOffreOptions().find((option) => option.id === this.editTypeOffreId);
      if (selected) {
        this.editType = selected.code;
        return;
      }
    }

    if (!this.editType) {
      return;
    }

    const match = this.typeOffreOptions().find((option) => option.code === this.editType);
    if (match) {
      this.editTypeOffreId = match.id;
    }
  }

  private resetEditForm(): void {
    this.editTitre = '';
    this.editTypeOffreId = '';
    this.editType = '';
    this.editPrix = null;
    this.editCapaciteIllimitee = false;
    this.editCapaciteTotale = null;
    this.editCapaciteDisponible = null;
    this.editOrigine = '';
    this.editDestination = '';
    this.editDescription = '';
    this.editStatut = 'active';
  }

  private isEditFormValid(): boolean {
    return (
      !!this.editingOfferId() &&
      !!this.editTitre.trim() &&
      !!this.editTypeOffreId &&
      !!this.editType.trim() &&
      this.editPrix != null &&
      this.editPrix > 0 &&
      (this.editCapaciteIllimitee ||
        (this.editCapaciteTotale != null && this.editCapaciteTotale > 0)) &&
      !!this.editOrigine.trim() &&
      !!this.editDestination.trim() &&
      !!this.editDescription.trim() &&
      !!this.editStatut
    );
  }

  private resolveUpdateError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'backoffice.offerHistory.authRequired';
    }
    if (error.status === 404) {
      return 'backoffice.offerHistory.detailNotFound';
    }
    if (error.status === 422) {
      const apiMessage = extractApiErrorMessage(error);
      return apiMessage ?? 'backoffice.offerHistory.validationError';
    }
    const apiMessage = extractApiErrorMessage(error);
    return apiMessage ?? 'backoffice.offerHistory.updateError';
  }

  private resolveDeleteError(error: HttpErrorResponse | Error): string {
    if (error instanceof Error && !(error instanceof HttpErrorResponse)) {
      return 'backoffice.offerHistory.authRequired';
    }
    if (error.status === 401) {
      return 'backoffice.offerHistory.authRequired';
    }
    if (error.status === 403) {
      return 'backoffice.offerHistory.deleteForbidden';
    }
    if (error.status === 404) {
      return 'backoffice.offerHistory.deleteNotFound';
    }
    if (error.status === 422) {
      const apiMessage = extractApiErrorMessage(error);
      if (apiMessage && !/the given data was invalid/i.test(apiMessage)) {
        return apiMessage;
      }
      return 'backoffice.offerHistory.deleteLinkedOrders';
    }
    return extractApiErrorMessage(error) ?? 'backoffice.offerHistory.deleteError';
  }
}
