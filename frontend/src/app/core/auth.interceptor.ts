import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isRefresh = req.url.includes('/auth/refresh');
  const headers: Record<string, string> = {};
  if (auth.accessToken && !isRefresh) {
    headers['Authorization'] = `Bearer ${auth.accessToken}`;
  }
  const cloned = req.clone({ setHeaders: headers, withCredentials: true });

  return next(cloned).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || isRefresh || req.url.includes('/auth/login')) {
        return throwError(() => err);
      }
      return auth.refresh().pipe(
        switchMap(() => {
          const retry = req.clone({
            withCredentials: true,
            setHeaders: auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {},
          });
          return next(retry);
        }),
        catchError((refreshErr) => {
          auth.logout();
          return throwError(() => refreshErr);
        })
      );
    })
  );
};
