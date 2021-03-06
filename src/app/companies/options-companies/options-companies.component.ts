import { Component, OnInit } from '@angular/core';
import {
  PopoverController,
  AlertController,
  LoadingController,
  ToastController,
  ModalController,
} from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { AddCompanyComponent } from '../add-company/add-company.component';
import { ToolsService } from '@app/@shared/services/tools/tools.service';
import { Logger } from '@core';
const log = new Logger('OptionsCompaniesComponent');
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { environment } from '@env/environment';

@Component({
  selector: 'app-options-companies',
  templateUrl: './options-companies.component.html',
  styleUrls: ['./options-companies.component.scss'],
})
export class OptionsCompaniesComponent implements OnInit {
  isLoading: boolean | undefined;
  item: any;
  token: string;

  constructor(
    private modalController: ModalController,
    private popoverController: PopoverController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private afs: AngularFirestore,
    private afStorage: AngularFireStorage,
    private tools: ToolsService,
    private http: HttpClient,
    private afAuth: AngularFireAuth
  ) {}

  async getTOken() {
    this.afAuth.authState.subscribe(async (user) => {
      this.token = await user.getIdToken();
    });
  }

  ngOnInit(): void {
    this.getTOken();
  }

  dismissPopover() {
    this.popoverController.dismiss();
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Eliminar empresa',
      message: `¿Está seguro de eliminar a la empresa "${this.item.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.delete();
          },
        },
      ],
    });
    await alert.present();
  }

  async code() {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      const response1 = (await this.afs.collection('invites').doc(this.item.id).ref.get()).data();
      const response2 = (await this.afs.collection('companies').doc(this.item.id).ref.get()).data();
      if (response1 && response2 && response1.status === 'assigned' && response2.user) {
        this.tools.presentToast(`La empresa '${this.item.name}' ya cuenta con un usuario asignado.`);
      } else {
        if (response1 && response1.code && response1.status === 'pending') {
          this.presentCode(response1.code);
        } else {
          const code: string = this.tools.randomNumber(6);
          const response = await this.afs.collection('invites').doc(this.item.id).set({
            code: code,
            date: moment().toDate(),
            company: this.item.id,
            status: 'pending',
          });
          this.presentCode(code);
        }
      }
    } catch (error) {
      log.error(error);
    }
    this.dismissPopover();
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async presentRemoveUser() {
    const alert = await this.alertController.create({
      header: 'Quitar usuario asignado a empresa',
      message: `¿Estás seguro de eliminar al usuario asignado a ${this.item.name}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteUser(this.item.user, true);
          },
        },
      ],
    });
    await alert.present();
  }

  async presentCode(code: string) {
    const alert = await this.alertController.create({
      header: 'Código de asignación de usuario',
      subHeader: `Empresa: ${this.item.name}`,
      message: `Código: ${code}`,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
        },
      ],
    });
    await alert.present();
  }

  async delete(): Promise<void> {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      const data = await this.getData();
      let imagesPath: string[] = [];
      if (data && data.image && data.image.main && data.image.main.path) {
        imagesPath.push(data.image.main.path);
      }
      if (data && data.image && data.image.thumbnail && data.image.thumbnail.path) {
        imagesPath.push(data.image.thumbnail.path);
      }
      if (data && data.image && data.image.list && data.image.list.path) {
        imagesPath.push(data.image.list.path);
      }
      if (imagesPath[0]) {
        this.deletePast(imagesPath);
      }
      await this.afs.collection('companies').doc(this.item.id).delete();
      if (this.item && this.item.user) {
        this.deleteUser(this.item.user, false);
      }
      this.presentToast('Empresa eliminada correctamente');
      this.dismissPopover();
    } catch (error) {
      log.error(error);
      this.presentToast('Ha ocurrido un error');
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async getData() {
    let data: any;
    try {
      const response = await this.afs.collection('companies').doc(this.item.id).ref.get();
      data = response.data();
    } catch (error) {
      this.presentToast('Ha ocurrido un error');
      log.error(error);
    }
    return data;
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 6000,
    });
    toast.present();
  }

  async deletePast(array: string[]) {
    let promises: Promise<any>[] = [];
    const storageRef = this.afStorage.storage.ref();
    array.forEach((element) => {
      promises.push(storageRef.child(element).delete());
    });
    await Promise.all(promises);
  }

  async add() {
    const modal = await this.modalController.create({
      component: AddCompanyComponent,
      componentProps: { id: this.item.id },
    });
    this.dismissPopover();
    return await modal.present();
  }

  async deleteUser(uid: string, showAlert: boolean): Promise<void> {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      if (this.token) {
        let responseInit: any;
        try {
          responseInit = await this.http
            .post(
              `${environment.firebaseApi}deleteUserAuth`,
              {
                token: this.token,
                uid: uid,
              },
              { observe: 'body' }
            )
            .toPromise();
        } catch (error) {
          log.error(error);
        }
        if (responseInit && responseInit.status && responseInit.status === 'success') {
          await this.deleteDoc(uid, showAlert);
        } else {
          await this.deleteDoc(uid, showAlert);
        }
      } else {
        this.presentToast('Ha ocurrido un error');
      }
    } catch (error) {
      log.error(error);
      this.presentToast('Ha ocurrido un error');
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async deleteDoc(uid: string, showAlert: boolean) {
    try {
      const data = await this.getUserData(uid);
      let imagesPath: string[] = [];
      if (data && data.image && data.image.main && data.image.main.path) {
        imagesPath.push(data.image.main.path);
      }
      if (data && data.image && data.image.thumbnail && data.image.thumbnail.path) {
        imagesPath.push(data.image.thumbnail.path);
      }
      if (data && data.image && data.image.list && data.image.list.path) {
        imagesPath.push(data.image.list.path);
      }
      if (imagesPath[0]) {
        this.deletePast(imagesPath);
      }
      await this.afs.collection('users').doc(uid).delete();
      try {
        await this.afs.collection('companies').doc(this.item.id).update({ user: '' });
      } catch (error) {
        log.error(error);
      }
      if (showAlert === true) {
        this.presentToast('Usuario eliminado correctamente');
        this.dismissPopover();
      }
    } catch (error) {
      this.presentToast('Ha ocurrido un error');
      log.error(error);
    }
  }

  async getUserData(uid: string) {
    let data: any;
    try {
      const response = await this.afs.collection('users').doc(uid).ref.get();
      data = response.data();
    } catch (error) {
      this.presentToast('Ha ocurrido un error');
      log.error(error);
    }
    return data;
  }
}
