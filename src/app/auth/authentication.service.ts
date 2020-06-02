import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Credentials, CredentialsService } from './credentials.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';

export interface LoginContext {
  username: string;
  password: string;
  remember?: boolean;
}

/**
 * Provides a base for authentication workflow.
 * The login/logout methods should be replaced with proper implementation.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(
    private credentialsService: CredentialsService,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore
  ) {}

  /**
   * Authenticates the user.
   * @param context The login parameters.
   * @return The user credentials.
   */
  async login(context: LoginContext): Promise<Observable<Credentials>> {
    const user = await this.afAuth
      .signInWithEmailAndPassword(String(context.username).toLocaleLowerCase(), context.password)
      .then(async (resp) => {
        return await this.afs
          .collection('users')
          .doc(resp.user.uid)
          .ref.get()
          .then((resp2) => {
            const data: any = resp2.data();
            if (resp2.exists === true) {
              return {
                email: resp.user.email,
                uid: resp.user.uid,
                status: data.status,
                type: data.type,
              };
            } else {
              this.logout();
            }
          });
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
    // Replace by proper authentication call
    if (user && user.uid && user.email) {
      const data = {
        username: user.email,
        uid: user.uid,
        status: user.status,
        type: user.type,
      };
      this.credentialsService.setCredentials(data, context.remember);
      return of(data);
    } else {
      return of();
    }
  }

  /**
   * Logs out the user and clear credentials.
   * @return True if the user was logged out successfully.
   */
  logout(): Observable<boolean> {
    // Customize credentials invalidation here
    this.credentialsService.setCredentials();
    this.afAuth.signOut();
    return of(true);
  }
}
