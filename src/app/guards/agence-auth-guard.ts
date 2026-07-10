import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AgenceSessionService } from '../services/agence-session.service';

function checkAgenceAuth(stateUrl: string) {
  const agenceSession = inject(AgenceSessionService);
  const router = inject(Router);

  if (agenceSession.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/connexion'], {
    queryParams: {
      returnUrl: stateUrl,
      scope: 'agence',
    },
  });
}

export const agenceAuthGuard: CanActivateFn = (_route, state) => checkAgenceAuth(state.url);

export const agenceAuthChildGuard: CanActivateChildFn = (_route, state) => checkAgenceAuth(state.url);
