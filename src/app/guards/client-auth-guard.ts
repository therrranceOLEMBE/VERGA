import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ClientSessionService } from '../services/client-session.service';

export const clientAuthGuard: CanActivateFn = (_route, state) => {
  const clientSession = inject(ClientSessionService);
  const router = inject(Router);

  if (clientSession.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/connexion'], {
    queryParams: { returnUrl: state.url },
  });
};
