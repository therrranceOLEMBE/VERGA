import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable, map, of } from 'rxjs';
import { AgenceSessionService } from '../services/agence-session.service';
import { canAccessAgencePath, getAgenceHomePath } from '../utils/agence-permissions.util';

function checkAgenceAuth(stateUrl: string): Observable<boolean | UrlTree> {
  const agenceSession = inject(AgenceSessionService);
  const router = inject(Router);

  if (!agenceSession.isAuthenticated()) {
    return of(
      router.createUrlTree(['/connexion'], {
        queryParams: {
          returnUrl: stateUrl,
          scope: 'agence',
        },
      }),
    );
  }

  return agenceSession.ensurePermissions().pipe(
    map(() => {
      const roleSlug = agenceSession.getRoleSlug();
      if (!canAccessAgencePath(roleSlug, stateUrl)) {
        return router.createUrlTree([getAgenceHomePath(roleSlug)]);
      }
      return true;
    }),
  );
}

export const agenceAuthGuard: CanActivateFn = (_route, state) => checkAgenceAuth(state.url);

export const agenceAuthChildGuard: CanActivateChildFn = (_route, state) => checkAgenceAuth(state.url);
