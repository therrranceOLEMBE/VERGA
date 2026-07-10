import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AgenceSessionService } from './agence-session.service';
import { ClientSessionService } from './client-session.service';

export type AuthScope = 'client' | 'agence';

@Injectable({ providedIn: 'root' })
export class AuthRedirectService {
  private readonly router = inject(Router);
  private readonly clientSession = inject(ClientSessionService);
  private readonly agenceSession = inject(AgenceSessionService);
  private redirecting = false;

  isClientRoute(url: string): boolean {
    return url.startsWith('/espace-client');
  }

  isAgenceRoute(url: string): boolean {
    return url.startsWith('/backoffice');
  }

  redirectToLogin(scope: AuthScope, returnUrl?: string): void {
    if (this.redirecting) {
      return;
    }

    this.redirecting = true;
    const targetReturnUrl = returnUrl ?? this.router.url;

    void this.router
      .navigate(['/connexion'], {
        queryParams: {
          returnUrl: targetReturnUrl,
          scope,
        },
        replaceUrl: true,
      })
      .finally(() => {
        this.redirecting = false;
      });
  }

  forceLogout(scope: AuthScope, returnUrl?: string): void {
    if (scope === 'client') {
      this.clientSession.clearSession();
    } else {
      this.agenceSession.clearSession();
    }

    this.redirectToLogin(scope, returnUrl);
  }

  ensureClientAccess(returnUrl?: string): boolean {
    if (this.clientSession.isAuthenticated()) {
      return true;
    }
    this.redirectToLogin('client', returnUrl);
    return false;
  }

  ensureAgenceAccess(returnUrl?: string): boolean {
    if (this.agenceSession.isAuthenticated()) {
      return true;
    }
    this.redirectToLogin('agence', returnUrl);
    return false;
  }
}
