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
import { AddYeybyUsersComponent } from '../add-yeyby-users/add-yeyby-users.component';
import { HttpClient } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { environment } from '@env/environment';

@Component({
  selector: 'app-options-yeyby-users',
  templateUrl: './options-yeyby-users.component.html',
  styleUrls: ['./options-yeyby-users.component.scss'],
})
export class OptionsYeybyUsersComponent implements OnInit {
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
      header: 'Eliminar usuario',
      message: `¿Está seguro de eliminar al usuario "${this.item.name}"?`,
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

  async delete(): Promise<void> {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      if (this.token) {
        const responseInit: any = await this.http
          .post(
            `${environment.firebaseApi}deleteUserAuth`,
            {
              token: this.token,
              uid: this.item.id,
            },
            { observe: 'body' }
          )
          .toPromise();
        if (responseInit && responseInit.status && responseInit.status === 'success') {
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
          await this.afs.collection('users').doc(this.item.id).delete();
          this.presentToast('Usuario eliminado correctamente');
          this.dismissPopover();
        } else {
          this.presentToast('Ha ocurrido un error');
        }
      } else {
        this.presentToast('Ha ocurrido un error');
      }
    } catch (error) {
      console.error(error);
      this.presentToast('Ha ocurrido un error');
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async getData() {
    let data: any;
    try {
      const response = await this.afs.collection('customers').doc(this.item.id).ref.get();
      data = response.data();
    } catch (error) {
      this.presentToast('Ha ocurrido un error');
      console.error(error);
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
      component: AddYeybyUsersComponent,
      componentProps: { id: this.item.id },
    });
    this.dismissPopover();
    return await modal.present();
  }
}
