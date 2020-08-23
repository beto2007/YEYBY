import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore, CollectionReference, AngularFirestoreCollection, Query } from '@angular/fire/firestore';
import { ModalController, ToastController, PopoverController } from '@ionic/angular';
import { OptionsCompaniesComponent } from './options-companies/options-companies.component';
import { Subscription } from 'rxjs';
import { AddCompanyComponent } from './add-company/add-company.component';
import { SortByCompanyComponent } from './sort-by-company/sort-by-company.component';
import { CredentialsService } from '@app/auth';
import { Logger } from '@core';
const log = new Logger('CompaniesComponent');

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss'],
})
export class CompaniesComponent implements OnInit, OnDestroy {
  public skeleton: any[] = ['', '', '', '', '', ''];
  public arrayDocs: any[];
  public isLoading = false;
  private subscription: Subscription;
  private totalSubs: Subscription;
  public total: number = 0;
  public orderBy: string = 'nameStr';
  public orderByDirection: any = 'asc';
  private searchOrderBy: string = 'nameStr';
  private searchOorderByDirection: any = 'asc';
  private perPage: number = 50;
  private mainCollection: string = 'companies';
  private docNumbers: string = 'metadatas/companies';
  private startAfter: any;
  private endBefore: any;
  private startAt: any;
  public forward: boolean = false;
  public back: boolean = false;
  private searchStr: string;
  public title: any = {
    capitalLetter: {
      prural: 'Empresas',
      singular: 'Empresa',
    },
    lowerCase: {
      prural: 'empresas',
      singular: 'empresa',
    },
  };
  public mode: string = '';
  isAdmin: boolean = false;

  constructor(
    private afs: AngularFirestore,
    private toastController: ToastController,
    private popoverController: PopoverController,
    private modalController: ModalController,
    private credentialsService: CredentialsService
  ) {
    this.isAdmin =
      this.credentialsService &&
      this.credentialsService.credentials &&
      this.credentialsService.credentials.type &&
      this.credentialsService.credentials.type === 'admin'
        ? true
        : false;
  }

  async doSearch(ev: any) {
    this.isLoading = true;
    try {
      await this.search(ev);
    } catch (error) {
      log.error(error);
    }
    this.isLoading = false;
  }

  async initializeApp(direction?: string) {
    this.isLoading = true;
    this.searchStr = undefined;
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
    if (searchStr.length >= 3) {
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
      this.arrayDocs = snap.docs.map(async (element) => {
        const id: string = element.id;
        let data: any = element.data();
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
      component: OptionsCompaniesComponent,
      event: ev,
      translucent: true,
      componentProps: { item: item },
    });
    return await popover.present();
  }

  async sortBy(ev: any) {
    const popover = await this.popoverController.create({
      component: SortByCompanyComponent,
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
      log.error(error);
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 6000,
    });
    toast.present();
  }

  async add(id?: string) {
    const modal = await this.modalController.create({
      component: AddCompanyComponent,
      componentProps: { id: id },
    });
    return await modal.present();
  }

  closeModal() {
    this.modalController.dismiss();
  }

  selectItem(item: any) {
    this.modalController.dismiss({ item: item });
  }
}
