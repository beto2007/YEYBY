import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Logger } from '@core';
import { CredentialsService } from '../credentials.service';
const log = new Logger('SessionGuard');

@Injectable({
  providedIn: 'root',
})
export class SessionGuard implements CanActivate {
  constructor(private router: Router, private credentialsService: CredentialsService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.credentialsService.credentials.uid) {
      return true;
    }
    log.debug('Authenticated, redirecting...');
    this.router.navigate(['/home']);
    return false;
  }
}
