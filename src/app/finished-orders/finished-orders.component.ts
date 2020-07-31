import { Component, OnInit } from '@angular/core';
import { AngularFirestore, CollectionReference, AngularFirestoreCollection, Query } from '@angular/fire/firestore';
import { Subscription, Observable } from 'rxjs';
import { ToolsService } from '@app/@shared/services/tools/tools.service';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { interval } from 'rxjs';
import { LoadingController, AlertController } from '@ionic/angular';
import { FirebaseService } from '@app/@shared/services/firebase/firebase.service';
@Component({
  selector: 'app-finished-orders',
  templateUrl: './finished-orders.component.html',
  styleUrls: ['./finished-orders.component.scss'],
})
export class FinishedOrdersComponent implements OnInit {
  public skeleton: any[] = ['', '', '', '', '', ''];
  public arrayDocs: any[];
  public isLoading: boolean;
  private subscription: Subscription;
  private totalSubs: Subscription;
  public total: number = 0;
  public orderBy: string = 'date';
  public orderByDirection: any = 'desc';
  private perPage: number = 50;
  private mainCollection: string = 'ordersV2';
  public filterByDelivery: string;
  private startAfter: any;
  private endBefore: any;
  private startAt: any;
  public forward: boolean = false;
  public back: boolean = false;
  public status: string = 'created';
  private subscriptions: Subscription[] = [];
  public customer: any;

  constructor(
    private afs: AngularFirestore,
    private tools: ToolsService,
    private aRoute: ActivatedRoute,
    private loadingController: LoadingController,
    private firebase: FirebaseService,
    private alertController: AlertController
  ) {
    this.aRoute.params.subscribe((params) => {
      if (params && params.id) {
        this.filterByDelivery = String(params.id);
        this.initDelivery(this.filterByDelivery);
      }
    });
  }

  async initDelivery(idDelivery: string) {
    try {
      const response = await this.afs.collection('deliverers').doc(idDelivery).ref.get();
      const data = response.data();
      const id = response.id;
      this.customer = { id, ...data };
    } catch (error) {
      console.error(error);
    }
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
        query = query.where('status', '==', 'finished');
        if (this.filterByDelivery) {
          query = query.where('delivery.id', '==', this.filterByDelivery);
        }
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
              let forwardQuery;
              if (this.filterByDelivery) {
                forwardQuery = this.afs
                  .collection(this.mainCollection)
                  .ref.orderBy(this.orderBy, this.orderByDirection)
                  .where('status', '==', 'finished')
                  .where('delivery.id', '==', this.filterByDelivery)
                  .startAfter(this.startAfter)
                  .limit(this.perPage)
                  .get();
              } else {
                forwardQuery = this.afs
                  .collection(this.mainCollection)
                  .ref.orderBy(this.orderBy, this.orderByDirection)
                  .where('status', '==', 'finished')
                  .startAfter(this.startAfter)
                  .limit(this.perPage)
                  .get();
              }
              this.forward = !(await forwardQuery).empty;
            } else {
              this.forward = false;
            }
            let back: any = {};
            if (this.endBefore) {
              let backQuery;
              if (this.filterByDelivery) {
                backQuery = this.afs
                  .collection(this.mainCollection)
                  .ref.orderBy(this.orderBy, this.orderByDirection === 'asc' ? 'desc' : 'asc')
                  .where('status', '==', 'finished')
                  .where('delivery.id', '==', this.filterByDelivery)
                  .startAfter(this.endBefore)
                  .limit(this.perPage)
                  .get();
              } else {
                backQuery = this.afs
                  .collection(this.mainCollection)
                  .ref.orderBy(this.orderBy, this.orderByDirection === 'asc' ? 'desc' : 'asc')
                  .where('status', '==', 'finished')
                  .startAfter(this.endBefore)
                  .limit(this.perPage)
                  .get();
              }
              back = await backQuery;
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
              data.dateStr = data.date && data.date !== '' ? this.tools.beautyDate(data.date.toDate()) : '';
              data.time = new Observable<string>((observer) => {
                observer.next(this.tools.getMinutes(data.assignmentTime.toDate()));
                this.subscriptions.push(
                  interval(1000).subscribe(() => {
                    observer.next(this.tools.getMinutes(data.assignmentTime.toDate()));
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

  async presentAlertConfirm(id: string) {
    const alert = await this.alertController.create({
      header: 'Finalizar órden',
      message: '¿Estás seguro de finalizar esta órden?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Finalizar',
          handler: () => {
            this.finishOrder(id);
          },
        },
      ],
    });
    await alert.present();
  }

  public alertCancelOrder(id: string) {
    this.firebase.alertCancelOrder(id);
  }

  public async finishOrder(id: string) {
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      const response = await this.afs.collection('ordersV2').doc(id).ref.get();
      const data = response.data();
      if (data && data.delivery && data.delivery.id) {
        await this.afs.collection('deliverers').doc(data.delivery.id).update({
          isEnabled: true,
        });
        await this.afs.collection('ordersV2').doc(id).update({
          deliveredTime: moment().toDate(),
          isOrderDelivered: true,
        });
        this.tools.presentToast('¡Órden terminada con éxito, el repartidor ahora está disponible!');
      } else {
        this.tools.presentToast('Ha ocurrido un error');
      }
    } catch (error) {
      console.error(error);
      this.tools.presentToast('Ha ocurrido un error');
    }
    loadingOverlay.dismiss();
  }
}
