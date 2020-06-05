import { Injectable } from '@angular/core';

export interface Credentials {
  // Customize received credentials here
  username: string;
  uid: string;
  status: string;
  type: string;
}

const credentialsKey = 'YEYBYCREDENTIALS';

/**
 * Provides storage for authentication credentials.
 * The Credentials interface should be replaced with proper implementation.
 */
@Injectable({
  providedIn: 'root',
})
export class CredentialsService {
  private _credentials: Credentials | null = null;

  private routePermissions = {
    admin: {
      routes: [
        'home',
        'profile',
        'reports',
        'special-orders',
        'about',
        'companies',
        'customers',
        'deliverers',
        'orders',
      ],
    },
    user: { routes: ['home', 'profile', 'about', 'companies'] },
  };

  constructor() {
    const savedCredentials = sessionStorage.getItem(credentialsKey) || localStorage.getItem(credentialsKey);
    if (savedCredentials) {
      this._credentials = JSON.parse(savedCredentials);
    }
  }

  /**
   * Checks is the user is authenticated.
   * @return True if the user is authenticated.
   */
  isAuthenticated(route: string): boolean {
    const activeUser: boolean =
      this.credentials &&
      this.credentials.type &&
      (this.credentials.type === 'admin' || this.credentials.type === 'user') &&
      this.credentials &&
      this.credentials.status &&
      this.credentials.status === 'active';
    let activate: boolean[] = [];
    if (this.credentials && this.credentials.type && this.credentials.type === 'admin') {
      this.routePermissions.admin.routes.forEach((element: string) => {
        activate.push(route.includes(element));
      });
      const index: number = activate.indexOf(true);
      if (index > -1 && activeUser) {
        return true;
      } else {
        return false;
      }
    } else if (this.credentials && this.credentials.type && this.credentials.type === 'user') {
      this.routePermissions.user.routes.forEach((element: string) => {
        activate.push(route.includes(element));
      });
      const index: number = activate.indexOf(true);
      if (index > -1 && activeUser) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * Gets the user credentials.
   * @return The user credentials or null if the user is not authenticated.
   */
  get credentials(): Credentials | null {
    return this._credentials;
  }

  /**
   * Sets the user credentials.
   * The credentials may be persisted across sessions by setting the `remember` parameter to true.
   * Otherwise, the credentials are only persisted for the current session.
   * @param credentials The user credentials.
   * @param remember True to remember credentials across sessions.
   */
  setCredentials(credentials?: Credentials, remember?: boolean) {
    this._credentials = credentials || null;

    if (credentials) {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(credentialsKey, JSON.stringify(credentials));
    } else {
      sessionStorage.removeItem(credentialsKey);
      localStorage.removeItem(credentialsKey);
    }
  }
}
