import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirebaseService } from '@app/@shared/services/firebase/firebase.service';

@Component({
  selector: 'app-detail-deliverer',
  templateUrl: './detail-deliverer.component.html',
  styleUrls: ['./detail-deliverer.component.scss'],
})
export class DetailDelivererComponent implements OnInit {
  error: string | undefined;
  isLoading = false;
  id: string | undefined;
  imageSrc: any;
  thumbnailSrc: any;
  middleSrc: any;
  file: File;
  imagesPath: string[] = [];

  dataDocument: AngularFirestoreDocument<any>;
  suscription: Subscription;
  data: any;

  constructor(
    private afs: AngularFirestore,
    private aRoute: ActivatedRoute,
    private alertController: AlertController,
    private myFire: FirebaseService
  ) {
    this.aRoute.params.subscribe((params) => {
      this.initializeApp(params.id);
    });
  }

  ngOnInit(): void {}

  initializeApp(id: string) {
    this.dataDocument = this.afs.collection('deliverers').doc(id);
    this.suscription = this.dataDocument.snapshotChanges().subscribe((snap) => {
      if (snap.payload.exists === true) {
        const data: any = snap.payload.data();
        const id: string = snap.payload.id;
        this.data = { id, ...data };
      }
    });
  }

  async generateOrderConfirm() {
    const alert = await this.alertController.create({
      header: 'Generar orden',
      message: `¿Está seguro de generar nueva orden?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Generar orden',
          handler: () => {
            this.myFire.createOrder(this.data.id, 'deliverer');
          },
        },
      ],
    });
    await alert.present();
  }
}
