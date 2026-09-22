import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './models';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data['roles'] || []) as Role[];
  if (!roles.length || auth.hasRole(roles)) return true;
  return router.createUrlTree(['/dashboard']);
};
