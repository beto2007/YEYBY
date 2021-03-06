import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference, Query } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { ToolsService } from '@shared/services/tools/tools.service';
import { LoadingController, ModalController } from '@ionic/angular';
import { DeliverersComponent } from '@app/deliverers/deliverers.component';
import * as moment from 'moment';
import { Logger } from '@core';
const log = new Logger('ReportsComponent');

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
  public today2: string;
  public todayDate: any;
  private subscription: Subscription;
  public orderBy: string = 'deliveredTime';
  public delivery: any;
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
    this.todayDate = moment();
    this.today = this.beautyDateToday(this.todayDate);
    this.today1 = this.beautyDateTodayDDMMYYYY(this.todayDate);
    this.today2 = this.today1;
  }

  beautyDate(date: any) {
    return this.tools.dateFormatter(date, 'DD/MM/YYYY h:mm A');
  }

  beautyDateToday(date: any) {
    return this.tools.dateFormatter(date, 'LL');
  }

  beautyDateTodayDDMMYYYY(date: any) {
    return this.tools.dateFormatter(date, 'YYYY-MM-DD');
  }

  closeSubscriptions() {
    try {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    } catch (error) {
      log.error(error);
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
          this.delivery = response.data.item;
          await this.getDocs();
        }
      } catch (error) {
        log.error(error);
      }
      this.isLoading = false;
      loadingOverlay.dismiss();
    });
    return await modal.present();
  }

  async changeDate(ev: any) {
    if (ev && ev.target && ev.target.value) {
      this.todayDate = moment(ev.target.value);
      this.today = this.beautyDateToday(this.todayDate);
      this.today1 = this.beautyDateTodayDDMMYYYY(this.todayDate);
      if (this.delivery) {
        this.isLoading = true;
        const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
        loadingOverlay.present();
        try {
          await this.getDocs();
        } catch (error) {
          log.error(error);
        }
        this.isLoading = false;
        loadingOverlay.dismiss();
      }
    }
  }

  getDocs(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const today = this.todayDate;
        let start = today.startOf('day').toDate();
        let end = today.endOf('day').toDate();
        let collection: AngularFirestoreCollection<any>;
        let collRef: CollectionReference = this.afs.collection(this.mainCollection).ref;
        let query: Query;
        query = collRef.where('status', 'in', ['finished', 'cancelled']);
        // query = query.where('isOrderDelivered', '==', true);
        if (this.delivery) {
          query = query.where('delivery.id', '==', this.delivery.id);
        }
        query = query.where('deliveredTime', '>=', start);
        query = query.where('deliveredTime', '<=', end);
        query = query.orderBy(this.orderBy, this.orderByDirection);
        collection = this.afs.collection(this.mainCollection, (ref) => query.limit(this.perPage));
        this.subscription = collection.snapshotChanges().subscribe(
          (snap) => {
            this.arrayDocs = snap.map((element) => {
              const id: string = element.payload.doc.id;
              const data: any = element.payload.doc.data();
              data.dateStr = data.date && data.date !== '' ? this.beautyDate(data.date.toDate()) : '';
              data.startDateStr = data.date && data.date !== '' ? this.beautyDate(data.date.toDate()) : '';
              data.finishDateStr =
                data.deliveredTime && data.deliveredTime !== '' ? this.beautyDate(data.deliveredTime.toDate()) : '';
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
      if (
        element &&
        element.shippingPrice &&
        element.status &&
        element.status === 'finished' &&
        element.isOrderDelivered === true
      ) {
        this.total = this.total + Number(element.shippingPrice);
      }
    });
  }
}
