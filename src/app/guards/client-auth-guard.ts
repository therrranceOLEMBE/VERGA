import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { ClientSessionService } from '../services/client-session.service';

function checkClientAuth(stateUrl: string) {
  const clientSession = inject(ClientSessionService);
  const router = inject(Router);

  if (clientSession.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/connexion'], {
    queryParams: {
      returnUrl: stateUrl,
      scope: 'client',
    },
  });
}

export const clientAuthGuard: CanActivateFn = (_route, state) => checkClientAuth(state.url);

export const clientAuthChildGuard: CanActivateChildFn = (_route, state) => checkClientAuth(state.url);
