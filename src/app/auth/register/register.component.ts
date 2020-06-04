import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadingController, Platform } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { forkJoin, from } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Logger, untilDestroyed } from '@core';
import { AuthenticationService } from '../authentication.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { ToolsService } from '@app/@shared/services/tools/tools.service';
import { LoginComponent } from '../login.component';
const log = new Logger('Login');

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  version: string | null = environment.version;
  error: string | undefined;
  registerForm!: FormGroup;
  isLoading = false;

  constructor(
    private router: Router,
    private login: LoginComponent,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private platform: Platform,
    private loadingController: LoadingController,
    private authenticationService: AuthenticationService,
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private tools: ToolsService
  ) {
    this.createForm();
  }

  ngOnInit() {}

  ngOnDestroy() {}

  async registration() {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({});
    loadingOverlay.present();
    try {
      const code: string = String(this.registerForm.get('code').value);
      const response = await this.afs
        .collection('invites')
        .ref.where('code', '==', code)
        .where('status', '==', 'pending')
        .get();
      if (!response.empty === true) {
        const doc = response.docs[0];
        if (doc && doc.exists === true) {
          if (doc.data().company) {
            const inviteID: string = doc.id;
            const response1 = await this.afs.collection('companies').doc(doc.data().company).ref.get();
            if (response1.exists === true) {
              const companyID: string = response1.id;
              const email: string = String(this.registerForm.get('email').value);
              const password: string = String(this.registerForm.get('password1').value);
              const user = await this.afAuth.createUserWithEmailAndPassword(email, password);
              if (user && user.user && user.user.email && user.user.uid) {
                const userID: string = user.user.uid;
                const userEMAIL: string = user.user.email;
                const name: string = this.registerForm.get('name').value;
                await this.afs
                  .collection('users')
                  .doc(userID)
                  .set({
                    email: userEMAIL,
                    company: companyID,
                    name: name,
                    nameStr: this.tools.stringSearch(name),
                    search: this.tools.arraySearch(name),
                    date: new Date(),
                    status: 'active',
                    type: 'user',
                    uid: userID,
                  });
                await this.afs.collection('companies').doc(companyID).update({
                  user: userID,
                });
                await this.afs.collection('invites').doc(inviteID).update({
                  status: 'assigned',
                });
                await this.afAuth.signOut();
                this.login.loginForm.setValue({
                  username: userEMAIL,
                  password: password,
                  remember: true,
                });
                await this.login.login();
                console.log('Se creo correctamente');
              } else {
                log.debug('no existe se creo el auth');
              }
            } else {
              log.debug('no existe la empresa(doc)');
            }
          } else {
            log.debug('no existe la empresa');
          }
        } else {
          log.debug('no existe el doc');
        }
      } else {
        log.debug('no existe en empresa(Codigo)');
      }
    } catch (error) {
      log.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
    // this.isLoading = true;
    // const login$ = this.authenticationService.login(this.registerForm.value);
    // const loadingOverlay = await this.loadingController.create({});
    // const loading$ = from(loadingOverlay.present());
    // forkJoin([login$, loading$])
    //   .pipe(
    //     map(([credentials, ...rest]) => credentials),
    //     finalize(() => {
    //       this.registerForm.markAsPristine();
    //       this.isLoading = false;
    //       loadingOverlay.dismiss();
    //     }),
    //     untilDestroyed(this)
    //   )
    //   .subscribe(
    //     (credentials) => {
    //       // log.debug(`${credentials.username} successfully logged in`);
    //       this.router.navigate([this.route.snapshot.queryParams.redirect || '/'], { replaceUrl: true });
    //     },
    //     (error) => {
    //       log.debug(`Login error: ${error}`);
    //       this.error = error;
    //     }
    //   );
  }

  get isWeb(): boolean {
    return !this.platform.is('cordova');
  }

  private createForm() {
    this.registerForm = this.formBuilder.group({
      email: ['usuario1@yopmail.com', Validators.required],
      name: ['Oscar Santos', Validators.required],
      code: ['678904', Validators.required],
      password1: ['123456', Validators.required],
      password2: ['123456', Validators.required],
    });
  }
}
