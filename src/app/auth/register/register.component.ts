import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadingController, Platform } from '@ionic/angular';
import { environment } from '@env/environment';
import { Logger } from '@core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { ToolsService } from '@app/@shared/services/tools/tools.service';
import { LoginComponent } from '../login.component';
import { NoWhiteSpaceValidator } from '@shared/validators/noWhiteSpace.validator';
import { EmailValidator } from '@shared/validators/email.validator';
import { MustMatch } from '@shared/helpers/must-match.validator';
const log = new Logger('Login');

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  version: string | null = environment.version;
  registerForm!: FormGroup;
  isLoading = false;

  constructor(
    private login: LoginComponent,
    private formBuilder: FormBuilder,
    private platform: Platform,
    private loadingController: LoadingController,
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
                this.tools.presentToast('Registro creado correctamente, bienvenido.', 5000);
              } else {
                this.tools.presentToast('Ha ocurrido un error, por favor inténtalo más tarde.', 60000);
              }
            } else {
              this.tools.presentToast(
                'No existe una empresa asociada a este código, por favor contacta a la persona que te envió este código.',
                60000
              );
            }
          } else {
            this.tools.presentToast(
              'No existe una empresa asociada a este código, por favor contacta a la persona que te envió este código.',
              60000
            );
          }
        } else {
          this.tools.presentToast(
            'El código de verifiación ya ha sido utilizado o no existe, por favor contacta a la persona que te envió este código.',
            60000
          );
        }
      } else {
        this.tools.presentToast(
          'El código de verifiación ya ha sido utilizado o no existe, por favor contacta a la persona que te envió este código.',
          60000
        );
      }
    } catch (error) {
      log.error(error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          this.tools.presentToast('El email que intentas registrar esta siendo utlizado por otra cuenta.', 60000);
          break;
        default:
          this.tools.presentToast('Ha ocurrido un error, por favor inténtalo más tarde.', 60000);
          break;
      }
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  get isWeb(): boolean {
    return !this.platform.is('cordova');
  }

  private createForm() {
    this.registerForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, EmailValidator.isValid]],
        name: ['', [Validators.required, NoWhiteSpaceValidator.isValid]],
        code: ['', [Validators.required, NoWhiteSpaceValidator.isValid]],
        password1: ['', [Validators.required, Validators.minLength(6), NoWhiteSpaceValidator.isValid]],
        password2: ['', [Validators.required]],
      },
      {
        validator: MustMatch('password1', 'password2'),
      }
    );
  }
}
