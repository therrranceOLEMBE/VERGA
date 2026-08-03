import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { interval } from 'rxjs';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AgenceSessionService } from '../../services/agence-session.service';
import { AgenceService } from '../../services/agence.service';
import { ClientSessionService } from '../../services/client-session.service';
import { ParticulierService } from '../../services/particulier.service';
import { AUTH_SLIDES } from '../../utils/auth-slides';
import { extractApiErrorMessage } from '../../utils/api-error.util';
import { canAccessAgencePath, getAgenceHomePath } from '../../utils/agence-permissions.util';

export type LoginFormType = 'entreprise' | 'particulier';

@Component({
  selector: 'app-connexion',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './connexion.html',
  styleUrl: './connexion.css',
})
export class Connexion implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly clientSession = inject(ClientSessionService);
  private readonly agenceSession = inject(AgenceSessionService);
  private readonly particulierService = inject(ParticulierService);
  private readonly agenceService = inject(AgenceService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly formType = signal<LoginFormType>('entreprise');
  protected readonly showPassword = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly activeSlide = signal(0);
  protected readonly authSlides = AUTH_SLIDES;

  protected email = '';
  protected password = '';

  ngOnInit(): void {
    const scope = this.route.snapshot.queryParamMap.get('scope');
    if (scope === 'client') {
      this.formType.set('particulier');
    } else if (scope === 'agence') {
      this.formType.set('entreprise');
    }

    interval(5500)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.activeSlide.update((current) => (current + 1) % this.authSlides.length);
      });
  }

  protected goToSlide(index: number): void {
    if (index >= 0 && index < this.authSlides.length) {
      this.activeSlide.set(index);
    }
  }

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
          this.agenceSession.setSession(response.token, response.user?.role);
          this.agenceSession.ensurePermissions().subscribe({
            next: () => this.navigateAfterAgenceLogin(),
            error: () => this.navigateAfterAgenceLogin(),
          });
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.resolveLoginError(error));
          this.submitting.set(false);
        },
        complete: () => {
          // submitting cleared after navigation when ensurePermissions finishes
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
    const roleSlug = this.agenceSession.getRoleSlug();
    const home = getAgenceHomePath(roleSlug);
    const target =
      returnUrl &&
      returnUrl.startsWith('/backoffice') &&
      canAccessAgencePath(roleSlug, returnUrl)
        ? returnUrl
        : home;
    void this.router.navigateByUrl(target, { replaceUrl: true }).finally(() => {
      this.submitting.set(false);
    });
  }

  private navigateAfterClientLogin(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const isPublicReturn =
      !!returnUrl &&
      !returnUrl.startsWith('/espace-client') &&
      !returnUrl.startsWith('/backoffice') &&
      !returnUrl.startsWith('/connexion');

    const target = isPublicReturn ? returnUrl : '/accueil';
    void this.router.navigateByUrl(target, { replaceUrl: true });
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
