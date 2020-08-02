import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadingController, Platform } from '@ionic/angular';
import { environment } from '@env/environment';
import { Logger } from '@core';
import { LoginComponent } from '../login.component';
import { NoWhiteSpaceValidator } from '@shared/validators/noWhiteSpace.validator';
import { EmailValidator } from '@shared/validators/email.validator';
import { MustMatch } from '@shared/helpers/must-match.validator';
const log = new Logger('Login');
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { ToolsService } from '@app/@shared/services/tools/tools.service';

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
    private http: HttpClient,
    private login: LoginComponent,
    private tools: ToolsService,
    private formBuilder: FormBuilder,
    private platform: Platform,
    private loadingController: LoadingController
  ) {
    this.createForm();
  }

  ngOnInit() {}

  ngOnDestroy() {}

  async registration() {
    // await this.afAuth.signOut();

    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({});
    loadingOverlay.present();
    try {
      const code: string = String(this.registerForm.get('code').value);
      const email: string = String(this.registerForm.get('email').value);
      const password: string = String(this.registerForm.get('password1').value);
      const name: string = String(this.registerForm.get('name').value);
      const response: any = await this.http
        .post(
          `${environment.firebaseApi}code`,
          {
            code: code,
            email: email,
            password: password,
            name: name,
            nameStr: this.tools.stringSearch(name),
            search: this.tools.arraySearch(name),
            date: moment().toDate(),
          },
          { observe: 'body' }
        )
        .toPromise();
      if (response && response.status && response.status === 'success') {
        this.login.loginForm.setValue({
          username: email,
          password: password,
          remember: true,
        });
        await this.login.login();
        this.tools.presentToast('Registro creado correctamente, bienvenido.', 5000);
      } else {
        this.tools.presentToast('Ha ocurrido un error, por favor inténtalo más tarde.', 5000);
      }
    } catch (error) {
      this.tools.presentToast(error.error.message, 5000);
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
