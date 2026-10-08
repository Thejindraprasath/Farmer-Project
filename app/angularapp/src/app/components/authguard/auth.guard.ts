import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    return this.authService.isLoggedIn() ? true : this.router.createUrlTree(['/login']);
  }
}

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.isLoggedIn()) return router.createUrlTree(['/login']);
  return authService.getUserRole() === 'Admin' ? true : router.createUrlTree(['/login']);
};

export const userGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.isLoggedIn()) return router.createUrlTree(['/login']);
  return authService.getUserRole() === 'User' ? true : router.createUrlTree(['/login']);
};
