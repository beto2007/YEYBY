import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, Platform } from '@ionic/angular';
import { TextFieldTypes } from '@ionic/core';
import { TranslateService } from '@ngx-translate/core';

import { I18nService } from '@app/i18n';
import { AuthenticationService, CredentialsService } from '@app/auth';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
  public routes: any[] = [
    { title: 'Inicio', link: '/home', icon: 'home' },
    { title: 'Repartidores', link: '/deliverers', icon: 'bicycle' },
    { title: 'Clientes', link: '/customers', icon: 'person' },
    { title: 'Empresas', link: '/companies', icon: 'briefcase' },
    { title: 'Ordenes', link: '/orders', icon: 'document-text' },
    { title: 'Configuración', link: '/home', icon: 'build' },
  ];

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private platform: Platform,
    private alertController: AlertController,
    private authenticationService: AuthenticationService,
    private credentialsService: CredentialsService,
    private i18nService: I18nService
  ) {}

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Cerrar la sesión',
      message: 'Quieres cerrar la sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'primary',
        },
        {
          text: 'Ok',
          cssClass: 'secondary',
          handler: () => {
            this.logout();
          },
        },
      ],
    });

    await alert.present();
  }

  get username(): string | null {
    const credentials = this.credentialsService.credentials;
    return credentials ? credentials.username : null;
  }

  private logout() {
    this.authenticationService.logout().subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
  }

  get isWeb(): boolean {
    return !this.platform.is('cordova');
  }

  private async changeLanguage() {
    const alertController = await this.alertController.create({
      header: this.translateService.instant('Change language'),
      inputs: this.i18nService.supportedLanguages.map((language) => ({
        type: 'radio' as TextFieldTypes,
        name: language,
        label: language,
        value: language,
        checked: language === this.i18nService.language,
      })),
      buttons: [
        {
          text: this.translateService.instant('Cancel'),
          role: 'cancel',
        },
        {
          text: this.translateService.instant('Ok'),
          handler: (language) => {
            this.i18nService.language = language;
          },
        },
      ],
    });
    await alertController.present();
  }
}
