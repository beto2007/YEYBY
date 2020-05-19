import { Component, OnInit } from '@angular/core';
import { PopoverController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirebaseService } from '@app/@shared/services/firebase/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-options-order',
  templateUrl: './options-order.component.html',
  styleUrls: ['./options-order.component.scss'],
})
export class OptionsOrderComponent implements OnInit {
  isLoading: boolean | undefined;
  item: any;

  constructor(
    private router: Router,
    private popoverController: PopoverController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private afs: AngularFirestore,
    private myFire: FirebaseService
  ) {}

  ngOnInit(): void {}

  dismissPopover() {
    this.popoverController.dismiss();
  }

  async getData() {
    let data: any;
    try {
      const response = await this.afs.collection('deliverers').doc(this.item.id).ref.get();
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

  async startOrder() {
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      const canStart = await this.myFire.canStartOrder(this.item.id);
      if (canStart === true) {
        this.presentToast('Orden iniciada');
      } else {
        this.completeOrderConfirm();
      }
    } catch (error) {
      console.error(error);
    }
    loadingOverlay.dismiss();
  }

  async cancelOrder() {
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      await this.afs.collection('orders').doc(this.item.id).update({
        status: 'cancelled',
      });
      this.presentToast('Orden cancelada');
    } catch (error) {
      console.error(error);
    }
    loadingOverlay.dismiss();
  }

  finalizeOrder() {
    console.log('Finalizando');
  }

  async startOrderConfirm() {
    const alert = await this.alertController.create({
      header: 'Iniciar orden',
      message: `¿Está seguro de iniciar la orden con folio: ${this.item.folio}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Iniciar',
          handler: () => {
            this.startOrder();
          },
        },
      ],
    });
    await alert.present();
  }

  async cancelOrderConfirm() {
    const alert = await this.alertController.create({
      header: 'Cancelar orden',
      message: `¿Está seguro de cancelar la orden con folio: ${this.item.folio}?`,
      buttons: [
        {
          text: 'Salir',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Cancelar orden',
          handler: () => {
            this.cancelOrder();
          },
        },
      ],
    });
    await alert.present();
  }

  async finalizeOrderConfirm() {
    const alert = await this.alertController.create({
      header: 'Finalizar orden',
      message: `¿Está seguro de finalizar la orden con folio: ${this.item.folio}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Finalizar',
          handler: () => {
            this.finalizeOrder();
          },
        },
      ],
    });
    await alert.present();
  }

  async completeOrderConfirm() {
    const alert = await this.alertController.create({
      header: 'Completar orden',
      message: `La orden con folio: ${this.item.folio} que intenta iniciar, esta incompleta ¿Desea completarla y continuar?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Completar',
          handler: () => {
            this.dismissPopover();
            this.router.navigate(['/orders/' + this.item.id]);
          },
        },
      ],
    });
    await alert.present();
  }
}
