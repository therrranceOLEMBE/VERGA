import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AgenceSessionService } from '../../services/agence-session.service';
import { AgenceService } from '../../services/agence.service';
import { ClientSessionService } from '../../services/client-session.service';
import { ParticulierService } from '../../services/particulier.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';

export type LoginFormType = 'entreprise' | 'particulier';

@Component({
  selector: 'app-connexion',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './connexion.html',
  styleUrl: './connexion.css',
})
export class Connexion {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly clientSession = inject(ClientSessionService);
  private readonly agenceSession = inject(AgenceSessionService);
  private readonly particulierService = inject(ParticulierService);
  private readonly agenceService = inject(AgenceService);

  protected readonly formType = signal<LoginFormType>('entreprise');
  protected readonly showPassword = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');

  protected email = '';
  protected password = '';

  protected setFormType(type: LoginFormType): void {
    this.formType.set(type);
    this.errorMessage.set('');
  }

  protected togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage.set('');

    if (this.formType() === 'particulier') {
      this.loginParticulier();
      return;
    }

    this.loginEntreprise();
  }

  private loginEntreprise(): void {
    const email = this.email.trim();

    this.submitting.set(true);

    this.agenceService
      .login({
        email,
        password: this.password,
        device_name: 'angular-backoffice',
      })
      .subscribe({
        next: (response) => {
          this.clientSession.clearSession();
          this.agenceSession.setSession(response.token);
          this.navigateAfterAgenceLogin();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.resolveLoginError(error));
          this.submitting.set(false);
        },
        complete: () => {
          this.submitting.set(false);
        },
      });
  }

  private loginParticulier(): void {
    const email = this.email.trim();

    this.submitting.set(true);

    this.particulierService
      .login({
        email,
        password: this.password,
        device_name: 'verga-web',
      })
      .subscribe({
        next: (response) => {
          this.agenceSession.clearSession();
          this.clientSession.setSession(response.token, { email });
          this.navigateAfterClientLogin();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.resolveLoginError(error));
          this.submitting.set(false);
        },
        complete: () => {
          this.submitting.set(false);
        },
      });
  }

  private navigateAfterAgenceLogin(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const target =
      returnUrl && returnUrl.startsWith('/backoffice') ? returnUrl : '/backoffice/tableau-de-bord';
    void this.router.navigateByUrl(target);
  }

  private navigateAfterClientLogin(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const target =
      returnUrl && returnUrl.startsWith('/espace-client') ? returnUrl : '/espace-client/dashboard';
    void this.router.navigateByUrl(target);
  }

  private resolveLoginError(error: HttpErrorResponse): string {
    if (error.status === 403) {
      const apiMessage = extractApiErrorMessage(error);
      return apiMessage ?? 'auth.login.accountBlocked';
    }
    if (error.status === 422) {
      const apiMessage = extractApiErrorMessage(error);
      return apiMessage ?? 'auth.login.invalidCredentials';
    }
    if (error.status === 429) {
      return 'auth.login.tooManyAttempts';
    }

    const apiMessage = extractApiErrorMessage(error);
    return apiMessage ?? 'auth.login.error';
  }
}
