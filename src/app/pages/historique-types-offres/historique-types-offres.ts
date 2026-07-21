import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TypeOffre, TypeOffreUpdateRequest } from '../../models/type-offre.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AgenceSessionService } from '../../services/agence-session.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';

@Component({
  selector: 'app-historique-types-offres',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './historique-types-offres.html',
  styleUrl: './historique-types-offres.css',
})
export class HistoriqueTypesOffres implements OnInit {
  private readonly agenceSession = inject(AgenceSessionService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly unauthenticated = signal(false);
  protected readonly items = signal<TypeOffre[]>([]);

  protected readonly filterSearch = signal('');
  protected readonly filterScope = signal<'all' | 'platform' | 'custom'>('all');
  protected readonly filterActif = signal<'all' | 'actif' | 'inactif'>('all');

  protected readonly detailOpen = signal(false);
  protected readonly detailLoading = signal(false);
  protected readonly detailError = signal('');
  protected readonly selectedType = signal<TypeOffre | null>(null);

  protected readonly editOpen = signal(false);
  protected readonly editSubmitting = signal(false);
  protected readonly editError = signal('');
  protected readonly editingType = signal<TypeOffre | null>(null);

  protected editNom = '';
  protected editDescription = '';
  protected editUnite = '';
  protected editUniteLabel = '';
  protected editQuantiteEntier = true;
  protected editQuantiteMin: number | null = 1;
  protected editActif = true;

  protected readonly deleteOpen = signal(false);
  protected readonly deleteSubmitting = signal(false);
  protected readonly deleteError = signal('');
  protected readonly deletingType = signal<TypeOffre | null>(null);

  protected readonly filteredItems = computed(() => {
    const search = this.filterSearch().trim().toLowerCase();
    const scope = this.filterScope();
    const actif = this.filterActif();

    return this.items().filter((item) => {
      if (scope === 'platform' && !this.isPlatformType(item)) return false;
      if (scope === 'custom' && !this.canManage(item)) return false;
      if (actif === 'actif' && !item.actif) return false;
      if (actif === 'inactif' && item.actif) return false;

      if (!search) return true;

      const haystack = [item.nom, item.slug, item.unite, item.uniteLabel, item.description]
        .join(' ')
        .toLowerCase();

      return haystack.includes(search);
    });
  });

  ngOnInit(): void {
    this.loadList();
  }

  protected onFilterChange(): void {
    // computed reacts automatically
  }

  protected resetFilters(): void {
    this.filterSearch.set('');
    this.filterScope.set('all');
    this.filterActif.set('all');
  }

  protected reload(): void {
    this.loadList();
  }

  /** Types plateforme VERGA : consultation seule. */
  protected isPlatformType(item: TypeOffre): boolean {
    return item.isPlatform === true || !item.agenceId;
  }

  /** Seuls les types créés par l’agence sont modifiables / supprimables. */
  protected canManage(item: TypeOffre): boolean {
    return !this.isPlatformType(item);
  }

  protected openDetail(item: TypeOffre): void {
    this.successMessage.set('');
    this.detailOpen.set(true);
    this.detailError.set('');
    this.selectedType.set(item);
    this.loadDetail(item.id);
  }

  protected closeDetail(): void {
    this.detailOpen.set(false);
    this.detailLoading.set(false);
    this.detailError.set('');
    this.selectedType.set(null);
  }

  protected openEdit(item: TypeOffre): void {
    this.successMessage.set('');

    if (!this.canManage(item)) {
      this.errorMessage.set('backoffice.typeOffreHistory.editForbidden');
      return;
    }

    this.closeDetail();
    this.editingType.set(item);
    this.applyEditForm(item);
    this.editError.set('');
    this.editOpen.set(true);
  }

  protected openEditFromDetail(): void {
    const item = this.selectedType();
    if (item) {
      this.openEdit(item);
    }
  }

  protected closeEdit(): void {
    if (this.editSubmitting()) return;
    this.editOpen.set(false);
    this.editSubmitting.set(false);
    this.editError.set('');
    this.editingType.set(null);
  }

  protected onEditQuantiteEntierChange(value: boolean): void {
    this.editQuantiteEntier = value;
    if (value && this.editQuantiteMin != null && !Number.isInteger(this.editQuantiteMin)) {
      this.editQuantiteMin = Math.max(1, Math.ceil(this.editQuantiteMin));
    }
  }

  protected onEditSubmit(event: Event): void {
    event.preventDefault();
    const item = this.editingType();
    if (!item) {
      this.editError.set('backoffice.typeOffreHistory.authRequired');
      return;
    }

    if (!this.canManage(item)) {
      this.editError.set('backoffice.typeOffreHistory.editForbidden');
      return;
    }

    if (!this.agenceSession.isAuthenticated()) {
      this.editError.set('backoffice.typeOffreHistory.authRequired');
      return;
    }

    if (!this.isEditFormValid()) {
      this.editError.set('backoffice.typeOffreHistory.editValidationError');
      return;
    }

    const payload: TypeOffreUpdateRequest = {
      nom: this.editNom.trim(),
      description: this.editDescription.trim(),
      unite: this.editUnite.trim(),
      unite_label: this.editUniteLabel.trim(),
      quantite_entier: this.editQuantiteEntier,
      quantite_min: Number(this.editQuantiteMin),
      actif: this.editActif,
    };

    this.editSubmitting.set(true);
    this.editError.set('');

    this.agenceSession.updateTypeOffre(item.id, payload).subscribe({
      next: (updated) => {
        this.items.update((list) => list.map((row) => (row.id === updated.id ? updated : row)));
        this.successMessage.set('backoffice.typeOffreHistory.editSuccess');
        this.editSubmitting.set(false);
        this.closeEdit();
      },
      error: (error: HttpErrorResponse | Error) => {
        this.editError.set(this.resolveEditError(error));
        this.editSubmitting.set(false);
      },
    });
  }

  protected openDelete(item: TypeOffre): void {
    this.successMessage.set('');

    if (!this.canManage(item)) {
      this.errorMessage.set('backoffice.typeOffreHistory.deleteForbidden');
      return;
    }

    this.closeDetail();
    this.deletingType.set(item);
    this.deleteError.set('');
    this.deleteOpen.set(true);
  }

  protected openDeleteFromDetail(): void {
    const item = this.selectedType();
    if (item) {
      this.openDelete(item);
    }
  }

  protected closeDelete(): void {
    if (this.deleteSubmitting()) return;
    this.deleteOpen.set(false);
    this.deleteSubmitting.set(false);
    this.deleteError.set('');
    this.deletingType.set(null);
  }

  protected confirmDelete(): void {
    const item = this.deletingType();
    if (!item) {
      this.deleteError.set('backoffice.typeOffreHistory.authRequired');
      return;
    }

    if (!this.canManage(item)) {
      this.deleteError.set('backoffice.typeOffreHistory.deleteForbidden');
      return;
    }

    if (!this.agenceSession.isAuthenticated()) {
      this.deleteError.set('backoffice.typeOffreHistory.authRequired');
      return;
    }

    this.deleteSubmitting.set(true);
    this.deleteError.set('');

    this.agenceSession.deleteTypeOffre(item.id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((row) => row.id !== item.id));
        this.successMessage.set('backoffice.typeOffreHistory.deleteSuccess');
        this.deleteSubmitting.set(false);
        this.closeDelete();
      },
      error: (error: HttpErrorResponse | Error) => {
        this.deleteError.set(this.resolveDeleteError(error));
        this.deleteSubmitting.set(false);
      },
    });
  }

  protected onModalBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDetail();
    }
  }

  protected onEditModalBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.editSubmitting()) {
      this.closeEdit();
    }
  }

  protected onDeleteModalBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.deleteSubmitting()) {
      this.closeDelete();
    }
  }

  protected yesNoKey(value: boolean): string {
    return value ? 'backoffice.transactions.yes' : 'backoffice.transactions.no';
  }

  private applyEditForm(item: TypeOffre): void {
    this.editNom = item.nom;
    this.editDescription = item.description;
    this.editUnite = item.unite;
    this.editUniteLabel = item.uniteLabel;
    this.editQuantiteEntier = item.quantiteEntier;
    this.editQuantiteMin = item.quantiteMin;
    this.editActif = item.actif;
  }

  private isEditFormValid(): boolean {
    return (
      !!this.editNom.trim() &&
      !!this.editUnite.trim() &&
      !!this.editUniteLabel.trim() &&
      this.editQuantiteMin != null &&
      this.editQuantiteMin > 0 &&
      (!this.editQuantiteEntier || Number.isInteger(this.editQuantiteMin))
    );
  }

  private loadList(): void {
    if (!this.agenceSession.isAuthenticated()) {
      this.unauthenticated.set(true);
      this.errorMessage.set('backoffice.typeOffreHistory.authRequired');
      this.loading.set(false);
      this.items.set([]);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.unauthenticated.set(false);

    this.agenceSession.loadTypeOffres().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse | Error) => {
        this.items.set([]);
        if (error instanceof Error && !(error instanceof HttpErrorResponse)) {
          this.unauthenticated.set(true);
          this.errorMessage.set('backoffice.typeOffreHistory.authRequired');
        } else if (error.status === 401) {
          this.unauthenticated.set(true);
          this.errorMessage.set('backoffice.typeOffreHistory.authRequired');
        } else if (error.status === 403) {
          this.errorMessage.set('backoffice.typeOffreHistory.forbidden');
        } else {
          this.errorMessage.set(
            extractApiErrorMessage(error) ?? 'backoffice.typeOffreHistory.loadError',
          );
        }
        this.loading.set(false);
      },
    });
  }

  private loadDetail(id: string): void {
    if (!this.agenceSession.isAuthenticated()) {
      this.detailError.set('backoffice.typeOffreHistory.authRequired');
      return;
    }

    this.detailLoading.set(true);
    this.detailError.set('');

    this.agenceSession.loadTypeOffre(id).subscribe({
      next: (item) => {
        this.selectedType.set(item);
        this.items.update((list) => list.map((row) => (row.id === item.id ? item : row)));
        this.detailLoading.set(false);
      },
      error: (error: HttpErrorResponse | Error) => {
        if (error instanceof Error && !(error instanceof HttpErrorResponse)) {
          this.detailError.set('backoffice.typeOffreHistory.authRequired');
        } else if (error.status === 404) {
          this.detailError.set('backoffice.typeOffreHistory.detailNotFound');
        } else if (error.status === 403) {
          this.detailError.set('backoffice.typeOffreHistory.detailForbidden');
        } else if (error.status === 401) {
          this.detailError.set('backoffice.typeOffreHistory.authRequired');
        } else {
          this.detailError.set(
            extractApiErrorMessage(error) ?? 'backoffice.typeOffreHistory.detailLoadError',
          );
        }
        this.detailLoading.set(false);
      },
    });
  }

  private resolveEditError(error: HttpErrorResponse | Error): string {
    if (error instanceof Error && !(error instanceof HttpErrorResponse)) {
      return 'backoffice.typeOffreHistory.authRequired';
    }
    if (error.status === 401) {
      return 'backoffice.typeOffreHistory.authRequired';
    }
    if (error.status === 403) {
      return 'backoffice.typeOffreHistory.editForbidden';
    }
    if (error.status === 404) {
      return 'backoffice.typeOffreHistory.detailNotFound';
    }
    if (error.status === 422) {
      return extractApiErrorMessage(error) ?? 'backoffice.typeOffreHistory.editValidationError';
    }
    return extractApiErrorMessage(error) ?? 'backoffice.typeOffreHistory.editError';
  }

  private resolveDeleteError(error: HttpErrorResponse | Error): string {
    if (error instanceof Error && !(error instanceof HttpErrorResponse)) {
      return 'backoffice.typeOffreHistory.authRequired';
    }
    if (error.status === 401) {
      return 'backoffice.typeOffreHistory.authRequired';
    }
    if (error.status === 403) {
      return 'backoffice.typeOffreHistory.deleteForbidden';
    }
    if (error.status === 404) {
      return 'backoffice.typeOffreHistory.detailNotFound';
    }
    if (error.status === 422) {
      return extractApiErrorMessage(error) ?? 'backoffice.typeOffreHistory.deleteInUse';
    }
    return extractApiErrorMessage(error) ?? 'backoffice.typeOffreHistory.deleteError';
  }
}
