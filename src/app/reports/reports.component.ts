import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference, Query } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { ToolsService } from '@shared/services/tools/tools.service';
import { LoadingController, ModalController } from '@ionic/angular';
import { DeliverersComponent } from '@app/deliverers/deliverers.component';
import * as moment from 'moment';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  error: string | undefined;
  isLoading = false;
  public today: string;
  public today1: string;
  private subscription: Subscription;
  public orderBy: string = 'finishDate';
  public deliverer: any;
  public orderByDirection: any = 'asc';
  private perPage: number = 750;
  private mainCollection: string = 'orders';
  public forward: boolean = false;
  public back: boolean = false;
  public arrayDocs: any[] = [];
  public total: number = 0;

  constructor(
    private afs: AngularFirestore,
    private loadingController: LoadingController,
    private tools: ToolsService,
    private modalController: ModalController
  ) {
    this.today = this.beautyDateToday(new Date());
    this.today1 = this.beautyDateTodayDDMMYYYY(new Date());
  }

  beautyDate(date: any) {
    return this.tools.dateFormatter(date, 'DD/MM/YYYY h:mm A');
  }

  beautyDateToday(date: any) {
    return this.tools.dateFormatter(date, 'LL');
  }

  beautyDateTodayDDMMYYYY(date: any) {
    return this.tools.dateFormatter(date, 'DD/MM/YYYY');
  }

  closeSubscriptions() {
    try {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    } catch (error) {
      console.error(error);
    }
  }

  ionViewDidLeave() {
    this.closeSubscriptions();
  }

  ngOnInit() {}

  async addDelivererFunc() {
    const modal = await this.modalController.create({
      component: DeliverersComponent,
      componentProps: { mode: 'modal' },
    });
    modal.onDidDismiss().then(async (response) => {
      this.isLoading = true;
      const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
      loadingOverlay.present();
      try {
        if (response && response.data && response.data.item && response.data.item.id) {
          this.deliverer = response.data.item;
          const data = await this.getDocs();
        }
      } catch (error) {
        console.error(error);
      }
      this.isLoading = false;
      loadingOverlay.dismiss();
    });
    return await modal.present();
  }

  getDocs(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const today = moment();
        let start = new Date(today.format('YYYY-MM-DD') + ' 00:00:00');
        let end = new Date(today.format('YYYY-MM-DD') + ' 11:59:59');
        let collection: AngularFirestoreCollection<any>;
        let collRef: CollectionReference = this.afs.collection(this.mainCollection).ref;
        let query: Query;
        query = collRef.where('status', '==', 'delivered');
        if (this.deliverer) {
          query = query.where('deliverer.id', '==', this.deliverer.id);
        }
        query = query.where('finishDate', '>=', start);
        query = query.where('finishDate', '<=', end);
        query = query.orderBy(this.orderBy, this.orderByDirection);
        collection = this.afs.collection(this.mainCollection, (ref) => query.limit(this.perPage));
        this.subscription = collection.snapshotChanges().subscribe(
          (snap) => {
            this.arrayDocs = snap.map((element) => {
              const id: string = element.payload.doc.id;
              const data: any = element.payload.doc.data();
              data.dateStr = data.date && data.date !== '' ? this.beautyDate(data.date.toDate()) : '';
              data.startDateStr =
                data.startDate && data.startDate !== '' ? this.beautyDate(data.startDate.toDate()) : '';
              data.finishDateStr =
                data.finishDate && data.finishDate !== '' ? this.beautyDate(data.finishDate.toDate()) : '';
              return { id, ...data };
            });
            this.calculate();
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

  calculate() {
    this.total = 0;
    this.arrayDocs.forEach((element: any) => {
      if (element && element.order && element.order.shippingPrice) {
        this.total = this.total + Number(element.order.shippingPrice);
      }
    });
  }
}
