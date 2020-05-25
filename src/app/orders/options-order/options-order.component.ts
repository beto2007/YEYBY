import { Component, OnInit } from '@angular/core';
import { PopoverController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirebaseService } from '@app/@shared/services/firebase/firebase.service';
import { Router } from '@angular/router';
import { ToolsService } from '@app/@shared/services/tools/tools.service';

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
    private tools: ToolsService,
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
      this.tools.presentToast('Ha ocurrido un error');
      console.error(error);
    }
    return data;
  }

  async startOrder() {
    this.dismissPopover();
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      const canStart = await this.myFire.canStartOrder(this.item.id);
      if (canStart === true) {
        this.tools.presentToast('Orden iniciada');
      } else {
        this.completeOrderConfirm();
      }
    } catch (error) {
      console.error(error);
    }
    loadingOverlay.dismiss();
  }

  async cancelOrder() {
    this.dismissPopover();
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      await this.myFire.cancelOrder(this.item.id);
    } catch (error) {
      console.error(error);
    }
    loadingOverlay.dismiss();
  }

  async cancelDelivery() {
    this.dismissPopover();
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      await this.myFire.cancelDelivery(this.item.id);
    } catch (error) {
      console.error(error);
    }
    loadingOverlay.dismiss();
  }

  async orderDelivered() {
    this.dismissPopover();
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      await this.myFire.orderDelivered(this.item.id);
    } catch (error) {
      console.error(error);
    }
    loadingOverlay.dismiss();
  }

  async startOrderConfirm() {
    const alert = await this.alertController.create({
      header: 'Iniciar entrega',
      message: `¿Está seguro de iniciar la entrega de la orden con folio: ${this.item.folio}?`,
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

  async cancelDeliveryConfirm() {
    const alert = await this.alertController.create({
      header: 'Cancelar entrega',
      message: `¿Está seguro de cancelar la entrega de la orden con folio: ${this.item.folio}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Cancelar entrega',
          handler: () => {
            this.cancelDelivery();
          },
        },
      ],
    });
    await alert.present();
  }

  async orderDeliveredConfirm() {
    const alert = await this.alertController.create({
      header: 'Orden entregada',
      message: `¿La orden con folio: ${this.item.folio}, ha sido entregada?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Orden entregada',
          handler: () => {
            this.orderDelivered();
          },
        },
      ],
    });
    await alert.present();
  }

  async completeOrderConfirm() {
    const alert = await this.alertController.create({
      header: 'Completar orden',
      message: `La orden con folio: ${this.item.folio} que intenta iniciar entrega, esta incompleta ¿Desea completarla y continuar?`,
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
