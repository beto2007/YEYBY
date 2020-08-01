import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadingController, Platform, AlertController } from '@ionic/angular';
import { environment } from '@env/environment';
import { Logger } from '@core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { ToolsService } from '@app/@shared/services/tools/tools.service';
import { NoWhiteSpaceValidator } from '@shared/validators/noWhiteSpace.validator';
import { MustMatch } from '@shared/helpers/must-match.validator';
import { CredentialsService } from '@app/auth';
import { LoginComponent } from '@app/auth/login.component';
const log = new Logger('Login');

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  version: string | null = environment.version;
  personalDataForm!: FormGroup;
  accountDataForm!: FormGroup;
  isLoading = false;
  login: LoginComponent;

  constructor(
    private formBuilder: FormBuilder,
    private platform: Platform,
    private loadingController: LoadingController,
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private tools: ToolsService,
    private credentialsService: CredentialsService,
    private alertController: AlertController
  ) {
    this.createForm1();
    this.createForm2();
  }

  ngOnInit() {
    this.initData();
  }

  ngOnDestroy() {}

  async initData() {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({});
    loadingOverlay.present();
    try {
      const response = await this.afs.collection('users').doc(this.credentialsService.credentials.uid).ref.get();
      this.refillForm1(response.data());
    } catch (error) {
      log.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  refillForm1(data: any) {
    this.personalDataForm.setValue({
      name: data && data.name ? String(data.name) : '',
      phone: data && data.phone ? String(data.phone) : '',
    });
  }

  async save1() {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({});
    loadingOverlay.present();
    try {
      let data: any = this.personalDataForm.value;
      let search: string[] = [];
      data.nameStr = String(data.name).toLocaleLowerCase();
      search = search.concat(this.tools.arraySearch(String(this.personalDataForm.get('name').value)));
      search = search.concat(this.tools.arraySearch(String(this.personalDataForm.get('phone').value)));
      data.search = search;
      data.name = String(data.name).toLocaleLowerCase();
      data.name = String(data.name).replace(/\b(\w)/g, (s) => s.toUpperCase());
      await this.afs
        .collection('users')
        .doc(this.credentialsService.credentials.uid)
        .update(this.personalDataForm.value);
      this.tools.presentToast('Perfil actualizado correctamente');
    } catch (error) {
      log.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async save2() {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({});
    loadingOverlay.present();
    try {
      await this.afAuth.signInWithEmailAndPassword(
        this.credentialsService.credentials.username,
        String(this.accountDataForm.value.password1)
      );
      const response = await this.afAuth.currentUser;
      await response.updatePassword(this.accountDataForm.value.password2);
      this.accountDataForm.reset();
      this.accountDataForm.setValue({
        password1: '',
        password2: '',
        password3: '',
      });
      this.tools.presentToast(`La contraseña se ha actualizado correctamente.`, 60000);
    } catch (error) {
      switch (error.code) {
        case 'auth/invalid-email':
          this.tools.presentToast('Email no válido, por favor intenta nuevamente.', 60000);
          break;
        case 'auth/user-not-found':
          this.tools.presentToast('Email o contraseña no válidos, por favor intenta nuevamente.', 60000);
          break;
        case 'auth/wrong-password':
          this.tools.presentToast('Contraseña anterior incorrecta, por favor intenta nuevamente.', 60000);
          break;
        case 'auth/user-disabled':
          this.tools.presentToast(
            'La cuenta se encuentra desactivada actualmente, por favor intenta nuevamente.',
            60000
          );
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

  private createForm1() {
    this.personalDataForm = this.formBuilder.group({
      name: ['', [Validators.required, NoWhiteSpaceValidator.isValid]],
      phone: ['', [NoWhiteSpaceValidator.isValid]],
    });
  }

  private createForm2() {
    this.accountDataForm = this.formBuilder.group({
      password1: ['', [Validators.required, Validators.minLength(6), NoWhiteSpaceValidator.isValid]],
      password2: ['', [Validators.required, Validators.minLength(6), NoWhiteSpaceValidator.isValid]],
      password3: ['', [Validators.required]],
    });
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Cambiar constrseña',
      message: '¿Estás seguro de cambiar tu contraseña actual?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Cambiar',
          handler: () => {
            this.save2();
          },
        },
      ],
    });

    await alert.present();
  }
}
