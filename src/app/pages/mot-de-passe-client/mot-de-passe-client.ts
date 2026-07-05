import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ClientSessionService } from '../../services/client-session.service';
import { ParticulierService } from '../../services/particulier.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';

@Component({
  selector: 'app-mot-de-passe-client',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './mot-de-passe-client.html',
  styleUrl: './mot-de-passe-client.css',
})
export class MotDePasseClient {
  private readonly clientSession = inject(ClientSessionService);
  private readonly particulierService = inject(ParticulierService);

  protected currentPassword = '';
  protected newPassword = '';
  protected confirmPassword = '';

  protected readonly showCurrent = signal(false);
  protected readonly showNew = signal(false);
  protected readonly showConfirm = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  protected toggleCurrent(): void {
    this.showCurrent.update((visible) => !visible);
  }

  protected toggleNew(): void {
    this.showNew.update((visible) => !visible);
  }

  protected toggleConfirm(): void {
    this.showConfirm.update((visible) => !visible);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('clientBackoffice.password.mismatch');
      return;
    }

    const token = this.clientSession.getToken();
    if (!token) {
      this.errorMessage.set('clientBackoffice.password.saveError');
      return;
    }

    this.submitting.set(true);

    this.particulierService
      .changePassword(token, {
        current_password: this.currentPassword,
        password: this.newPassword,
        password_confirmation: this.confirmPassword,
      })
      .subscribe({
        next: (response) => {
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
          this.successMessage.set(response.message || 'clientBackoffice.password.saveSuccess');
          this.submitting.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.resolveSaveError(error));
          this.submitting.set(false);
        },
      });
  }

  private resolveSaveError(error: HttpErrorResponse): string {
    const apiMessage = extractApiErrorMessage(error);
    if (apiMessage) {
      return apiMessage;
    }
    if (error.status === 422) {
      return 'clientBackoffice.password.saveValidationError';
    }
    return 'clientBackoffice.password.saveError';
  }
}
