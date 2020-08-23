import { Component, OnInit } from '@angular/core';
import {
  AngularFirestore,
  CollectionReference,
  AngularFirestoreCollection,
  Query,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { Subscription, Observable } from 'rxjs';
import { ToolsService } from '@app/@shared/services/tools/tools.service';
import { ActivatedRoute } from '@angular/router';
import { interval } from 'rxjs';
import { FirebaseService } from '@app/@shared/services/firebase/firebase.service';
import { Logger } from '@core';
import { AlertController } from '@ionic/angular';
const log = new Logger('FinishedOrdersComponent');

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
  public orderBy: string = 'assignmentTime';
  public orderByDirection: any = 'desc';
  private perPage: number = 50;
  private mainCollection: string = 'orders';
  public filterByDelivery: string;
  private startAfter: any;
  private endBefore: any;
  private startAt: any;
  public forward: boolean = false;
  public back: boolean = false;
  public status: string = 'created';
  private subscriptions: Subscription[] = [];
  public customer: any;
  deliveryDoc: AngularFirestoreDocument;
  deliverySub: Subscription;

  constructor(
    private afs: AngularFirestore,
    private tools: ToolsService,
    private aRoute: ActivatedRoute,
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
      this.deliveryDoc = this.afs.collection('deliverers').doc(idDelivery);
      this.deliverySub = this.deliveryDoc.snapshotChanges().subscribe((snap) => {
        const data = snap.payload.data();
        const id = snap.payload.id;
        this.customer = { id, ...data };
      });
    } catch (error) {
      log.error(error);
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
      log.error(error);
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
        query = query.where('status', 'in', ['finished', 'cancelled']);
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
              if (data && data.type === 'orden') {
                data.title = Array.from(data.menu)
                  .map((e: any) => ' ' + e.name)
                  .toString();
              } else {
                data.title =
                  data && data.deliveryPlace && data.deliveryPlace.streetAddress
                    ? data.deliveryPlace.streetAddress
                    : '';
              }
              data.dateStr = data.date && data.date !== '' ? this.tools.beautyDate(data.date.toDate()) : '';
              data.assignmentTimeStr =
                data.assignmentTime && data.assignmentTime !== ''
                  ? this.tools.beautyDate(data.assignmentTime.toDate())
                  : '';
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
        log.error(error);
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
      if (this.deliverySub) {
        this.deliverySub.unsubscribe();
      }
    } catch (error) {
      log.error(error);
    }
  }

  public alertCancelOrder(id: string) {
    this.firebase.alertCancelOrder(id);
  }

  async finishOrderAlertConfirm(id: string) {
    this.firebase.finishOrderAlertConfirm(id);
  }

  async forceRelease(id: string) {
    const alert = await this.alertController.create({
      header: 'Liberar repartidor',
      message: '¿Estás seguro de liberar a este usuario?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Liberar',
          handler: () => {
            this.release(id);
          },
        },
      ],
    });
    await alert.present();
  }

  async release(id: string) {
    try {
      await this.afs.collection('deliverers').doc(id).update({
        isEnabled: true,
      });
      this.tools.presentToast('Repartidor liberado correctamente.');
    } catch (error) {
      log.error(error);
    }
  }
}
