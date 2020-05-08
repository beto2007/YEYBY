import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ModalController, LoadingController, ToastController, PopoverController } from '@ionic/angular';
import { OptionsDelivererComponent } from './options-deliverer/options-deliverer.component';
import { Subscription } from 'rxjs';
import { AddDelivererComponent } from './add-deliverer/add-deliverer.component';

@Component({
  selector: 'app-deliverers',
  templateUrl: './deliverers.component.html',
  styleUrls: ['./deliverers.component.scss'],
})
export class DeliverersComponent implements OnInit {
  public docs: any[];
  isLoading = false;
  limit: number = 10;
  suscription: Subscription;

  constructor(
    private afs: AngularFirestore,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private popoverController: PopoverController,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {}

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

  async search(ev: any) {
    let searchStr: string = String(ev.target.value).toLocaleLowerCase();
    if (searchStr.length >= 5) {
      this.isLoading = true;
      const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
      loadingOverlay.present();
      try {
        const snap = await this.afs
          .collection('deliverers')
          .ref.orderBy('nameStr', 'asc')
          .where('search', 'array-contains-any', [searchStr])
          .limit(20)
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

  ionViewDidEnter() {
    this.initializeApp();
  }

  ionViewDidLeave() {
    this.closeSubscription();
  }

  async initializeApp() {
    this.closeSubscription();
    const snap$ = this.afs
      .collection('deliverers', (ref) => ref.orderBy('nameStr', 'asc').limit(100))
      .snapshotChanges();
    this.suscription = snap$.subscribe(
      (snap) => {
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
