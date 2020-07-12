import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Logger } from '@core';
import { CredentialsService } from './credentials.service';
const log = new Logger('AuthenticationGuard');

@Injectable({
  providedIn: 'root',
})
export class AuthenticationGuard implements CanActivate {
  constructor(private router: Router, private credentialsService: CredentialsService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (
      this.credentialsService.isAuthenticated(
        route && route.routeConfig && route.routeConfig.data && route.routeConfig.data.access
          ? route.routeConfig.data.access
          : []
      )
    ) {
      return true;
    }
    log.debug('Not authenticated, redirecting and adding redirect url...');
    this.router.navigate(['/login']);
    return false;
  }
}
