import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AgenceRole,
  AgenceUser,
  AgenceUserStatut,
  AgenceUserUpdateRequest,
} from '../../models/agence-user.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AgenceSessionService } from '../../services/agence-session.service';
import { LanguageService } from '../../services/language.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';

@Component({
  selector: 'app-liste-collaborateurs',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './liste-collaborateurs.html',
  styleUrl: './liste-collaborateurs.css',
})
export class ListeCollaborateurs implements OnInit {
  private readonly language = inject(LanguageService);
  private readonly agenceSession = inject(AgenceSessionService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly unauthenticated = signal(false);

  protected readonly users = signal<AgenceUser[]>([]);
  protected readonly roles = signal<AgenceRole[]>([]);

  protected readonly filterName = signal('');
  protected readonly filterEmail = signal('');
  protected readonly filterRole = signal('');
  protected readonly filterStatus = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 10;

  protected readonly statusOptions: Array<{ value: string; labelKey: string }> = [
    { value: '', labelKey: 'backoffice.collaboratorList.allStatuses' },
    { value: 'actif', labelKey: 'backoffice.collaboratorList.status.actif' },
    { value: 'inactif', labelKey: 'backoffice.collaboratorList.status.inactif' },
  ];

  protected readonly editOpen = signal(false);
  protected readonly editSubmitting = signal(false);
  protected readonly editError = signal('');
  protected editingUserId: number | string | null = null;
  protected editName = '';
  protected editEmail = '';
  protected editTelephone = '';
  protected editRoleId = '';
  protected editStatut: AgenceUserStatut = 'actif';
  protected editIsOwner = false;

  protected readonly deleteOpen = signal(false);
  protected readonly deleteSubmitting = signal(false);
  protected readonly deleteError = signal('');
  protected readonly deletingUser = signal<AgenceUser | null>(null);

  protected readonly roleFilterOptions = computed(() => {
    this.language.lang();
    return [
      { value: '', label: this.language.translate('backoffice.collaboratorList.allRoles') },
      ...this.roles().map((role) => ({ value: role.id, label: role.nom })),
    ];
  });

  protected readonly filteredUsers = computed(() => {
    const name = this.filterName().trim().toLowerCase();
    const email = this.filterEmail().trim().toLowerCase();
    const roleId = this.filterRole();
    const status = this.filterStatus();

    return this.users().filter((user) => {
      if (name && !user.name.toLowerCase().includes(name)) return false;
      if (email && !user.email.toLowerCase().includes(email)) return false;
      if (roleId && user.role?.id !== roleId) return false;
      if (status && user.statut !== status) return false;
      return true;
    });
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredUsers().length / this.pageSize)),
  );

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1),
  );

  protected readonly displayedUsers = computed(() => {
    const list = this.filteredUsers();
    const totalPages = Math.max(1, Math.ceil(list.length / this.pageSize));
    const page = Math.min(this.currentPage(), totalPages);
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  protected readonly resultsLabel = computed(() => {
    this.language.lang();
    const list = this.filteredUsers();
    const total = list.length;
    if (total === 0) {
      return this.language.translate('backoffice.collaboratorList.empty');
    }
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize + 1;
    const end = Math.min(page * this.pageSize, total);
    return this.language.translate('backoffice.collaboratorList.results', { start, end, total });
  });

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
  }

  protected resetFilters(): void {
    this.filterName.set('');
    this.filterEmail.set('');
    this.filterRole.set('');
    this.filterStatus.set('');
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

  protected statusKey(statut: string): string {
    const normalized = statut.trim().toLowerCase();
    if (normalized === 'actif' || normalized === 'active') {
      return 'backoffice.collaboratorList.status.actif';
    }
    if (normalized === 'inactif' || normalized === 'inactive') {
      return 'backoffice.collaboratorList.status.inactif';
    }
    return 'backoffice.collaboratorList.status.unknown';
  }

  protected isActiveStatus(statut: string): boolean {
    const normalized = statut.trim().toLowerCase();
    return normalized === 'actif' || normalized === 'active';
  }

  protected openEdit(user: AgenceUser): void {
    this.editOpen.set(true);
    this.editError.set('');
    this.editSubmitting.set(false);
    this.editingUserId = user.id;
    this.editName = user.name ?? '';
    this.editEmail = user.email ?? '';
    this.editTelephone = user.telephone ?? '';
    this.editRoleId = user.role?.id ?? '';
    this.editStatut = user.statut || 'actif';
    this.editIsOwner = !!user.est_proprietaire;

    if (user.role?.id && !this.roles().some((role) => role.id === user.role.id)) {
      this.roles.update((list) => [...list, user.role]);
    }

    if (this.roles().length === 0) {
      this.loadRoles();
    }
  }

  protected closeEdit(): void {
    if (this.editSubmitting()) return;
    this.editOpen.set(false);
    this.editError.set('');
    this.editingUserId = null;
    this.editName = '';
    this.editEmail = '';
    this.editTelephone = '';
    this.editRoleId = '';
    this.editStatut = 'actif';
    this.editIsOwner = false;
  }

  protected onEditBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.editSubmitting()) {
      this.closeEdit();
    }
  }

  protected submitEdit(event: Event): void {
    event.preventDefault();
    this.editError.set('');

    if (this.editingUserId == null) {
      this.editError.set('backoffice.collaboratorList.editMissingUser');
      return;
    }

    if (!this.editName.trim() || !this.editEmail.trim() || !this.editTelephone.trim()) {
      this.editError.set('backoffice.collaboratorList.editValidationError');
      return;
    }

    if (!this.editIsOwner && !this.editRoleId) {
      this.editError.set('backoffice.collaboratorList.roleRequired');
      return;
    }

    const payload: AgenceUserUpdateRequest = {
      name: this.editName.trim(),
      email: this.editEmail.trim(),
      telephone: this.editTelephone.trim(),
      statut: this.editStatut,
    };

    if (!this.editIsOwner && this.editRoleId) {
      payload.agence_role_id = this.editRoleId;
    }

    this.editSubmitting.set(true);

    this.agenceSession.updateUser(this.editingUserId, payload).subscribe({
      next: (updated) => {
        this.users.update((list) =>
          list.map((user) => (String(user.id) === String(updated.id) ? updated : user)),
        );
        this.editSubmitting.set(false);
        this.closeEdit();
        this.successMessage.set('backoffice.collaboratorList.editSuccess');
      },
      error: (error: HttpErrorResponse | Error) => {
        this.editError.set(this.resolveMutationError(error, 'edit'));
        this.editSubmitting.set(false);
      },
    });
  }

  protected openDelete(user: AgenceUser): void {
    if (user.est_proprietaire) {
      this.errorMessage.set('backoffice.collaboratorList.cannotDeleteOwner');
      return;
    }
    this.deletingUser.set(user);
    this.deleteError.set('');
    this.deleteSubmitting.set(false);
    this.deleteOpen.set(true);
  }

  protected closeDelete(): void {
    if (this.deleteSubmitting()) return;
    this.deleteOpen.set(false);
    this.deleteError.set('');
    this.deletingUser.set(null);
  }

  protected onDeleteBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.deleteSubmitting()) {
      this.closeDelete();
    }
  }

  protected confirmDelete(): void {
    const user = this.deletingUser();
    if (!user) return;

    this.deleteError.set('');
    this.deleteSubmitting.set(true);

    this.agenceSession.deleteUser(user.id).subscribe({
      next: () => {
        this.users.update((list) => list.filter((item) => String(item.id) !== String(user.id)));
        this.deleteSubmitting.set(false);
        this.closeDelete();
        this.successMessage.set('backoffice.collaboratorList.deleteSuccess');
        if (this.currentPage() > this.totalPages()) {
          this.currentPage.set(this.totalPages());
        }
      },
      error: (error: HttpErrorResponse | Error) => {
        this.deleteError.set(this.resolveMutationError(error, 'delete'));
        this.deleteSubmitting.set(false);
      },
    });
  }

  protected reload(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    if (!this.agenceSession.isAuthenticated()) {
      this.loading.set(false);
      this.unauthenticated.set(true);
      this.errorMessage.set('backoffice.collaboratorList.authRequired');
      this.users.set([]);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.unauthenticated.set(false);

    this.agenceSession.loadUsers().subscribe({
      next: (response) => {
        const items = Array.isArray(response.data) ? response.data : [];
        this.users.set(items);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse | Error) => {
        this.users.set([]);
        this.errorMessage.set(this.resolveLoadError(error));
        this.loading.set(false);
      },
    });
  }

  private loadRoles(): void {
    this.agenceSession.loadRoles().subscribe({
      next: (response) => {
        const roles = Array.isArray(response.data)
          ? response.data.filter((role) => role.actif && !role.est_systeme)
          : [];
        this.roles.set(roles);
      },
      error: () => {
        this.roles.set([]);
      },
    });
  }

  private resolveLoadError(error: HttpErrorResponse | Error): string {
    if (error instanceof Error && !(error instanceof HttpErrorResponse)) {
      this.unauthenticated.set(true);
      return 'backoffice.collaboratorList.authRequired';
    }
    if (error.status === 401) {
      this.unauthenticated.set(true);
      return 'backoffice.collaboratorList.authRequired';
    }
    if (error.status === 403) {
      return 'backoffice.collaboratorList.forbidden';
    }
    return extractApiErrorMessage(error) ?? 'backoffice.collaboratorList.loadError';
  }

  private resolveMutationError(error: HttpErrorResponse | Error, action: 'edit' | 'delete'): string {
    if (error instanceof Error && !(error instanceof HttpErrorResponse)) {
      return 'backoffice.collaboratorList.authRequired';
    }
    if (error.status === 401) {
      return 'backoffice.collaboratorList.authRequired';
    }
    if (error.status === 403) {
      return 'backoffice.collaboratorList.forbidden';
    }
    if (error.status === 404) {
      return 'backoffice.collaboratorList.notFound';
    }
    const apiMessage = extractApiErrorMessage(error);
    if (apiMessage) {
      return apiMessage;
    }
    if (error.status === 422) {
      return action === 'delete'
        ? 'backoffice.collaboratorList.cannotDeleteOwner'
        : 'backoffice.collaboratorList.editValidationError';
    }
    return action === 'delete'
      ? 'backoffice.collaboratorList.deleteError'
      : 'backoffice.collaboratorList.editError';
  }
}
