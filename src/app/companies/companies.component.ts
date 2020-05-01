import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ModalController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AddCompanyComponent } from './add-company/add-company.component';
import { from } from 'rxjs';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss'],
})
export class CompaniesComponent implements OnInit {
  public docs: any[];
  isLoading = false;

  constructor(
    private afs: AngularFirestore,
    private modalController: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit(): void {}

  ionViewDidEnter() {
    this.afs
      .collection('companies', (ref) => ref.orderBy('name', 'asc'))
      .snapshotChanges()
      .subscribe(
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

  async add() {
    const modal = await this.modalController.create({
      component: AddCompanyComponent,
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

  async delete(id: string): Promise<void> {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    from(loadingOverlay.present());
    try {
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
