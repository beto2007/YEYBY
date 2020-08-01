import { Component, OnInit } from '@angular/core';
import { AngularFirestore, CollectionReference, AngularFirestoreCollection, Query } from '@angular/fire/firestore';
import { Subscription, Observable } from 'rxjs';
import { ToolsService } from '@app/@shared/services/tools/tools.service';
import { ActivatedRoute } from '@angular/router';
import { DeliverersComponent } from '@app/deliverers/deliverers.component';
import { interval } from 'rxjs';
import { LoadingController, ModalController, AlertController } from '@ionic/angular';
import { FirebaseService } from '@app/@shared/services/firebase/firebase.service';
import * as moment from 'moment';

@Component({
  selector: 'app-pending-orders',
  templateUrl: './pending-orders.component.html',
  styleUrls: ['./pending-orders.component.scss'],
})
export class PendingOrdersComponent implements OnInit {
  public skeleton: any[] = ['', '', '', '', '', ''];
  public arrayDocs: any[] = [];
  public isLoading: boolean;
  private subscription: Subscription;
  private totalSubs: Subscription;
  public total: number = 0;
  public orderBy: string = 'date';
  public orderByDirection: any = 'asc';
  private perPage: number = 500;
  private mainCollection: string = 'orders';
  private startAfter: any;
  private endBefore: any;
  private startAt: any;
  public forward: boolean = false;
  public back: boolean = false;
  public status: string = 'created';
  private subscriptions: Subscription[] = [];

  constructor(
    private afs: AngularFirestore,
    private tools: ToolsService,
    private aRoute: ActivatedRoute,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private firebase: FirebaseService,
    private alertController: AlertController
  ) {
    this.aRoute.params.subscribe((params) => {
      if (
        params &&
        params.type &&
        (params.type === 'in-progress' || params.type === 'created' || params.type === 'finished')
      ) {
        this.segmentChanged({ detail: { value: params.type } });
      }
    });
  }

  segmentChanged(ev: any) {
    this.status = String(ev.detail.value);
    this.initializeApp();
  }

  async initializeApp(direction?: string) {
    this.isLoading = true;
    try {
      await this.getDocs(direction);
    } catch (error) {
      console.error(error);
    }
    this.isLoading = false;
  }

  getDocs(direction?: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        let collection: AngularFirestoreCollection<any>;
        let collRef: CollectionReference = this.afs.collection(this.mainCollection).ref;
        let query: Query;
        query = collRef.orderBy(this.orderBy, this.orderByDirection);
        query = query.where('status', '==', 'pending');
        if (this.startAfter && direction === 'forward') {
          query = query.startAfter(this.startAfter);
        } else if (this.startAt && this.endBefore && direction === 'back') {
          query = query.startAt(this.startAt).endBefore(this.endBefore);
        }
        collection = this.afs.collection(this.mainCollection, (ref) => query.limit(this.perPage));
        this.subscription = collection.snapshotChanges().subscribe(
          async (snap) => {
            this.startAfter = snap.length > 0 ? snap[snap.length - 1].payload.doc : undefined;
            this.endBefore = snap.length > 0 ? snap[0].payload.doc : undefined;
            if (this.startAfter) {
              this.forward = !(
                await this.afs
                  .collection(this.mainCollection)
                  .ref.orderBy(this.orderBy, this.orderByDirection)
                  .where('status', '==', 'pending')
                  .startAfter(this.startAfter)
                  .limit(this.perPage)
                  .get()
              ).empty;
            } else {
              this.forward = false;
            }
            let back: any = {};
            if (this.endBefore) {
              back = await this.afs
                .collection(this.mainCollection)
                .ref.orderBy(this.orderBy, this.orderByDirection === 'asc' ? 'desc' : 'asc')
                .where('status', '==', 'pending')
                .startAfter(this.endBefore)
                .limit(this.perPage)
                .get();
            } else {
              back.empty = true;
            }
            this.back = !back.empty;
            if (this.back == true) {
              this.startAt = back.docs[back.docs.length - 1];
            }
            this.closeTimerSubscriptions();
            this.arrayDocs = snap.map((element) => {
              const id: string = element.payload.doc.id;
              const data: any = element.payload.doc.data();
              data.menuStr = Array.from(data.menu)
                .map((e: any) => ' ' + e.name)
                .toString();
              data.dateStr = data.date && data.date !== '' ? this.tools.beautyDate(data.date.toDate()) : '';
              data.time = new Observable<string>((observer) => {
                observer.next(this.tools.getMinutes(data.date.toDate()));
                this.subscriptions.push(
                  interval(1000).subscribe(() => {
                    observer.next(this.tools.getMinutes(data.date.toDate()));
                  })
                );
              });
              return { id, ...data };
            });
            resolve(this.arrayDocs);
          },
          (error) => {
            reject(error);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  closeTimerSubscriptions() {
    for (let sub of this.subscriptions) {
      try {
        if (sub) {
          sub.unsubscribe();
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  ngOnInit(): void {}

  ngOnDestroy() {}

  ionViewDidEnter() {
    this.initializeApp();
  }

  ionViewDidLeave() {
    this.closeSubscriptions();
  }

  closeSubscriptions() {
    try {
      this.closeTimerSubscriptions();
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
      if (this.totalSubs) {
        this.totalSubs.unsubscribe();
      }
    } catch (error) {
      console.error(error);
    }
  }

  public async assignDeliverier(order: any): Promise<void> {
    const modal = await this.modalController.create({
      component: DeliverersComponent,
      componentProps: { mode: 'select' },
    });
    modal.onDidDismiss().then(async (response) => {
      this.isLoading = true;
      const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
      loadingOverlay.present();
      try {
        if (response && response.data && response.data.item && response.data.item.id) {
          await this.afs
            .collection('orders')
            .doc(order.id)
            .update({
              status: 'finished',
              delivery: {
                name: response.data.item.name,
                folio: response.data.item.folio,
                id: response.data.item.id,
                phone: response.data.item.phone,
              },
              assignmentTime: moment().toDate(),
              isOrderDelivered: false,
            });
          await this.afs.collection('deliverers').doc(response.data.item.id).update({
            isEnabled: false,
          });
          const docResponse = await this.afs.collection('orders').doc(order.id).ref.get();
          const data = docResponse.data();
          const id = docResponse.id;
          this.sendInformationToDelvererCheck({ id, ...data });
        }
      } catch (error) {
        console.error(error);
      }
      this.isLoading = false;
      loadingOverlay.dismiss();
    });
    return await modal.present();
  }

  public alertCancelOrder(id: string) {
    this.firebase.alertCancelOrder(id);
  }

  async sendInformationToDelvererCheck(order: any) {
    const alert = await this.alertController.create({
      cssClass: 'ion-text-wrap',
      header: 'Enviar información a repartidor',
      message: `¿Desea enviar la información de la orden generada al repartidor "${
        order && order.delivery && order.delivery.name ? order.delivery.name : ''
      }"?`,
      inputs: [
        {
          name: 'companyFolio',
          type: 'checkbox',
          label: 'Folio de la empresa',
          value: 'companyFolio',
          checked: true,
        },
        {
          name: 'companyPhone',
          type: 'checkbox',
          label: 'Teléfono de la empresa',
          value: 'companyPhone',
          checked: true,
        },
        {
          name: 'customerName',
          type: 'checkbox',
          label: 'Nombre de cliente',
          value: 'customerName',
          checked: true,
        },

        {
          name: 'customerFolio',
          type: 'checkbox',
          label: 'Folio de cliente',
          value: 'customerFolio',
          checked: true,
        },
        {
          name: 'customerPhone',
          type: 'checkbox',
          label: 'Teléfono de cliente',
          value: 'customerPhone',
          checked: true,
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Enviar',
          handler: (filters: string[]) => {
            this.tools.sendInformationToDelverer(
              order && order.delivery && order.delivery.phone ? order.delivery.phone : '',
              this.mapInformation(order, filters)
            );
          },
        },
      ],
    });
    await alert.present();
  }

  mapInformation(order: any, filters: string[]): string {
    let message: string = '';
    //Company Info
    message = message + `Orden: ${order.folio}\n`;
    message = message + '---------------------------\n';
    message = message + `Fecha de inicio: ${moment(order.date.toDate()).format('LLL')}\n`;
    message = message + '\n';
    message = message + `Lugar de recolección\n`;
    message = message + '---------------------------\n';
    if (order && order.company && order.company.name) {
      message = message + `Empresa: ${order.company.name}\n`;
    }
    if (order && order.company && order.company.folio && filters.indexOf('companyFolio') > -1) {
      message = message + `Folio: ${order.company.folio}\n`;
    }
    if (order && order.company && order.company.phone && filters.indexOf('companyPhone') > -1) {
      message = message + `Teléfono: ${order.company.phone}\n`;
    }
    if (order && order.company && order.company.streetAddress) {
      message = message + `Dirección: ${order.company.streetAddress}\n`;
    }
    if (order && order.company && order.company.references) {
      message = message + `Referencias: ${order.company.references}\n`;
    }
    message = message + '\n';
    //Products Info
    if (order && order.menu) {
      message = message + `Productos:\n`;
      message = message + '---------------------------\n';
      let productStr: string = '';
      Array.from(order.menu).forEach((product: any) => {
        if (product && product.name && product.name !== '') {
          productStr = productStr + `(${product.quantity}) ${product.name}\n`;
        }
        if (product && product.observations && product.observations !== '') {
          productStr = productStr + `${product.observations}\n`;
        }
        if (product && product.price && product.price !== '') {
          productStr = productStr + `Precio: $${new Intl.NumberFormat('en-IN').format(Number(product.price))}\n`;
        }
      });
      message = message + productStr;
      message = message + '---------------------------\n';
      message = message + `Costo de orden: $${new Intl.NumberFormat('en-IN').format(Number(order.totalOrder))}\n`;
      message = message + `Costo de envío: $${new Intl.NumberFormat('en-IN').format(Number(order.shippingPrice))}\n`;
      message = message + `Total: $${new Intl.NumberFormat('en-IN').format(Number(order.total))}\n`;
      message = message + '\n';
    }
    //Customer Info
    message = message + `Lugar de entrega\n`;
    message = message + '---------------------------\n';
    if (order && order.customer && order.customer.name && filters.indexOf('customerName') > -1) {
      message = message + `Cliente: ${order.customer.name}\n`;
    }
    if (order && order.customer && order.customer.folio && filters.indexOf('customerFolio') > -1) {
      message = message + `Folio: ${order.customer.folio}\n`;
    }
    if (order && order.customer && order.customer.phone && filters.indexOf('customerPhone') > -1) {
      message = message + `Teléfono: ${order.customer.phone}\n`;
    }
    if (order && order.deliveryPlace && order.deliveryPlace.streetAddress) {
      message = message + `Dirección: ${order.deliveryPlace.streetAddress}\n`;
    }
    if (order && order.deliveryPlace && order.deliveryPlace.references) {
      message = message + `Referencias: ${order.deliveryPlace.references}\n`;
    }
    //Deliverer Info
    message = message + '\n';
    message = message + `El que entrega\n`;
    message = message + '---------------------------\n';
    if (order && order.delivery && order.delivery.name) {
      message = message + `Repartidor: ${order.delivery.name}\n`;
    }
    if (order && order.delivery && order.delivery.folio) {
      message = message + `Folio: ${order.delivery.folio}\n`;
    }
    return message;
  }
}
