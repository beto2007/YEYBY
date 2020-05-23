import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(
    private router: Router,
    private afs: AngularFirestore,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  async createOrder(id: string, type: 'company' | 'customer' | 'deliverer') {
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      let data: any = {};
      if (id && type === 'company') {
        const doc = await this.afs.collection('companies').doc(id).ref.get();
        const idStr: string = doc.id;
        data.company = { id: idStr, ...doc.data() };
      }
      if (id && type === 'customer') {
        const doc = await this.afs.collection('customers').doc(id).ref.get();
        const idStr: string = doc.id;
        data.customer = { id: idStr, ...doc.data() };
      }
      if (id && type === 'deliverer') {
        const doc = await this.afs.collection('deliverers').doc(id).ref.get();
        const idStr: string = doc.id;
        data.deliverer = { id: idStr, ...doc.data() };
      }
      const response: DocumentReference = await this.afs.collection('orders').add({
        company: data.company ? data.company : {},
        customer: data.customer ? data.customer : {},
        deliverer: data.deliverer ? data.deliverer : {},
        date: new Date(),
        startDate: new Date(),
        finishDate: new Date(),
        search: [],
        status: 'created',
      });
      if (response.id) {
        this.router.navigate(['/orders/' + response.id]);
      } else {
        this.presentToast('Ha ocurrido un error');
      }
    } catch (error) {
      this.presentToast('Ha ocurrido un error');
      console.error(error);
    }
    loadingOverlay.dismiss();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 6000,
    });
    toast.present();
  }

  async canStartOrder(id: string): Promise<boolean> {
    let ret: boolean = false;
    try {
      const response = await this.afs.collection('orders').doc(id).ref.get();
      const company: any | undefined = response.data().company;
      const deliverer: any | undefined = response.data().deliverer;
      if (company.id && deliverer.id) {
        await this.afs.collection('orders').doc(id).update({
          status: 'in-progress',
          startDate: new Date(),
        });
        ret = true;
      } else {
        ret = false;
      }
    } catch (error) {
      console.error(error);
      ret = false;
    }
    return ret;
  }
}
