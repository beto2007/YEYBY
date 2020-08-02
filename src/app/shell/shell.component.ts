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
  public routes: any[];
  public routesPermissions = {
    admin: [
      { title: 'Inicio', link: '/home', icon: 'home-outline' },
      { title: 'Usuarios Yeyby', link: '/yeyby-users', icon: 'person-add-outline' },
      { title: 'Repartidores', link: '/deliverers', icon: 'bicycle-outline' },
      { title: 'Clientes', link: '/customers', icon: 'person-outline' },
      { title: 'Empresas', link: '/companies', icon: 'briefcase-outline' },
      { title: 'Reportes de repartidores', link: '/reports', icon: 'calculator-outline' },
      { title: 'Crear órden', link: '/create-order', icon: 'receipt-outline' },
      { title: 'Órdenes en espera', link: '/pending-orders', icon: 'timer-outline' },
      { title: 'Órdenes termindas', link: '/finished-orders', icon: 'shield-checkmark-outline' },
      { title: 'Configuración', link: '/profile', icon: 'build-outline' },
    ],
    company: [
      { title: 'Inicio', link: '/home', icon: 'home-outline' },
      { title: 'Configuración', link: '/profile', icon: 'build-outline' },
    ],
    secretary: [
      { title: 'Inicio', link: '/home', icon: 'home-outline' },
      { title: 'Crear órden', link: '/create-order', icon: 'receipt-outline' },
      { title: 'Órdenes en espera', link: '/pending-orders', icon: 'timer-outline' },
      { title: 'Órdenes termindas', link: '/finished-orders', icon: 'shield-checkmark-outline' },
      { title: 'Configuración', link: '/profile', icon: 'build-outline' },
    ],
  };

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private platform: Platform,
    private alertController: AlertController,
    private authenticationService: AuthenticationService,
    private credentialsService: CredentialsService,
    private i18nService: I18nService
  ) {
    if (
      this.credentialsService &&
      this.credentialsService.credentials &&
      this.credentialsService.credentials.type &&
      this.credentialsService.credentials.type === 'admin'
    ) {
      this.routes = this.routesPermissions.admin;
    } else if (
      this.credentialsService &&
      this.credentialsService.credentials &&
      this.credentialsService.credentials.type &&
      this.credentialsService.credentials.type === 'company'
    ) {
      this.routes = this.routesPermissions.company;
    } else if (
      this.credentialsService &&
      this.credentialsService.credentials &&
      this.credentialsService.credentials.type &&
      this.credentialsService.credentials.type === 'secretary'
    ) {
      this.routes = this.routesPermissions.secretary;
    }
  }

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
    this.authenticationService.logout().subscribe(() => this.router.navigate(['/login']));
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
