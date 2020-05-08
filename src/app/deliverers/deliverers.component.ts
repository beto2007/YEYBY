import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ModalController, LoadingController, ToastController, PopoverController } from '@ionic/angular';
import { OptionsDelivererComponent } from './options-deliverer/options-deliverer.component';
import { Subscription } from 'rxjs';
import { AddDelivererComponent } from './add-deliverer/add-deliverer.component';
import { SortByDelivererComponent } from './sort-by-deliverer/sort-by-deliverer.component';

@Component({
  selector: 'app-deliverers',
  templateUrl: './deliverers.component.html',
  styleUrls: ['./deliverers.component.scss'],
})
export class DeliverersComponent implements OnInit, OnDestroy {
  public docs: any[];
  isLoading = false;
  suscription: Subscription;
  totalSubs: Subscription;
  arraySuscription: Subscription[];
  total: number = 0;
  orderBy: string = 'nameStr';
  orderByDirection: any = 'asc';
  perPage: number = 30;
  mainCollection: string = 'deliverers';
  totalNumbers: string = 'metadatas/deliverers';
  initialCursor: any;
  nextCursor: any;
  backCursor1: any;
  backCursor2: any;
  noBack: boolean = true;
  noForward: boolean = true;

  constructor(
    private afs: AngularFirestore,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private popoverController: PopoverController,
    private modalController: ModalController
  ) {}

  async search(ev: any) {
    this.noBack = false;
    this.noForward = false;
    let searchStr: string = String(ev.target.value).toLocaleLowerCase();
    if (searchStr.length >= 5) {
      this.isLoading = true;
      const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
      loadingOverlay.present();
      try {
        const snap = await this.afs
          .collection(this.mainCollection)
          .ref.orderBy(this.orderBy, this.orderByDirection)
          .where('search', 'array-contains-any', [searchStr])
          .limit(this.perPage)
          .get();
        this.docs = snap.docs.map((element) => {
          const id: string = element.id;
          const data: any = element.data();
          return { id, ...data };
        });
      } catch (error) {
        console.error(error);
        this.presentToast('Ha ocurrido un error');
      }
      this.isLoading = false;
      loadingOverlay.dismiss();
    }
  }

  pagination(direction: string) {
    this.initializeApp(direction);
  }

  async initializeApp(direction?: string) {
    this.closeSubscription();
    let snapshotChanges;
    if (direction && direction === 'forward') {
      snapshotChanges = this.afs
        .collection(this.mainCollection, (ref) =>
          ref.orderBy(this.orderBy, this.orderByDirection).startAfter(this.nextCursor[this.orderBy]).limit(this.perPage)
        )
        .snapshotChanges();
    } else if (direction && direction === 'back') {
      snapshotChanges = this.afs
        .collection(this.mainCollection, (ref) =>
          ref
            .orderBy(this.orderBy, this.orderByDirection)
            .startAt(this.backCursor1[this.orderBy])
            .endBefore(this.backCursor2[this.orderBy])
            .limit(this.perPage)
        )
        .snapshotChanges();
    } else {
      snapshotChanges = this.afs
        .collection(this.mainCollection, (ref) => ref.orderBy(this.orderBy, this.orderByDirection).limit(this.perPage))
        .snapshotChanges();
    }
    this.suscription = snapshotChanges.subscribe(
      async (snap) => {
        this.nextCursor = snap[snap.length - 1].payload.doc.data();
        this.backCursor2 = snap[0].payload.doc.data();
        const forward = await this.afs
          .collection(this.mainCollection)
          .ref.orderBy(this.orderBy, this.orderByDirection)
          .startAfter(this.nextCursor[this.orderBy])
          .limit(this.perPage)
          .get();
        this.noForward = false;
        if (!(forward.empty == true)) {
          this.noForward = true;
        }
        const back = await this.afs
          .collection(this.mainCollection)
          .ref.orderBy(this.orderBy, this.orderByDirection === 'asc' ? 'desc' : 'asc')
          .startAfter(this.backCursor2[this.orderBy])
          .limit(this.perPage)
          .get();
        this.noBack = false;
        if (!(back.empty == true)) {
          this.backCursor1 = back.docs[back.docs.length - 1].data();
          this.noBack = true;
        }
        this.docs = snap.map((element) => {
          const id: string = element.payload.doc.id;
          const data: any = element.payload.doc.data();
          return { id, ...data };
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  ngOnInit(): void {
    this.totalSubscription();
  }

  ngOnDestroy() {}

  async presentPopover(ev: any, item: any) {
    const popover = await this.popoverController.create({
      component: OptionsDelivererComponent,
      event: ev,
      translucent: true,
      componentProps: { item: item },
    });
    return await popover.present();
  }

  async sortBy(ev: any) {
    const popover = await this.popoverController.create({
      component: SortByDelivererComponent,
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
    if (this.totalSubs) {
      this.totalSubs.unsubscribe();
    }
    this.closeSubscription();
  }

  totalSubscription() {
    const snap$ = this.afs.doc(this.totalNumbers).valueChanges();
    this.totalSubs = snap$.subscribe((snap: any) => {
      this.total = Number(snap.count);
    });
  }

  closeSubscription() {
    try {
      if (this.suscription) {
        this.suscription.unsubscribe();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
    });
    toast.present();
  }

  async add(id?: string) {
    const modal = await this.modalController.create({
      component: AddDelivererComponent,
      componentProps: { id: id },
    });
    return await modal.present();
  }
}
