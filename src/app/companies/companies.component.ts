import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ModalController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AddCompanyComponent } from './add-company/add-company.component';
import { Subscription } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss'],
})
export class CompaniesComponent implements OnInit, OnDestroy {
  public docs: any[];
  isLoading = false;
  limit: number = 10;
  suscription: Subscription;

  constructor(
    private afs: AngularFirestore,
    private afStorage: AngularFireStorage,
    private modalController: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit(): void {}

  ngOnDestroy() {}

  // async  getFirts() {
  //   var first = this.afs.collection("companies").ref.orderBy("nameStr").limit(3);
  //   let paginate = first.get()
  //     .then((snapshot) => {
  //       console.log("first");
  //       console.log(snapshot.docs.map(e => e.data().name));
  //       console.log(snapshot.size);
  //       let last = snapshot.docs[snapshot.docs.length - 1];
  //       let next = this.afs.collection('companies').ref.orderBy('nameStr').startAfter(last.data().nameStr).limit(3);
  //       next.get().then(data => {
  //         console.log("next");
  //         console.log(data.docs.map(e => e.data().name));
  //       });
  //     });
  // }

  async search(ev: any) {
    let searchStr: string = String(ev.target.value).toLocaleLowerCase();
    if (searchStr.length >= 5) {
      this.isLoading = true;
      const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
      loadingOverlay.present();
      try {
        const snap = await this.afs
          .collection('companies')
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
    const snap$ = this.afs.collection('companies', (ref) => ref.orderBy('nameStr', 'asc').limit(100)).snapshotChanges();
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

  async add(id?: string) {
    const modal = await this.modalController.create({
      component: AddCompanyComponent,
      componentProps: { id: id },
    });
    return await modal.present();
  }

  async presentAlertConfirm(item: any) {
    const alert = await this.alertController.create({
      header: 'Eliminar empresa',
      message: `¿Está seguro de eliminar la empresa "${item.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.delete(item.id);
          },
        },
      ],
    });
    await alert.present();
  }

  async getData(id: string) {
    let data: any;
    try {
      const response = await this.afs.collection('companies').doc(id).ref.get();
      data = response.data();
    } catch (error) {
      this.presentToast('Ha ocurrido un error');
      console.error(error);
    }
    return data;
  }

  async deletePast(array: string[]) {
    let promises: Promise<any>[] = [];
    const storageRef = this.afStorage.storage.ref();
    array.forEach((element) => {
      promises.push(storageRef.child(element).delete());
    });
    await Promise.all(promises);
  }

  async delete(id: string): Promise<void> {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      const data = await this.getData(id);
      let imagesPath: string[] = [];
      imagesPath.push(data.image.main.path);
      imagesPath.push(data.image.thumbnail.path);
      imagesPath.push(data.image.list.path);
      this.deletePast(imagesPath);
      await this.afs.collection('companies').doc(id).delete();
      this.presentToast('Empresa eliminada correctamente');
    } catch (error) {
      console.error(error);
      this.presentToast('Ha ocurrido un error');
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
    });
    toast.present();
  }
}
