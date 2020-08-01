import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private minutesOfDay = (m: any) => {
    return Number(m.minutes() + m.hours() * 60);
  };

  constructor(
    private router: Router,
    private afs: AngularFirestore,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    moment.locale('es');
  }

  public async createSpecialOrder() {
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      let data: any = {};
      const response: DocumentReference = await this.afs.collection('orders').add({
        company: data.company ? data.company : {},
        customer: data.customer ? data.customer : {},
        deliverer: data.deliverer ? data.deliverer : {},
        date: moment().toDate(),
        startDate: moment().toDate(),
        finishDate: moment().toDate(),
        search: [],
        status: 'created',
        type: 'special-order',
      });
      if (response.id) {
        this.router.navigate(['/special-orders/' + response.id]);
      } else {
        this.presentToast('Ha ocurrido un error');
      }
    } catch (error) {
      this.presentToast('Ha ocurrido un error');
      console.error(error);
    }
    loadingOverlay.dismiss();
  }

  public async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 6000,
    });
    toast.present();
  }

  public async orderDelivered(id: string) {
    try {
      await this.afs.collection('orders').doc(id).update({
        status: 'delivered',
        finishDate: moment().toDate(),
      });
      this.presentToast('¡Orden entregada!');
    } catch (error) {
      console.error(error);
    }
  }

  public async cancelOrder(id: string) {
    try {
      await this.afs.collection('orders').doc(id).update({
        status: 'cancelled',
        finishDate: moment().toDate(),
      });
      this.presentToast('¡Orden cancelada!');
    } catch (error) {
      console.error(error);
    }
  }

  public async cancelDelivery(id: string) {
    try {
      await this.afs.collection('orders').doc(id).update({
        status: 'canceled-delivery',
        finishDate: moment().toDate(),
      });
      this.presentToast('¡Entrega cancelada!');
    } catch (error) {
      console.error(error);
    }
  }

  public async canStartOrder(id: string): Promise<{ canCreate: boolean; code: string; message: string }> {
    let ret: { canCreate: boolean; code: string; message: string } = {
      canCreate: false,
      code: 'unidentified-error',
      message: 'Ha ocurrido un error, por favor inténtelo mas tarde.',
    };
    try {
      const response = await this.afs.collection('orders').doc(id).ref.get();
      const company: any | undefined = response.data().company;
      const deliverer: any | undefined = response.data().deliverer;
      const order: any | undefined = response.data().order;
      // Verificar si tiene empresa y repartidor
      if (company.id && deliverer.id) {
        if (
          (order.products && Array.from(order.products).length > 0) ||
          (order.otherProduct &&
            order.otherProduct.isChecked &&
            order.otherProduct.isChecked === true &&
            order.otherProduct.quantity > 0 &&
            order.otherProduct.description &&
            order.otherProduct.description !== '')
        ) {
          // Horario de empresa
          const days: any[] = Array.from(company.days);
          const index: number = days
            .map((item: any) => String(item.name).trim().toLocaleLowerCase())
            .indexOf(moment().format('dddd').trim().toLocaleLowerCase());
          if (index > -1) {
            const day: any = days[index];
            const currentHour: number = this.minutesOfDay(moment());
            const openingHours: number = this.minutesOfDay(moment(day.openingHours));
            const closingHours: number = this.minutesOfDay(moment(day.closingHours));
            if (day.works == true && currentHour >= openingHours && currentHour <= closingHours) {
              const data: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData> = await this.afs
                .collection('orders')
                .ref.where('status', '==', 'in-progress')
                .where('deliverer.id', '==', deliverer.id)
                .get();
              // Revisar si el repartidor esta en una entrega en camino en este momento
              if (data.empty == true) {
                await this.afs.collection('orders').doc(id).update({
                  status: 'in-progress',
                  startDate: moment().toDate(),
                });
                return { canCreate: true, code: 'created', message: 'Orden iniciada.' };
              } else {
                return {
                  canCreate: false,
                  code: 'bussy-deliverer',
                  message: 'Orden no iniciada, el repartidor esta en camino de entrega de otra orden.',
                };
              }
            } else {
              return {
                canCreate: false,
                code: 'closed-company',
                message:
                  'Orden no iniciada, la hora actual esta fuera de horario laboral de la empresa o no es un día laboral.',
              };
            }
          } else {
            return { canCreate: true, code: 'created', message: 'Orden iniciada.' };
          }
        } else {
          return {
            canCreate: false,
            code: 'no-products',
            message: 'Orden no iniciada, la orden no tienen productos, por favor completa la orden.',
          };
        }
      } else {
        return { canCreate: false, code: 'incomplete-order', message: 'Orden no iniciada, la orden no esta completa.' };
      }
    } catch (error) {
      console.error(error);
      return ret;
    }
    return ret;
  }

  public async canStartSpecialOrder(id: string): Promise<{ canCreate: boolean; code: string; message: string }> {
    let ret: { canCreate: boolean; code: string; message: string } = {
      canCreate: false,
      code: 'unidentified-error',
      message: 'Ha ocurrido un error, por favor inténtelo mas tarde.',
    };
    try {
      const response = await this.afs.collection('orders').doc(id).ref.get();
      const deliverer: any | undefined = response.data().deliverer;
      // Verificar si tiene repartidor
      if (deliverer.id) {
        const data: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData> = await this.afs
          .collection('orders')
          .ref.where('status', '==', 'in-progress')
          .where('deliverer.id', '==', deliverer.id)
          .get();
        // Revisar si el repartidor esta en una entrega en camino en este momento
        if (data.empty == true) {
          await this.afs.collection('orders').doc(id).update({
            status: 'in-progress',
            startDate: moment().toDate(),
          });
          return { canCreate: true, code: 'created', message: 'Orden iniciada.' };
        } else {
          return {
            canCreate: false,
            code: 'bussy-deliverer',
            message: 'Orden no iniciada, el repartidor esta en camino de entrega de otra orden.',
          };
        }
      } else {
        return { canCreate: false, code: 'incomplete-order', message: 'Orden no iniciada, la orden no esta completa.' };
      }
    } catch (error) {
      console.error(error);
      return ret;
    }
    return ret;
  }

  async cancelOrderV2(id: string, reason: string) {
    try {
      const response = await this.afs.collection('orders').doc(id).ref.get();
      const data = response.data();
      await this.afs.collection('deliverers').doc(data.delivery.id).update({
        isEnabled: true,
      });
      await this.afs.collection('orders').doc(id).update({
        status: 'cancelled',
        cancellationDate: moment().toDate(),
        cancellationReason: reason,
        isOrderDelivered: false,
      });
      this.presentToast('¡Orden cancelada!');
    } catch (error) {
      console.error(error);
    }
  }

  async alertCancelOrder(id: string) {
    const alert = await this.alertController.create({
      header: 'Cancelar órden',
      inputs: [
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Motivo de la cancelación',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: (data) => {
            if (data && data.description && data.description !== '') {
              this.cancelOrderV2(id, String(data.description));
            } else {
              this.presentToast('Órden no cancelada, debe incluir el motivo de la cancelación.');
            }
          },
        },
      ],
    });
    await alert.present();
  }
}
