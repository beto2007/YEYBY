import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadingController, Platform } from '@ionic/angular';
import { environment } from '@env/environment';
import { Logger } from '@core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ToolsService } from '@app/@shared/services/tools/tools.service';
import { EmailValidator } from '@shared/validators/email.validator';
const log = new Logger('Login');

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  version: string | null = environment.version;
  resetForm!: FormGroup;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private platform: Platform,
    private loadingController: LoadingController,
    private afAuth: AngularFireAuth,
    private tools: ToolsService
  ) {
    this.createForm();
  }

  ngOnInit() {}

  ngOnDestroy() {}

  async reset() {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({});
    loadingOverlay.present();
    try {
      const email: string = String(this.resetForm.value.email);
      await this.afAuth.sendPasswordResetEmail(email);
      this.tools.presentToast(
        `Te hemos enviado un email a '${email}' con las instrucciones para el cambio de tu contraseña, por favor revisa tu bandeja de correo no deseado.`,
        60000
      );
    } catch (error) {
      log.error(error);
      this.tools.presentToast(
        `Ha ocurrido un error, probablemente el email no existe en la plataforma, intenta nuevamente.`,
        60000
      );
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  get isWeb(): boolean {
    return !this.platform.is('cordova');
  }

  private createForm() {
    this.resetForm = this.formBuilder.group({
      email: ['', [Validators.required, EmailValidator.isValid]],
    });
  }
}
