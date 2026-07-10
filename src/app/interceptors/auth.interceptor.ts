import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthRedirectService } from '../services/auth-redirect.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authRedirect = inject(AuthRedirectService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || !req.headers.has('Authorization')) {
        return throwError(() => error);
      }

      const url = req.url;
      if (url.includes('/client/')) {
        authRedirect.forceLogout('client');
      } else if (url.includes('/agence/')) {
        authRedirect.forceLogout('agence');
      }

      return throwError(() => error);
    }),
  );
};
