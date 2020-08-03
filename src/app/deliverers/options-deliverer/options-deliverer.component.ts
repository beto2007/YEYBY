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
import { AddDelivererComponent } from '../add-deliverer/add-deliverer.component';
import { Logger } from '@core';
const log = new Logger('OptionsDelivererComponent');

@Component({
  selector: 'app-options-deliverer',
  templateUrl: './options-deliverer.component.html',
  styleUrls: ['./options-deliverer.component.scss'],
})
export class OptionsDelivererComponent implements OnInit {
  isLoading: boolean | undefined;
  item: any;

  constructor(
    private modalController: ModalController,
    private popoverController: PopoverController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private afs: AngularFirestore,
    private afStorage: AngularFireStorage
  ) {}

  ngOnInit(): void {}

  dismissPopover() {
    this.popoverController.dismiss();
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Eliminar repartidor',
      message: `¿Está seguro de eliminar al repartidor "${this.item.name}"?`,
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
      await this.afs.collection('deliverers').doc(this.item.id).delete();
      this.presentToast('Repartidor eliminado correctamente');
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
      const response = await this.afs.collection('deliverers').doc(this.item.id).ref.get();
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
      component: AddDelivererComponent,
      componentProps: { id: this.item.id },
    });
    this.dismissPopover();
    return await modal.present();
  }
}
