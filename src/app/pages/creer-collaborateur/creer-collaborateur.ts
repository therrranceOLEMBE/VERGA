import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgenceRole, AgenceUserCreateRequest } from '../../models/agence-user.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AgenceSessionService } from '../../services/agence-session.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';

@Component({
  selector: 'app-creer-collaborateur',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './creer-collaborateur.html',
  styleUrl: './creer-collaborateur.css',
})
export class CreerCollaborateur implements OnInit {
  private readonly agenceSession = inject(AgenceSessionService);

  protected firstName = '';
  protected lastName = '';
  protected email = '';
  protected phone = '';
  protected roleId = '';
  protected password = '';
  protected confirmPassword = '';
  protected readonly showPassword = signal(false);
  protected readonly showConfirm = signal(false);
  protected readonly roles = signal<AgenceRole[]>([]);
  protected readonly rolesLoading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  ngOnInit(): void {
    this.loadRoles();
  }

  protected togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  protected toggleConfirm(): void {
    this.showConfirm.update((v) => !v);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('backoffice.createCollaborator.passwordMismatch');
      return;
    }

    if (!this.roleId) {
      this.errorMessage.set('backoffice.createCollaborator.roleRequired');
      return;
    }

    const payload: AgenceUserCreateRequest = {
      name: `${this.firstName.trim()} ${this.lastName.trim()}`.trim(),
      email: this.email.trim(),
      telephone: this.phone.trim(),
      password: this.password,
      password_confirmation: this.confirmPassword,
      agence_role_id: this.roleId,
    };

    this.submitting.set(true);
    this.agenceSession.createUser(payload).subscribe({
      next: () => {
        this.resetForm();
        this.successMessage.set('backoffice.createCollaborator.createSuccess');
        this.submitting.set(false);
      },
      error: (error: HttpErrorResponse | Error) => {
        this.errorMessage.set(this.resolveCreateError(error));
        this.submitting.set(false);
      },
    });
  }

  protected loadRoles(): void {
    this.rolesLoading.set(true);
    this.errorMessage.set('');

    this.agenceSession.loadRoles().subscribe({
      next: (response) => {
        const roles = Array.isArray(response.data)
          ? response.data.filter((role) => role.actif && !role.est_systeme)
          : [];
        this.roles.set(roles);
        this.rolesLoading.set(false);
      },
      error: (error: HttpErrorResponse | Error) => {
        this.roles.set([]);
        this.errorMessage.set(this.resolveRolesError(error));
        this.rolesLoading.set(false);
      },
    });
  }

  private resetForm(): void {
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.phone = '';
    this.roleId = '';
    this.password = '';
    this.confirmPassword = '';
    this.showPassword.set(false);
    this.showConfirm.set(false);
  }

  private resolveRolesError(error: HttpErrorResponse | Error): string {
    if (error instanceof Error && !(error instanceof HttpErrorResponse)) {
      return 'backoffice.createCollaborator.authRequired';
    }
    if (error.status === 401) {
      return 'backoffice.createCollaborator.authRequired';
    }
    if (error.status === 403) {
      return 'backoffice.createCollaborator.forbidden';
    }
    return extractApiErrorMessage(error) ?? 'backoffice.createCollaborator.rolesLoadError';
  }

  private resolveCreateError(error: HttpErrorResponse | Error): string {
    if (error instanceof Error && !(error instanceof HttpErrorResponse)) {
      return 'backoffice.createCollaborator.authRequired';
    }
    if (error.status === 401) {
      return 'backoffice.createCollaborator.authRequired';
    }
    if (error.status === 403) {
      return 'backoffice.createCollaborator.forbidden';
    }
    const apiMessage = extractApiErrorMessage(error);
    if (apiMessage) {
      return apiMessage;
    }
    if (error.status === 422) {
      return 'backoffice.createCollaborator.validationError';
    }
    return 'backoffice.createCollaborator.createError';
  }
}
