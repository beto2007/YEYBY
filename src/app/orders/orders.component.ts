import { Component, OnInit } from '@angular/core';
import { AngularFirestore, CollectionReference, AngularFirestoreCollection, Query } from '@angular/fire/firestore';
import { ToastController, PopoverController } from '@ionic/angular';
import { OptionsOrderComponent } from './options-order/options-order.component';
import { Subscription } from 'rxjs';
import { SortByOrderComponent } from './sort-by-order/sort-by-order.component';
import { ToolsService } from '@app/@shared/services/tools/tools.service';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from '@app/@shared/services/firebase/firebase.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit {
  public skeleton: any[] = ['', '', '', '', '', ''];
  public arrayDocs: any[];
  public isLoading = false;
  private subscription: Subscription;
  private totalSubs: Subscription;
  public total: number = 0;
  public orderBy: string = 'date';
  public orderByDirection: any = 'desc';
  private searchOrderBy: string = 'date';
  private searchOorderByDirection: any = 'desc';
  private perPage: number = 5;
  private mainCollection: string = 'orders';
  private docNumbers: string = 'metadatas/orders';
  private startAfter: any;
  private endBefore: any;
  private startAt: any;
  public forward: boolean = false;
  public back: boolean = false;
  private searchStr: string;
  public title: any = {
    capitalLetter: {
      prural: 'Órdenes',
      singular: 'Órden',
    },
    lowerCase: {
      prural: 'órdenes',
      singular: 'órden',
    },
  };
  public status: string = 'created';

  constructor(
    private afs: AngularFirestore,
    private popoverController: PopoverController,
    private tools: ToolsService,
    private aRoute: ActivatedRoute,
    private myFire: FirebaseService
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

  async doSearch(ev: any) {
    this.isLoading = true;
    try {
      await this.search(ev);
    } catch (error) {
      console.error(error);
    }
    this.isLoading = false;
  }

  async initializeApp(direction?: string) {
    this.isLoading = true;
    this.searchStr = undefined;
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
        let arrayIn: string[] = [];
        if (this.status === 'finished') {
          arrayIn = ['cancelled', 'canceled-delivery', 'delivered'];
        } else {
          arrayIn = [this.status];
        }
        query = query.where('status', 'in', arrayIn);
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
                  .where('status', 'in', arrayIn)
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
                .where('status', 'in', arrayIn)
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

  async search(ev: any) {
    const searchStr: string = String(ev.target.value).toLocaleLowerCase();
    if (searchStr.length >= 5) {
      this.searchStr = searchStr;
      const snap = await this.afs
        .collection(this.mainCollection)
        .ref.orderBy(this.searchOrderBy, this.searchOorderByDirection)
        .where('search', 'array-contains-any', [this.searchStr])
        .limit(this.perPage)
        .get();
      this.startAfter = snap.empty == false ? snap.docs[snap.docs.length - 1] : undefined;
      this.endBefore = snap.empty == false ? snap.docs[0] : undefined;
      if (this.startAfter) {
        this.forward = !(
          await this.afs
            .collection(this.mainCollection)
            .ref.orderBy(this.searchOrderBy, this.searchOorderByDirection)
            .where('search', 'array-contains-any', [this.searchStr])
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
          .ref.orderBy(this.searchOrderBy, this.searchOorderByDirection === 'asc' ? 'desc' : 'asc')
          .where('search', 'array-contains-any', [this.searchStr])
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
      this.arrayDocs = snap.docs.map((element) => {
        const id: string = element.id;
        const data: any = element.data();
        data.dateStr = data.date && data.date !== '' ? this.beautyDate(data.date.toDate()) : '';
        data.startDateStr = data.startDate && data.startDate !== '' ? this.beautyDate(data.startDate.toDate()) : '';
        data.finishDateStr = data.finishDate && data.finishDate !== '' ? this.beautyDate(data.finishDate.toDate()) : '';
        return { id, ...data };
      });
      this.isLoading = false;
    }
  }

  ngOnInit(): void {
    this.totalSubscription();
  }

  ngOnDestroy() {}

  async presentPopover(ev: any, item: any) {
    const popover = await this.popoverController.create({
      component: OptionsOrderComponent,
      event: ev,
      translucent: true,
      componentProps: { item: item },
    });
    return await popover.present();
  }

  async sortBy(ev: any) {
    const popover = await this.popoverController.create({
      component: SortByOrderComponent,
      event: ev,
      translucent: true,
    });
    popover.onDidDismiss().then((data) => {
      if (data && data.data && data.data.filter && data.data.filter != '') {
        this.orderBy = data.data.filter;
        this.initializeApp();
      }
    });
    return await popover.present();
  }

  ionViewDidEnter() {
    this.initializeApp();
  }

  ionViewDidLeave() {
    this.closeSubscriptions();
  }

  totalSubscription() {
    const snap = this.afs.doc(this.docNumbers).valueChanges();
    this.totalSubs = snap.subscribe((snap: any) => {
      this.total = Number(snap.count);
    });
  }

  closeSubscriptions() {
    try {
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

  beautyDate(date: any) {
    return this.tools.dateFormatter(date, 'DD/MM/YYYY h:mm A');
  }

  generateSpecailOrder() {
    this.myFire.createSpecialOrder();
  }
}
